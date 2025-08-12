// src/app/api/dashboard/evolution/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { z } from 'zod';

// Schéma de validation
const EvolutionRequestSchema = z.object({
  pharmacyIds: z.string()
    .transform(val => val ? val.split(',').map(id => id.trim()).filter(Boolean) : [])
    .pipe(z.array(z.string().uuid()).max(100))
    .optional(),
  brandLabs: z.string()
    .transform(val => val ? val.split(',').map(lab => lab.trim()).filter(Boolean) : [])
    .pipe(z.array(z.string().max(100)).max(50))
    .optional(),
  analysisPeriodStart: z.string().nullish(),
  analysisPeriodEnd: z.string().nullish(),
  comparisonPeriodStart: z.string().nullish(),
  comparisonPeriodEnd: z.string().nullish()
});

// Types
interface ChartDataPoint {
  period: string;
  sellIn: number | null;
  sellOut: number | null;
  marge: number | null;
  stock: number | null;
}

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Extraction et validation des paramètres
    const searchParams = request.nextUrl.searchParams;
    const rawParams = {
      pharmacyIds: searchParams.get('pharmacyIds') || '',
      brandLabs: searchParams.get('brandLabs') || '',
      analysisPeriodStart: searchParams.get('analysisPeriodStart'),
      analysisPeriodEnd: searchParams.get('analysisPeriodEnd'),
      comparisonPeriodStart: searchParams.get('comparisonPeriodStart'),
      comparisonPeriodEnd: searchParams.get('comparisonPeriodEnd')
    };
    
    const validated = EvolutionRequestSchema.parse(rawParams);
    
    // Détermination des périodes
    let currentStartDate: Date, currentEndDate: Date, previousStartDate: Date, previousEndDate: Date;
    
    if (validated.analysisPeriodStart && validated.analysisPeriodEnd) {
      currentStartDate = new Date(validated.analysisPeriodStart);
      currentEndDate = new Date(validated.analysisPeriodEnd);
      
      if (validated.comparisonPeriodStart && validated.comparisonPeriodEnd) {
        previousStartDate = new Date(validated.comparisonPeriodStart);
        previousEndDate = new Date(validated.comparisonPeriodEnd);
      } else {
        // Calcul auto de la période précédente
        const daysDiff = Math.round((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
        previousStartDate = new Date(currentStartDate);
        previousStartDate.setDate(previousStartDate.getDate() - daysDiff - 1);
        previousEndDate = new Date(currentEndDate);
        previousEndDate.setDate(previousEndDate.getDate() - daysDiff - 1);
      }
    } else {
      // Mode année par défaut (2025)
      const currentYear = new Date().getFullYear();
      currentStartDate = new Date(currentYear, 0, 1);
      currentEndDate = new Date(currentYear, 11, 31);
      previousStartDate = new Date(currentYear - 1, 0, 1);
      previousEndDate = new Date(currentYear - 1, 11, 31);
    }
    
    // Calcul de la durée pour déterminer le mode
    const monthsDiff = (currentEndDate.getFullYear() - currentStartDate.getFullYear()) * 12 + 
                      (currentEndDate.getMonth() - currentStartDate.getMonth()) + 1;
    const mode = monthsDiff > 12 ? 'quarterly' : 'monthly';
    
    // Construction de la requête selon le mode
    let query: string;
    let params: any[];
    
    if (mode === 'monthly') {
      // Requête simplifiée pour la période actuelle uniquement
      query = `
        WITH all_data AS (
          SELECT 
            COALESCE(si.year, so.year, st.year) as year,
            COALESCE(si.month, so.month, st.month) as month,
            SUM(si.ca_ht) as sellin,
            SUM(so.ca_ttc) as sellout,
            SUM(st.montant_valorise_achat) as stock
          FROM mv_ca_sellin_monthly si
          FULL OUTER JOIN mv_ca_sellout_monthly so 
            ON si.year = so.year 
            AND si.month = so.month
            AND si.pharmacy_id = so.pharmacy_id 
            AND si.brand_lab = so.brand_lab
          FULL OUTER JOIN mv_stock_monthly st
            ON COALESCE(si.year, so.year) = st.year 
            AND COALESCE(si.month, so.month) = st.month
            AND COALESCE(si.pharmacy_id, so.pharmacy_id) = st.pharmacy_id 
            AND COALESCE(si.brand_lab, so.brand_lab) = st.brand_lab
          WHERE 
            COALESCE(si.year, so.year, st.year) * 12 + COALESCE(si.month, so.month, st.month) 
              BETWEEN $3 * 12 + $4 AND $5 * 12 + $6
            AND ($1::uuid[] IS NULL OR COALESCE(si.pharmacy_id, so.pharmacy_id, st.pharmacy_id) = ANY($1))
            AND ($2::text[] IS NULL OR COALESCE(si.brand_lab, so.brand_lab, st.brand_lab) = ANY($2))
          GROUP BY COALESCE(si.year, so.year, st.year), COALESCE(si.month, so.month, st.month)
        ),
        comparison_totals AS (
          SELECT 
            COALESCE(SUM(si.ca_ht), 0) as prev_sellin,
            COALESCE(SUM(so.ca_ttc), 0) as prev_sellout,
            COALESCE(SUM(st.montant_valorise_achat), 0) as prev_stock
          FROM mv_ca_sellin_monthly si
          FULL OUTER JOIN mv_ca_sellout_monthly so 
            ON si.year = so.year 
            AND si.month = so.month
            AND si.pharmacy_id = so.pharmacy_id 
            AND si.brand_lab = so.brand_lab
          FULL OUTER JOIN mv_stock_monthly st
            ON COALESCE(si.year, so.year) = st.year 
            AND COALESCE(si.month, so.month) = st.month
            AND COALESCE(si.pharmacy_id, so.pharmacy_id) = st.pharmacy_id 
            AND COALESCE(si.brand_lab, so.brand_lab) = st.brand_lab
          WHERE 
            COALESCE(si.year, so.year, st.year) * 12 + COALESCE(si.month, so.month, st.month) 
              BETWEEN $7 * 12 + $8 AND $9 * 12 + $10
            AND ($1::uuid[] IS NULL OR COALESCE(si.pharmacy_id, so.pharmacy_id, st.pharmacy_id) = ANY($1))
            AND ($2::text[] IS NULL OR COALESCE(si.brand_lab, so.brand_lab, st.brand_lab) = ANY($2))
        )
        SELECT 
          TO_CHAR(TO_DATE(ad.month::text, 'MM'), 'TMmon') || 
          CASE 
            WHEN MIN(ad.year) <> MAX(ad.year) 
            THEN ' ' || SUBSTRING(ad.year::text, 3, 2)
            ELSE ''
          END as period,
          ad.sellin,
          ad.sellout,
          COALESCE(ad.sellout, 0) - COALESCE(ad.sellin, 0) as marge,
          ad.stock,
          ct.prev_sellin,
          ct.prev_sellout,
          ct.prev_stock
        FROM all_data ad
        CROSS JOIN comparison_totals ct
        GROUP BY ad.year, ad.month, ad.sellin, ad.sellout, ad.stock, 
                 ct.prev_sellin, ct.prev_sellout, ct.prev_stock
        ORDER BY ad.year, ad.month
      `;
    } else {
      // Mode trimestriel - période actuelle uniquement
      query = `
        WITH quarterly_data AS (
          SELECT 
            COALESCE(si.year, so.year, st.year) as year,
            CEIL(COALESCE(si.month, so.month, st.month)::numeric / 3)::INTEGER as quarter,
            SUM(si.ca_ht) as sellin,
            SUM(so.ca_ttc) as sellout,
            SUM(st.montant_valorise_achat) as stock
          FROM mv_ca_sellin_monthly si
          FULL OUTER JOIN mv_ca_sellout_monthly so 
            ON si.year = so.year 
            AND si.month = so.month
            AND si.pharmacy_id = so.pharmacy_id 
            AND si.brand_lab = so.brand_lab
          FULL OUTER JOIN mv_stock_monthly st
            ON COALESCE(si.year, so.year) = st.year 
            AND COALESCE(si.month, so.month) = st.month
            AND COALESCE(si.pharmacy_id, so.pharmacy_id) = st.pharmacy_id 
            AND COALESCE(si.brand_lab, so.brand_lab) = st.brand_lab
          WHERE 
            COALESCE(si.year, so.year, st.year) * 12 + COALESCE(si.month, so.month, st.month) 
              BETWEEN $3 * 12 + $4 AND $5 * 12 + $6
            AND ($1::uuid[] IS NULL OR COALESCE(si.pharmacy_id, so.pharmacy_id, st.pharmacy_id) = ANY($1))
            AND ($2::text[] IS NULL OR COALESCE(si.brand_lab, so.brand_lab, st.brand_lab) = ANY($2))
          GROUP BY COALESCE(si.year, so.year, st.year), quarter
        ),
        comparison_totals AS (
          SELECT 
            COALESCE(SUM(si.ca_ht), 0) as prev_sellin,
            COALESCE(SUM(so.ca_ttc), 0) as prev_sellout,
            COALESCE(SUM(st.montant_valorise_achat), 0) as prev_stock
          FROM mv_ca_sellin_monthly si
          FULL OUTER JOIN mv_ca_sellout_monthly so 
            ON si.year = so.year 
            AND si.month = so.month
            AND si.pharmacy_id = so.pharmacy_id 
            AND si.brand_lab = so.brand_lab
          FULL OUTER JOIN mv_stock_monthly st
            ON COALESCE(si.year, so.year) = st.year 
            AND COALESCE(si.month, so.month) = st.month
            AND COALESCE(si.pharmacy_id, so.pharmacy_id) = st.pharmacy_id 
            AND COALESCE(si.brand_lab, so.brand_lab) = st.brand_lab
          WHERE 
            COALESCE(si.year, so.year, st.year) * 12 + COALESCE(si.month, so.month, st.month) 
              BETWEEN $7 * 12 + $8 AND $9 * 12 + $10
            AND ($1::uuid[] IS NULL OR COALESCE(si.pharmacy_id, so.pharmacy_id, st.pharmacy_id) = ANY($1))
            AND ($2::text[] IS NULL OR COALESCE(si.brand_lab, so.brand_lab, st.brand_lab) = ANY($2))
        )
        SELECT 
          'Q' || qd.quarter || ' ' || SUBSTRING(qd.year::text, 3, 2) as period,
          qd.sellin,
          qd.sellout,
          COALESCE(qd.sellout, 0) - COALESCE(qd.sellin, 0) as marge,
          qd.stock,
          ct.prev_sellin,
          ct.prev_sellout,
          ct.prev_stock
        FROM quarterly_data qd
        CROSS JOIN comparison_totals ct
        ORDER BY qd.year, qd.quarter
      `;
    }
    
    params = [
      validated.pharmacyIds?.length ? validated.pharmacyIds : null,
      validated.brandLabs?.length ? validated.brandLabs : null,
      currentStartDate.getFullYear(),
      currentStartDate.getMonth() + 1,
      currentEndDate.getFullYear(),
      currentEndDate.getMonth() + 1,
      previousStartDate.getFullYear(),
      previousStartDate.getMonth() + 1,
      previousEndDate.getFullYear(),
      previousEndDate.getMonth() + 1
    ];
    
    // Exécution avec timeout adaptatif selon la période
    const timeoutDuration = monthsDiff > 36 ? 20000 : monthsDiff > 24 ? 15000 : monthsDiff > 12 ? 10000 : 5000;
    
    console.log(`Evolution query - Mode: ${mode}, Months: ${monthsDiff}, Timeout: ${timeoutDuration}ms`);
    
    const queryPromise = pool.query(query, params);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Query timeout after ${timeoutDuration}ms`)), timeoutDuration)
    );
    
    const result = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    // Récupération des totaux de comparaison depuis la première ligne
    const comparisonTotals = result.rows.length > 0 ? {
      prevSellin: parseFloat(result.rows[0].prev_sellin || 0),
      prevSellout: parseFloat(result.rows[0].prev_sellout || 0),
      prevStock: parseFloat(result.rows[0].prev_stock || 0)
    } : { prevSellin: 0, prevSellout: 0, prevStock: 0 };
    
    // Transformation des données pour le graphique
    const chartData: ChartDataPoint[] = result.rows.map((row: any) => ({
      period: row.period,
      sellIn: row.sellin ? parseFloat(row.sellin) : null,
      sellOut: row.sellout ? parseFloat(row.sellout) : null,
      marge: row.marge ? parseFloat(row.marge) : null,
      stock: row.stock ? parseFloat(row.stock) : null
    }));
    
    // Calcul des insights
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return '0%';
      const growth = ((current - previous) / previous) * 100;
      return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
    };
    
    const currentTotals = chartData.reduce((acc, d) => ({
      sellIn: acc.sellIn + (d.sellIn || 0),
      sellOut: acc.sellOut + (d.sellOut || 0),
      marge: acc.marge + (d.marge || 0),
      stock: d.stock || acc.stock // Dernier stock non null
    }), { sellIn: 0, sellOut: 0, marge: 0, stock: 0 });
    
    const insights = {
      croissanceSellIn: calculateGrowth(currentTotals.sellIn, comparisonTotals.prevSellin),
      croissanceSellOut: calculateGrowth(currentTotals.sellOut, comparisonTotals.prevSellout),
      croissanceMarge: calculateGrowth(currentTotals.marge, comparisonTotals.prevSellout - comparisonTotals.prevSellin),
      croissanceStock: calculateGrowth(currentTotals.stock, comparisonTotals.prevStock)
    };
    
    const executionTime = performance.now() - startTime;
    
    // Log performance si > 500ms
    if (executionTime > 500) {
      console.warn(`Evolution calculation took ${executionTime.toFixed(0)}ms`, {
        filters: { 
          pharmacyIds: validated.pharmacyIds?.length || 0, 
          brandLabs: validated.brandLabs?.length || 0 
        },
        mode,
        monthsDiff
      });
    }
    
    return NextResponse.json({
      success: true,
      data: chartData,
      mode,
      insights,
      executionTime: Math.round(executionTime),
      filters: {
        pharmacyIds: validated.pharmacyIds?.length || 0,
        brandLabs: validated.brandLabs?.length || 0,
        period: {
          current: `${currentStartDate.toISOString().split('T')[0]} - ${currentEndDate.toISOString().split('T')[0]}`,
          previous: `${previousStartDate.toISOString().split('T')[0]} - ${previousEndDate.toISOString().split('T')[0]}`
        }
      }
    });
    
  } catch (error) {
    console.error('Evolution API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid parameters',
          details: error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
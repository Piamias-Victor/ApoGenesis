// src/app/api/dashboard/kpis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { z } from 'zod';

// Schéma de validation strict
const KPIRequestSchema = z.object({
  year: z.number().min(2020).max(2030).optional().default(2025),
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

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Extraction et validation des paramètres
    const searchParams = request.nextUrl.searchParams;
    const rawParams = {
      year: parseInt(searchParams.get('year') || '2025'),
      pharmacyIds: searchParams.get('pharmacyIds') || searchParams.get('pharmacyId') || '',
      brandLabs: searchParams.get('brandLabs') || searchParams.get('brandLab') || '',
      analysisPeriodStart: searchParams.get('analysisPeriodStart'),
      analysisPeriodEnd: searchParams.get('analysisPeriodEnd'),
      comparisonPeriodStart: searchParams.get('comparisonPeriodStart'),
      comparisonPeriodEnd: searchParams.get('comparisonPeriodEnd')
    };
    
    // Validation avec Zod
    const validated = KPIRequestSchema.parse(rawParams);
    
    // Détermination des périodes
    const useDateFilters = validated.analysisPeriodStart && validated.analysisPeriodEnd;
    let currentStartDate: Date, currentEndDate: Date, previousStartDate: Date, previousEndDate: Date;
    
    if (useDateFilters && validated.analysisPeriodStart && validated.analysisPeriodEnd) {
      // Vérification supplémentaire pour TypeScript
      currentStartDate = new Date(validated.analysisPeriodStart);
      currentEndDate = new Date(validated.analysisPeriodEnd);
      
      if (!validated.comparisonPeriodStart || !validated.comparisonPeriodEnd) {
        // Calcul automatique de la période de comparaison si non fournie
        const daysDiff = (currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24);
        previousStartDate = new Date(currentStartDate);
        previousStartDate.setDate(previousStartDate.getDate() - Math.round(daysDiff) - 1);
        previousEndDate = new Date(currentEndDate);
        previousEndDate.setDate(previousEndDate.getDate() - Math.round(daysDiff) - 1);
      } else {
        previousStartDate = new Date(validated.comparisonPeriodStart);
        previousEndDate = new Date(validated.comparisonPeriodEnd);
      }
    } else {
      // Mode année
      currentStartDate = new Date(validated.year, 0, 1);
      currentEndDate = new Date(validated.year, 11, 31);
      previousStartDate = new Date(validated.year - 1, 0, 1);
      previousEndDate = new Date(validated.year - 1, 11, 31);
    }
    
    // Construction requête simplifiée et directe
    const query = `
      SELECT 
        -- Période actuelle
        (SELECT COALESCE(SUM(ca_ht), 0) 
         FROM mv_ca_sellin_monthly
         WHERE year BETWEEN $3 AND $5
           AND month >= CASE WHEN year = $3 THEN $4 ELSE 1 END
           AND month <= CASE WHEN year = $5 THEN $6 ELSE 12 END
           AND ($1::uuid[] IS NULL OR pharmacy_id = ANY($1))
           AND ($2::text[] IS NULL OR brand_lab = ANY($2))) as current_sellin,
           
        (SELECT COALESCE(SUM(ca_ttc), 0) 
         FROM mv_ca_sellout_monthly
         WHERE year BETWEEN $3 AND $5
           AND month >= CASE WHEN year = $3 THEN $4 ELSE 1 END
           AND month <= CASE WHEN year = $5 THEN $6 ELSE 12 END
           AND ($1::uuid[] IS NULL OR pharmacy_id = ANY($1))
           AND ($2::text[] IS NULL OR brand_lab = ANY($2))) as current_sellout,
           
        (SELECT COALESCE(SUM(montant_valorise_achat), 0) 
         FROM mv_stock_monthly
         WHERE year BETWEEN $3 AND $5
           AND month >= CASE WHEN year = $3 THEN $4 ELSE 1 END
           AND month <= CASE WHEN year = $5 THEN $6 ELSE 12 END
           AND ($1::uuid[] IS NULL OR pharmacy_id = ANY($1))
           AND ($2::text[] IS NULL OR brand_lab = ANY($2))) as current_stock,
           
        -- Période précédente
        (SELECT COALESCE(SUM(ca_ht), 0) 
         FROM mv_ca_sellin_monthly
         WHERE year BETWEEN $7 AND $9
           AND month >= CASE WHEN year = $7 THEN $8 ELSE 1 END
           AND month <= CASE WHEN year = $9 THEN $10 ELSE 12 END
           AND ($1::uuid[] IS NULL OR pharmacy_id = ANY($1))
           AND ($2::text[] IS NULL OR brand_lab = ANY($2))) as prev_sellin,
           
        (SELECT COALESCE(SUM(ca_ttc), 0) 
         FROM mv_ca_sellout_monthly
         WHERE year BETWEEN $7 AND $9
           AND month >= CASE WHEN year = $7 THEN $8 ELSE 1 END
           AND month <= CASE WHEN year = $9 THEN $10 ELSE 12 END
           AND ($1::uuid[] IS NULL OR pharmacy_id = ANY($1))
           AND ($2::text[] IS NULL OR brand_lab = ANY($2))) as prev_sellout,
           
        (SELECT COALESCE(SUM(montant_valorise_achat), 0) 
         FROM mv_stock_monthly
         WHERE year BETWEEN $7 AND $9
           AND month >= CASE WHEN year = $7 THEN $8 ELSE 1 END
           AND month <= CASE WHEN year = $9 THEN $10 ELSE 12 END
           AND ($1::uuid[] IS NULL OR pharmacy_id = ANY($1))
           AND ($2::text[] IS NULL OR brand_lab = ANY($2))) as prev_stock,
           
        -- Comptage des mois (simplifié)
        1 as current_months,
        1 as prev_months
    `;
    
    // Paramètres pour la requête
    const params = [
      validated.pharmacyIds?.length ? validated.pharmacyIds : null,  // $1
      validated.brandLabs?.length ? validated.brandLabs : null,     // $2
      currentStartDate.getFullYear(),    // $3
      currentStartDate.getMonth() + 1,   // $4
      currentEndDate.getFullYear(),      // $5
      currentEndDate.getMonth() + 1,     // $6
      previousStartDate.getFullYear(),   // $7
      previousStartDate.getMonth() + 1,  // $8
      previousEndDate.getFullYear(),     // $9
      previousEndDate.getMonth() + 1     // $10
    ];
    
    // Exécution avec timeout
    const queryPromise = pool.query(query, params);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 5000)
    );
    
    const result = await Promise.race([queryPromise, timeoutPromise]) as any;
    const row = result.rows[0];
    
    // Calcul des KPIs
    const kpis = {
      ca_sellin: {
        value: formatCurrency(row.current_sellin),
        rawValue: parseFloat(row.current_sellin),
        evolution: calculateEvolution(row.current_sellin, row.prev_sellin),
        evolutionPct: calculateEvolutionPct(row.current_sellin, row.prev_sellin),
        trend: getTrend(row.current_sellin, row.prev_sellin),
        label: useDateFilters ? 'vs période précédente' : 'vs année précédente'
      },
      ca_sellout: {
        value: formatCurrency(row.current_sellout),
        rawValue: parseFloat(row.current_sellout),
        evolution: calculateEvolution(row.current_sellout, row.prev_sellout),
        evolutionPct: calculateEvolutionPct(row.current_sellout, row.prev_sellout),
        trend: getTrend(row.current_sellout, row.prev_sellout),
        label: useDateFilters ? 'vs période précédente' : 'vs année précédente'
      },
      marge_brute: {
        value: formatCurrency(row.current_sellout - row.current_sellin),
        rawValue: row.current_sellout - row.current_sellin,
        evolution: calculateEvolution(
          row.current_sellout - row.current_sellin,
          row.prev_sellout - row.prev_sellin
        ),
        evolutionPct: calculateEvolutionPct(
          row.current_sellout - row.current_sellin,
          row.prev_sellout - row.prev_sellin
        ),
        trend: getTrend(
          row.current_sellout - row.current_sellin,
          row.prev_sellout - row.prev_sellin
        ),
        label: 'rentabilité'
      },
      stock_valorise: {
        value: formatCurrency(row.current_stock),
        rawValue: parseFloat(row.current_stock),
        evolution: calculateEvolution(row.current_stock, row.prev_stock),
        evolutionPct: calculateEvolutionPct(row.current_stock, row.prev_stock),
        trend: getTrend(row.current_stock, row.prev_stock),
        label: 'optimal'
      },
      rotation_stock: {
        value: row.current_stock > 0 ? 
          `${(row.current_sellout / row.current_stock).toFixed(1)}x/an` : '0x/an',
        rawValue: row.current_stock > 0 ? row.current_sellout / row.current_stock : 0,
        evolution: formatRotationEvolution(
          row.current_stock > 0 ? row.current_sellout / row.current_stock : 0,
          row.prev_stock > 0 ? row.prev_sellout / row.prev_stock : 0
        ),
        evolutionPct: calculateEvolutionPct(
          row.current_stock > 0 ? row.current_sellout / row.current_stock : 0,
          row.prev_stock > 0 ? row.prev_sellout / row.prev_stock : 0
        ),
        trend: getTrend(
          row.current_stock > 0 ? row.current_sellout / row.current_stock : 0,
          row.prev_stock > 0 ? row.prev_sellout / row.prev_stock : 0
        ),
        label: 'performance'
      },
      couverture_stock: {
        value: calculateCouverture(row.current_stock, row.current_sellout, row.current_months),
        rawValue: row.current_sellout > 0 ? 
          (row.current_stock / (row.current_sellout / row.current_months)) * 30 : 0,
        evolution: formatCouvertureEvolution(
          row.current_stock, row.current_sellout, row.current_months,
          row.prev_stock, row.prev_sellout, row.prev_months
        ),
        evolutionPct: 0,
        trend: 'neutral',
        label: 'optimal'
      }
    };
    
    const executionTime = performance.now() - startTime;
    
    // Log performance si > 500ms
    if (executionTime > 500) {
      console.warn(`KPI calculation took ${executionTime.toFixed(0)}ms`, {
        filters: { pharmacyIds: validated.pharmacyIds?.length, brandLabs: validated.brandLabs?.length }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: kpis,
      executionTime: Math.round(executionTime),
      filters: {
        pharmacyIds: validated.pharmacyIds?.length || 0,
        brandLabs: validated.brandLabs?.length || 0
      }
    });
    
  } catch (error) {
    console.error('KPI Error:', error);
    
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

// Fonctions utilitaires
function formatCurrency(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M €`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K €`;
  return `${Math.round(value)} €`;
}

function calculateEvolution(current: number, previous: number): string {
  if (!previous) return '0%';
  const pct = ((current - previous) / previous) * 100;
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
}

function calculateEvolutionPct(current: number, previous: number): number {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

function getTrend(current: number, previous: number): 'positive' | 'negative' | 'neutral' {
  if (current > previous) return 'positive';
  if (current < previous) return 'negative';
  return 'neutral';
}

function formatRotationEvolution(current: number, previous: number): string {
  const diff = current - previous;
  return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}x`;
}

function calculateCouverture(stock: number, sellout: number, months: number): string {
  if (!sellout || !months) return '0 jours';
  const days = (stock / (sellout / months)) * 30;
  return `${Math.round(days)} jours`;
}

function formatCouvertureEvolution(
  currentStock: number, currentSellout: number, currentMonths: number,
  prevStock: number, prevSellout: number, prevMonths: number
): string {
  const current = currentSellout > 0 ? (currentStock / (currentSellout / currentMonths)) * 30 : 0;
  const previous = prevSellout > 0 ? (prevStock / (prevSellout / prevMonths)) * 30 : 0;
  const diff = current - previous;
  return `${diff > 0 ? '+' : ''}${Math.round(diff)}j`;
}
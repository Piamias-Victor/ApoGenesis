// src/app/api/dashboard/kpis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = parseInt(searchParams.get('year') || '2025');
  const previousYear = year - 1;
  
  // Support des deux formats pour la rétrocompatibilité
  const pharmacyIds = searchParams.get('pharmacyIds') || searchParams.get('pharmacyId');
  const brandLabs = searchParams.get('brandLabs') || searchParams.get('brandLab');
  
  try {
    console.log('Fetching KPIs from MVs...', { year, previousYear, pharmacyIds, brandLabs });
    
    // Construction des conditions WHERE sous forme de strings
    let whereConditions = 'WHERE year = $1';
    let whereConditionsPrevious = 'WHERE year = $2';
    const params: any[] = [year, previousYear];
    
    // Gestion des filtres
    if (pharmacyIds) {
      const pharmacyIdArray = pharmacyIds.split(',');
      // On ajoute la condition directement avec les valeurs
      const pharmacyList = pharmacyIdArray.map(id => `'${id}'`).join(',');
      whereConditions += ` AND pharmacy_id::text IN (${pharmacyList})`;
      whereConditionsPrevious += ` AND pharmacy_id::text IN (${pharmacyList})`;
    }
    
    if (brandLabs) {
      const brandLabArray = brandLabs.split(',');
      // On ajoute la condition directement avec les valeurs
      const brandList = brandLabArray.map(lab => `'${lab.replace(/'/g, "''")}'`).join(',');
      whereConditions += ` AND brand_lab IN (${brandList})`;
      whereConditionsPrevious += ` AND brand_lab IN (${brandList})`;
    }
    
    const query = `
      WITH kpi_data AS (
        -- CA Sell-In
        SELECT 
            'ca_sellin' AS kpi_name,
            (SELECT COALESCE(SUM(ca_ht), 0) 
             FROM mv_ca_sellin_monthly 
             ${whereConditions}) AS valeur_actuelle,
            (SELECT COALESCE(SUM(ca_ht), 0) 
             FROM mv_ca_sellin_monthly 
             ${whereConditionsPrevious}) AS valeur_precedente
        
        UNION ALL
        
        -- CA Sell-Out
        SELECT 
            'ca_sellout' AS kpi_name,
            (SELECT COALESCE(SUM(ca_ttc), 0) 
             FROM mv_ca_sellout_monthly 
             ${whereConditions}) AS valeur_actuelle,
            (SELECT COALESCE(SUM(ca_ttc), 0) 
             FROM mv_ca_sellout_monthly 
             ${whereConditionsPrevious}) AS valeur_precedente
        
        UNION ALL
        
        -- Marge Brute
        SELECT 
            'marge_brute' AS kpi_name,
            (SELECT COALESCE(SUM(ca_ttc), 0) 
             FROM mv_ca_sellout_monthly 
             ${whereConditions}) -
            (SELECT COALESCE(SUM(ca_ht), 0) 
             FROM mv_ca_sellin_monthly 
             ${whereConditions}) AS valeur_actuelle,
            (SELECT COALESCE(SUM(ca_ttc), 0) 
             FROM mv_ca_sellout_monthly 
             ${whereConditionsPrevious}) -
            (SELECT COALESCE(SUM(ca_ht), 0) 
             FROM mv_ca_sellin_monthly 
             ${whereConditionsPrevious}) AS valeur_precedente
        
        UNION ALL
        
        -- Stock Valorisé (dernier mois disponible)
        SELECT 
            'stock_valorise' AS kpi_name,
            (SELECT COALESCE(SUM(montant_valorise_achat), 0) 
             FROM mv_stock_monthly 
             ${whereConditions}
             AND month = (SELECT MAX(month) FROM mv_stock_monthly WHERE year = $1)) AS valeur_actuelle,
            (SELECT COALESCE(SUM(montant_valorise_achat), 0) 
             FROM mv_stock_monthly 
             ${whereConditionsPrevious}
             AND month = (SELECT COALESCE(MAX(month), 12) FROM mv_stock_monthly WHERE year = $2)) AS valeur_precedente
        
        UNION ALL
        
        -- Rotation des stocks
        SELECT 
            'rotation_stock' AS kpi_name,
            CASE 
                WHEN (SELECT AVG(stock_mensuel) FROM (
                    SELECT SUM(montant_valorise_achat) AS stock_mensuel
                    FROM mv_stock_monthly 
                    ${whereConditions}
                    GROUP BY month
                ) s) > 0
                THEN (SELECT SUM(ca_ttc) 
                      FROM mv_ca_sellout_monthly 
                      ${whereConditions}) / 
                     (SELECT AVG(stock_mensuel) FROM (
                        SELECT SUM(montant_valorise_achat) AS stock_mensuel
                        FROM mv_stock_monthly 
                        ${whereConditions}
                        GROUP BY month
                     ) s)
                ELSE 0
            END AS valeur_actuelle,
            CASE 
                WHEN (SELECT AVG(stock_mensuel) FROM (
                    SELECT SUM(montant_valorise_achat) AS stock_mensuel
                    FROM mv_stock_monthly 
                    ${whereConditionsPrevious}
                    GROUP BY month
                ) s) > 0
                THEN (SELECT SUM(ca_ttc) 
                      FROM mv_ca_sellout_monthly 
                      ${whereConditionsPrevious}) / 
                     (SELECT AVG(stock_mensuel) FROM (
                        SELECT SUM(montant_valorise_achat) AS stock_mensuel
                        FROM mv_stock_monthly 
                        ${whereConditionsPrevious}
                        GROUP BY month
                     ) s)
                ELSE 0
            END AS valeur_precedente
        
        UNION ALL
        
        -- Couverture de stock (en jours)
        SELECT 
            'couverture_stock' AS kpi_name,
            CASE 
                WHEN (SELECT SUM(ca_ttc) / 365.0 
                      FROM mv_ca_sellout_monthly 
                      ${whereConditions}) > 0
                THEN (SELECT SUM(montant_valorise_achat) 
                      FROM mv_stock_monthly 
                      ${whereConditions}
                      AND month = (SELECT MAX(month) FROM mv_stock_monthly WHERE year = $1)) / 
                     (SELECT SUM(ca_ttc) / 365.0 
                      FROM mv_ca_sellout_monthly 
                      ${whereConditions})
                ELSE 0
            END AS valeur_actuelle,
            CASE 
                WHEN (SELECT SUM(ca_ttc) / 365.0 
                      FROM mv_ca_sellout_monthly 
                      ${whereConditionsPrevious}) > 0
                THEN (SELECT SUM(montant_valorise_achat) 
                      FROM mv_stock_monthly 
                      ${whereConditionsPrevious}
                      AND month = (SELECT COALESCE(MAX(month), 12) FROM mv_stock_monthly WHERE year = $2)) / 
                     (SELECT SUM(ca_ttc) / 365.0 
                      FROM mv_ca_sellout_monthly 
                      ${whereConditionsPrevious})
                ELSE 0
            END AS valeur_precedente
      )
      SELECT 
          kpi_name,
          valeur_actuelle,
          valeur_precedente,
          ROUND(((valeur_actuelle - valeur_precedente) / NULLIF(valeur_precedente, 0)) * 100, 1) AS evolution_pct
      FROM kpi_data
      ORDER BY 
          CASE kpi_name
              WHEN 'ca_sellin' THEN 1
              WHEN 'ca_sellout' THEN 2
              WHEN 'marge_brute' THEN 3
              WHEN 'stock_valorise' THEN 4
              WHEN 'rotation_stock' THEN 5
              WHEN 'couverture_stock' THEN 6
          END
    `;

    // Exécution de la requête avec seulement les années comme paramètres
    const result = await pool.query(query, params);
    
    // Transformer les résultats en objet structuré
    const kpis = result.rows.reduce((acc: any, row: any) => {
      const evolution = parseFloat(row.evolution_pct) || 0;
      const currentValue = parseFloat(row.valeur_actuelle) || 0;
      const previousValue = parseFloat(row.valeur_precedente) || 0;
      
      acc[row.kpi_name] = {
        value: currentValue,
        previousValue: previousValue,
        evolution: evolution,
        trend: evolution > 0 ? 'positive' : evolution < 0 ? 'negative' : 'neutral'
      };
      
      return acc;
    }, {});

    // Vérifier que tous les KPIs sont présents
    const requiredKpis = ['ca_sellin', 'ca_sellout', 'marge_brute', 'stock_valorise', 'rotation_stock', 'couverture_stock'];
    for (const kpi of requiredKpis) {
      if (!kpis[kpi]) {
        kpis[kpi] = {
          value: 0,
          previousValue: 0,
          evolution: 0,
          trend: 'neutral'
        };
      }
    }

    // Formatage spécifique pour chaque KPI
    const formattedData = {
      ca_sellin: {
        value: formatCurrency(kpis.ca_sellin.value),
        rawValue: kpis.ca_sellin.value,
        evolution: formatEvolution(kpis.ca_sellin.evolution),
        evolutionPct: kpis.ca_sellin.evolution,
        trend: kpis.ca_sellin.trend,
        label: 'vs année précédente'
      },
      ca_sellout: {
        value: formatCurrency(kpis.ca_sellout.value),
        rawValue: kpis.ca_sellout.value,
        evolution: formatEvolution(kpis.ca_sellout.evolution),
        evolutionPct: kpis.ca_sellout.evolution,
        trend: kpis.ca_sellout.trend,
        label: 'vs année précédente'
      },
      marge_brute: {
        value: formatCurrency(kpis.marge_brute.value),
        rawValue: kpis.marge_brute.value,
        evolution: formatEvolution(kpis.marge_brute.evolution),
        evolutionPct: kpis.marge_brute.evolution,
        trend: kpis.marge_brute.trend,
        label: 'rentabilité'
      },
      stock_valorise: {
        value: formatCurrency(kpis.stock_valorise.value),
        rawValue: kpis.stock_valorise.value,
        evolution: formatEvolution(kpis.stock_valorise.evolution),
        evolutionPct: kpis.stock_valorise.evolution,
        trend: kpis.stock_valorise.trend,
        label: 'optimal'
      },
      rotation_stock: {
        value: `${parseFloat(kpis.rotation_stock.value || 0).toFixed(1)}x/an`,
        rawValue: parseFloat(kpis.rotation_stock.value || 0),
        evolution: `${kpis.rotation_stock.evolution > 0 ? '+' : ''}${(parseFloat(kpis.rotation_stock.value || 0) - parseFloat(kpis.rotation_stock.previousValue || 0)).toFixed(1)}x`,
        evolutionPct: kpis.rotation_stock.evolution,
        trend: kpis.rotation_stock.trend,
        label: 'performance'
      },
      couverture_stock: {
        value: `${Math.round(parseFloat(kpis.couverture_stock.value || 0))} jours`,
        rawValue: parseFloat(kpis.couverture_stock.value || 0),
        evolution: `${kpis.couverture_stock.evolution > 0 ? '+' : ''}${Math.round(parseFloat(kpis.couverture_stock.value || 0) - parseFloat(kpis.couverture_stock.previousValue || 0))}j`,
        evolutionPct: kpis.couverture_stock.evolution,
        trend: parseFloat(kpis.couverture_stock.value || 0) < parseFloat(kpis.couverture_stock.previousValue || 1) ? 'positive' : 'negative', // Inversé car moins = mieux
        label: 'optimal'
      }
    };

    return NextResponse.json({
      success: true,
      year: year,
      previousYear: previousYear,
      filters: {
        pharmacyIds: pharmacyIds || 'all',
        brandLabs: brandLabs || 'all'
      },
      data: formattedData
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des KPIs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des KPIs'
      },
      { status: 500 }
    );
  }
}

// Fonctions utilitaires
function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0 €';
  
  if (numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(1)}M €`;
  } else if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(0)}K €`;
  }
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue) + ' €';
}

function formatEvolution(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue) || numValue === 0) return '0%';
  return `${numValue > 0 ? '+' : ''}${numValue.toFixed(1)}%`;
}
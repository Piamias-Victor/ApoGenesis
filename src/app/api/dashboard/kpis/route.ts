// src/app/api/dashboard/kpis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Récupération des paramètres de date
  const analysisPeriodStart = searchParams.get('analysisPeriodStart');
  const analysisPeriodEnd = searchParams.get('analysisPeriodEnd');
  const comparisonPeriodStart = searchParams.get('comparisonPeriodStart');
  const comparisonPeriodEnd = searchParams.get('comparisonPeriodEnd');
  
  // Fallback sur année si pas de dates fournies
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
  const previousYear = year - 1;
  
  // Support des filtres existants
  const pharmacyIds = searchParams.get('pharmacyIds') || searchParams.get('pharmacyId');
  const brandLabs = searchParams.get('brandLabs') || searchParams.get('brandLab');
  
  try {
    // Déterminer si on utilise les dates ou les années
    const useDateFilters = analysisPeriodStart && analysisPeriodEnd;
    
    // Extraction des mois et années depuis les dates
    let currentStartDate: Date, currentEndDate: Date, previousStartDate: Date, previousEndDate: Date;
    
    if (useDateFilters) {
      currentStartDate = new Date(analysisPeriodStart);
      currentEndDate = new Date(analysisPeriodEnd);
      previousStartDate = new Date(comparisonPeriodStart!);
      previousEndDate = new Date(comparisonPeriodEnd!);
    } else {
      currentStartDate = new Date(year, 0, 1);
      currentEndDate = new Date(year, 11, 31);
      previousStartDate = new Date(previousYear, 0, 1);
      previousEndDate = new Date(previousYear, 11, 31);
    }
    
    console.log('Fetching KPIs with filters:', { 
      currentPeriod: { start: currentStartDate, end: currentEndDate },
      previousPeriod: { start: previousStartDate, end: previousEndDate },
      pharmacyIds, 
      brandLabs 
    });
    
    // Construire les conditions WHERE pour les MV monthly
    let whereConditionsCurrent = '';
    let whereConditionsPrevious = '';
    const params: any[] = [];
    
    if (useDateFilters) {
      // Pour les filtres par date, on filtre par année et mois
      const currentStartYear = currentStartDate.getFullYear();
      const currentStartMonth = currentStartDate.getMonth() + 1;
      const currentEndYear = currentEndDate.getFullYear();
      const currentEndMonth = currentEndDate.getMonth() + 1;
      
      const previousStartYear = previousStartDate.getFullYear();
      const previousStartMonth = previousStartDate.getMonth() + 1;
      const previousEndYear = previousEndDate.getFullYear();
      const previousEndMonth = previousEndDate.getMonth() + 1;
      
      whereConditionsCurrent = `WHERE ((year = ${currentStartYear} AND month >= ${currentStartMonth}) OR year > ${currentStartYear}) 
                                AND ((year = ${currentEndYear} AND month <= ${currentEndMonth}) OR year < ${currentEndYear})`;
      whereConditionsPrevious = `WHERE ((year = ${previousStartYear} AND month >= ${previousStartMonth}) OR year > ${previousStartYear}) 
                                 AND ((year = ${previousEndYear} AND month <= ${previousEndMonth}) OR year < ${previousEndYear})`;
    } else {
      // Mode année classique
      whereConditionsCurrent = 'WHERE year = $1';
      whereConditionsPrevious = 'WHERE year = $2';
      params.push(year, previousYear);
    }
    
    // Ajouter les filtres pharmacies et labos
    if (pharmacyIds) {
      const pharmacyIdArray = pharmacyIds.split(',');
      const pharmacyList = pharmacyIdArray.map(id => `'${id}'`).join(',');
      whereConditionsCurrent += ` AND pharmacy_id::text IN (${pharmacyList})`;
      whereConditionsPrevious += ` AND pharmacy_id::text IN (${pharmacyList})`;
    }
    
    if (brandLabs) {
      const brandLabArray = brandLabs.split(',');
      const brandList = brandLabArray.map(lab => `'${lab.replace(/'/g, "''")}'`).join(',');
      whereConditionsCurrent += ` AND brand_lab IN (${brandList})`;
      whereConditionsPrevious += ` AND brand_lab IN (${brandList})`;
    }
    
    const query = `
      WITH kpi_data AS (
        -- CA Sell-In
        SELECT 
            'ca_sellin' AS kpi_name,
            (SELECT COALESCE(SUM(ca_ht), 0) 
             FROM mv_ca_sellin_monthly 
             ${whereConditionsCurrent}) AS valeur_actuelle,
            (SELECT COALESCE(SUM(ca_ht), 0) 
             FROM mv_ca_sellin_monthly 
             ${whereConditionsPrevious}) AS valeur_precedente
        
        UNION ALL
        
        -- CA Sell-Out
        SELECT 
            'ca_sellout' AS kpi_name,
            (SELECT COALESCE(SUM(ca_ttc), 0) 
             FROM mv_ca_sellout_monthly 
             ${whereConditionsCurrent}) AS valeur_actuelle,
            (SELECT COALESCE(SUM(ca_ttc), 0) 
             FROM mv_ca_sellout_monthly 
             ${whereConditionsPrevious}) AS valeur_precedente
        
        UNION ALL
        
        -- Marge Brute
        SELECT 
            'marge_brute' AS kpi_name,
            (SELECT COALESCE(SUM(ca_ttc), 0) 
             FROM mv_ca_sellout_monthly 
             ${whereConditionsCurrent}) -
            (SELECT COALESCE(SUM(ca_ht), 0) 
             FROM mv_ca_sellin_monthly 
             ${whereConditionsCurrent}) AS valeur_actuelle,
            (SELECT COALESCE(SUM(ca_ttc), 0) 
             FROM mv_ca_sellout_monthly 
             ${whereConditionsPrevious}) -
            (SELECT COALESCE(SUM(ca_ht), 0) 
             FROM mv_ca_sellin_monthly 
             ${whereConditionsPrevious}) AS valeur_precedente
        
        UNION ALL
        
        -- Stock Valorisé (dernier mois de la période)
        SELECT 
            'stock_valorise' AS kpi_name,
            (SELECT COALESCE(SUM(montant_valorise_achat), 0) 
             FROM mv_stock_monthly 
             ${whereConditionsCurrent}
             AND (year, month) = (
               SELECT year, month 
               FROM mv_stock_monthly 
               ${whereConditionsCurrent}
               ORDER BY year DESC, month DESC 
               LIMIT 1
             )) AS valeur_actuelle,
            (SELECT COALESCE(SUM(montant_valorise_achat), 0) 
             FROM mv_stock_monthly 
             ${whereConditionsPrevious}
             AND (year, month) = (
               SELECT year, month 
               FROM mv_stock_monthly 
               ${whereConditionsPrevious}
               ORDER BY year DESC, month DESC 
               LIMIT 1
             )) AS valeur_precedente
        
        UNION ALL
        
        -- Rotation des stocks
        SELECT 
            'rotation_stock' AS kpi_name,
            CASE 
                WHEN (SELECT AVG(stock_mensuel) FROM (
                    SELECT SUM(montant_valorise_achat) AS stock_mensuel
                    FROM mv_stock_monthly 
                    ${whereConditionsCurrent}
                    GROUP BY year, month
                ) s) > 0
                THEN (SELECT SUM(ca_ttc) 
                      FROM mv_ca_sellout_monthly 
                      ${whereConditionsCurrent}) / 
                     (SELECT AVG(stock_mensuel) FROM (
                        SELECT SUM(montant_valorise_achat) AS stock_mensuel
                        FROM mv_stock_monthly 
                        ${whereConditionsCurrent}
                        GROUP BY year, month
                     ) s)
                ELSE 0
            END AS valeur_actuelle,
            CASE 
                WHEN (SELECT AVG(stock_mensuel) FROM (
                    SELECT SUM(montant_valorise_achat) AS stock_mensuel
                    FROM mv_stock_monthly 
                    ${whereConditionsPrevious}
                    GROUP BY year, month
                ) s) > 0
                THEN (SELECT SUM(ca_ttc) 
                      FROM mv_ca_sellout_monthly 
                      ${whereConditionsPrevious}) / 
                     (SELECT AVG(stock_mensuel) FROM (
                        SELECT SUM(montant_valorise_achat) AS stock_mensuel
                        FROM mv_stock_monthly 
                        ${whereConditionsPrevious}
                        GROUP BY year, month
                     ) s)
                ELSE 0
            END AS valeur_precedente
        
        UNION ALL
        
        -- Couverture de stock (en jours)
        SELECT 
            'couverture_stock' AS kpi_name,
            CASE 
                WHEN (SELECT SUM(ca_ttc) 
                      FROM mv_ca_sellout_monthly 
                      ${whereConditionsCurrent}) > 0
                THEN (SELECT SUM(montant_valorise_achat) 
                      FROM mv_stock_monthly 
                      ${whereConditionsCurrent}
                      AND (year, month) = (
                        SELECT year, month 
                        FROM mv_stock_monthly 
                        ${whereConditionsCurrent}
                        ORDER BY year DESC, month DESC 
                        LIMIT 1
                      )) / 
                     ((SELECT SUM(ca_ttc) 
                       FROM mv_ca_sellout_monthly 
                       ${whereConditionsCurrent}) / 
                      (SELECT COUNT(DISTINCT (year, month)) 
                       FROM mv_ca_sellout_monthly 
                       ${whereConditionsCurrent}) * 30)
                ELSE 0
            END AS valeur_actuelle,
            CASE 
                WHEN (SELECT SUM(ca_ttc) 
                      FROM mv_ca_sellout_monthly 
                      ${whereConditionsPrevious}) > 0
                THEN (SELECT SUM(montant_valorise_achat) 
                      FROM mv_stock_monthly 
                      ${whereConditionsPrevious}
                      AND (year, month) = (
                        SELECT year, month 
                        FROM mv_stock_monthly 
                        ${whereConditionsPrevious}
                        ORDER BY year DESC, month DESC 
                        LIMIT 1
                      )) / 
                     ((SELECT SUM(ca_ttc) 
                       FROM mv_ca_sellout_monthly 
                       ${whereConditionsPrevious}) / 
                      (SELECT COUNT(DISTINCT (year, month)) 
                       FROM mv_ca_sellout_monthly 
                       ${whereConditionsPrevious}) * 30)
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

    // Exécution de la requête
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
        label: useDateFilters ? 'vs période précédente' : 'vs année précédente'
      },
      ca_sellout: {
        value: formatCurrency(kpis.ca_sellout.value),
        rawValue: kpis.ca_sellout.value,
        evolution: formatEvolution(kpis.ca_sellout.evolution),
        evolutionPct: kpis.ca_sellout.evolution,
        trend: kpis.ca_sellout.trend,
        label: useDateFilters ? 'vs période précédente' : 'vs année précédente'
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
        trend: parseFloat(kpis.couverture_stock.value || 0) < parseFloat(kpis.couverture_stock.previousValue || 1) ? 'positive' : 'negative',
        label: 'optimal'
      }
    };

    // Construction de la réponse
    const response: any = {
      success: true,
      filters: {
        pharmacyIds: pharmacyIds || 'all',
        brandLabs: brandLabs || 'all'
      },
      data: formattedData
    };

    // Ajouter les informations de période
    if (useDateFilters) {
      response.periods = {
        analysis: { 
          start: currentStartDate.toISOString().split('T')[0], 
          end: currentEndDate.toISOString().split('T')[0] 
        },
        comparison: { 
          start: previousStartDate.toISOString().split('T')[0], 
          end: previousEndDate.toISOString().split('T')[0] 
        }
      };
    } else {
      response.year = year;
      response.previousYear = previousYear;
    }

    return NextResponse.json(response);

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
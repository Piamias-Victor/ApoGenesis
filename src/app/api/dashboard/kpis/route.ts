// src/app/api/dashboard/kpis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pharmacyId = searchParams.get('pharmacyId');
  const startDate = searchParams.get('startDate') || '2025-07-01';
  const endDate = searchParams.get('endDate') || '2025-08-05';
  
  try {
    console.log('Fetching KPIs...', { pharmacyId, startDate, endDate });
    
    // 1. STOCK - Dernière valeur de la période
    const stockQuery = `
      SELECT 
        COALESCE(SUM(total_valeur_stock_ttc), 0) as stock_valorise,
        COALESCE(SUM(nb_references_stock), 0) as nb_references,
        MAX(derniere_maj_stock) as derniere_maj
      FROM mv_stock_stats
      WHERE period = DATE_TRUNC('month', $1::date)
        AND ($2::uuid IS NULL OR pharmacy_id = $2::uuid)
    `;
    
    // 2. SELL-OUT - Ventes clients
    const selloutQuery = `
      SELECT 
        COALESCE(SUM(ca_sellout_ttc), 0) as ca_sellout,
        COALESCE(SUM(marge_brute), 0) as marge,
        COALESCE(SUM(nb_transactions), 0) as nb_transactions,
        COALESCE(AVG(ticket_moyen), 0) as ticket_moyen,
        COALESCE(SUM(quantite_vendue), 0) as quantite,
        COUNT(DISTINCT period) as nb_mois,
        COUNT(DISTINCT laboratoire) as nb_labs_vendus
      FROM mv_sellout_cube
      WHERE period >= DATE_TRUNC('month', $1::date)
        AND period <= DATE_TRUNC('month', $2::date)
        AND ($3::uuid IS NULL OR pharmacy_id = $3::uuid)
    `;
    
    // 3. SELL-IN - Achats fournisseurs
    const sellinQuery = `
      SELECT 
        COALESCE(SUM(ca_sellin_estime), 0) as ca_sellin,
        COALESCE(SUM(cout_achat_estime), 0) as cout_achat,
        COALESCE(SUM(nb_commandes), 0) as nb_commandes,
        COALESCE(SUM(quantite_recue), 0) as quantite_recue,
        COUNT(DISTINCT laboratoire) as nb_laboratoires,
        COUNT(DISTINCT supplier_id) as nb_fournisseurs
      FROM mv_sellin_cube
      WHERE period >= DATE_TRUNC('month', $1::date)
        AND period <= DATE_TRUNC('month', $2::date)
        AND ($3::uuid IS NULL OR pharmacy_id = $3::uuid)
    `;
    
    // 4. TOP 5 LABORATOIRES SELL-OUT
    const topLabsSelloutQuery = `
      SELECT 
        laboratoire as lab_name,
        SUM(ca_sellout_ttc) as ca_lab,
        SUM(quantite_vendue) as qte_vendue,
        SUM(marge_brute) as marge_lab,
        ROUND(SUM(marge_brute) / NULLIF(SUM(ca_sellout_ttc), 0) * 100, 1) as taux_marge
      FROM mv_sellout_cube
      WHERE period >= DATE_TRUNC('month', $1::date)
        AND period <= DATE_TRUNC('month', $2::date)
        AND ($3::uuid IS NULL OR pharmacy_id = $3::uuid)
        AND laboratoire IS NOT NULL
      GROUP BY laboratoire
      ORDER BY ca_lab DESC
      LIMIT 5
    `;
    
    // 5. TOP 5 LABORATOIRES SELL-IN
    const topLabsSellinQuery = `
      SELECT 
        laboratoire as lab_name,
        SUM(ca_sellin_estime) as ca_lab,
        SUM(quantite_recue) as qte_recue,
        SUM(nb_commandes) as nb_commandes
      FROM mv_sellin_cube
      WHERE period >= DATE_TRUNC('month', $1::date)
        AND period <= DATE_TRUNC('month', $2::date)
        AND ($3::uuid IS NULL OR pharmacy_id = $3::uuid)
        AND laboratoire IS NOT NULL
      GROUP BY laboratoire
      ORDER BY ca_lab DESC
      LIMIT 5
    `;
    
    // 6. TOP 5 CATÉGORIES
    const topCategoriesQuery = `
      SELECT 
        categorie,
        SUM(ca_sellout_ttc) as ca_categorie,
        SUM(quantite_vendue) as qte_vendue,
        SUM(marge_brute) as marge_categorie,
        ROUND(SUM(marge_brute) / NULLIF(SUM(ca_sellout_ttc), 0) * 100, 1) as taux_marge
      FROM mv_sellout_cube
      WHERE period >= DATE_TRUNC('month', $1::date)
        AND period <= DATE_TRUNC('month', $2::date)
        AND ($3::uuid IS NULL OR pharmacy_id = $3::uuid)
        AND categorie IS NOT NULL
      GROUP BY categorie
      ORDER BY ca_categorie DESC
      LIMIT 5
    `;
    
    // 7. RÉPARTITION TVA
    const repartitionTVAQuery = `
      SELECT 
        ROUND(SUM(ca_tva_0) / NULLIF(SUM(ca_sellout_ttc), 0) * 100, 1) as pct_tva_0,
        ROUND(SUM(ca_tva_2_1) / NULLIF(SUM(ca_sellout_ttc), 0) * 100, 1) as pct_tva_2_1,
        ROUND(SUM(ca_tva_5_5) / NULLIF(SUM(ca_sellout_ttc), 0) * 100, 1) as pct_tva_5_5,
        ROUND(SUM(ca_tva_10) / NULLIF(SUM(ca_sellout_ttc), 0) * 100, 1) as pct_tva_10,
        ROUND(SUM(ca_tva_20) / NULLIF(SUM(ca_sellout_ttc), 0) * 100, 1) as pct_tva_20
      FROM mv_sellout_cube
      WHERE period >= DATE_TRUNC('month', $1::date)
        AND period <= DATE_TRUNC('month', $2::date)
        AND ($3::uuid IS NULL OR pharmacy_id = $3::uuid)
    `;
    
    // 8. RÉPARTITION REMBOURSEMENT
    const repartitionRemboursementQuery = `
      SELECT 
        SUM(ca_remboursable) as ca_remboursable,
        SUM(ca_non_remboursable) as ca_non_remboursable,
        ROUND(SUM(ca_remboursable) / NULLIF(SUM(ca_sellout_ttc), 0) * 100, 1) as pct_remboursable
      FROM mv_sellout_cube
      WHERE period >= DATE_TRUNC('month', $1::date)
        AND period <= DATE_TRUNC('month', $2::date)
        AND ($3::uuid IS NULL OR pharmacy_id = $3::uuid)
    `;
    
    // 9. COMPARAISONS N-1
    const selloutN1Query = `
      SELECT 
        COALESCE(SUM(ca_sellout_ttc), 0) as ca_sellout_n1,
        COALESCE(SUM(marge_brute), 0) as marge_n1
      FROM mv_sellout_cube
      WHERE period >= DATE_TRUNC('month', $1::date - INTERVAL '1 year')
        AND period <= DATE_TRUNC('month', $2::date - INTERVAL '1 year')
        AND ($3::uuid IS NULL OR pharmacy_id = $3::uuid)
    `;
    
    const sellinN1Query = `
      SELECT 
        COALESCE(SUM(ca_sellin_estime), 0) as ca_sellin_n1
      FROM mv_sellin_cube
      WHERE period >= DATE_TRUNC('month', $1::date - INTERVAL '1 year')
        AND period <= DATE_TRUNC('month', $2::date - INTERVAL '1 year')
        AND ($3::uuid IS NULL OR pharmacy_id = $3::uuid)
    `;
    
    // 10. STOCK MOYEN pour rotation
    const stockMoyenQuery = `
      SELECT 
        COALESCE(AVG(total_valeur_stock_ttc), 0) as stock_moyen_periode
      FROM mv_stock_stats
      WHERE period >= DATE_TRUNC('month', $1::date)
        AND period <= DATE_TRUNC('month', $2::date)
        AND ($3::uuid IS NULL OR pharmacy_id = $3::uuid)
    `;
    
    // 11. NOMBRE DE MOIS RÉELS dans la période
    const nbMoisQuery = `
      SELECT 
        EXTRACT(YEAR FROM AGE($2::date, $1::date)) * 12 + 
        EXTRACT(MONTH FROM AGE($2::date, $1::date)) + 1 as nb_mois_periode
    `;
    
    // EXÉCUTER TOUTES LES REQUÊTES EN PARALLÈLE
    const [
      stockResult,
      selloutResult,
      sellinResult,
      topLabsSelloutResult,
      topLabsSellinResult,
      topCategoriesResult,
      repartitionTVAResult,
      repartitionRemboursementResult,
      selloutN1Result,
      sellinN1Result,
      stockMoyenResult,
      nbMoisResult
    ] = await Promise.all([
      pool.query(stockQuery, [endDate, pharmacyId]),
      pool.query(selloutQuery, [startDate, endDate, pharmacyId]),
      pool.query(sellinQuery, [startDate, endDate, pharmacyId]),
      pool.query(topLabsSelloutQuery, [startDate, endDate, pharmacyId]),
      pool.query(topLabsSellinQuery, [startDate, endDate, pharmacyId]),
      pool.query(topCategoriesQuery, [startDate, endDate, pharmacyId]),
      pool.query(repartitionTVAQuery, [startDate, endDate, pharmacyId]),
      pool.query(repartitionRemboursementQuery, [startDate, endDate, pharmacyId]),
      pool.query(selloutN1Query, [startDate, endDate, pharmacyId]),
      pool.query(sellinN1Query, [startDate, endDate, pharmacyId]),
      pool.query(stockMoyenQuery, [startDate, endDate, pharmacyId]),
      pool.query(nbMoisQuery, [startDate, endDate])
    ]);
    
    // PARSING DES RÉSULTATS
    const stock = stockResult.rows[0] || {};
    const sellout = selloutResult.rows[0] || {};
    const sellin = sellinResult.rows[0] || {};
    const topLabsSellout = topLabsSelloutResult.rows || [];
    const topLabsSellin = topLabsSellinResult.rows || [];
    const topCategories = topCategoriesResult.rows || [];
    const repartitionTVA = repartitionTVAResult.rows[0] || {};
    const repartitionRemboursement = repartitionRemboursementResult.rows[0] || {};
    const selloutN1 = selloutN1Result.rows[0] || {};
    const sellinN1 = sellinN1Result.rows[0] || {};
    const stockMoyen = stockMoyenResult.rows[0] || {};
    const nbMoisData = nbMoisResult.rows[0] || {};
    
    // CALCULS
    const stockValorise = parseFloat(stock.stock_valorise || 0);
    const stockMoyenValue = parseFloat(stockMoyen.stock_moyen_periode || stockValorise);
    const caSellout = parseFloat(sellout.ca_sellout || 0);
    const caSellin = parseFloat(sellin.ca_sellin || 0);
    const marge = parseFloat(sellout.marge || 0);
    const caSelloutN1 = parseFloat(selloutN1.ca_sellout_n1 || 0);
    const caSellinN1 = parseFloat(sellinN1.ca_sellin_n1 || 0);
    const margeN1 = parseFloat(selloutN1.marge_n1 || 0);
    
    // CALCUL CORRECT DU NOMBRE DE MOIS ET DE LA ROTATION
    const nbMoisPeriode = Math.max(1, Math.round(parseFloat(nbMoisData.nb_mois_periode || 1)));
    
    console.log('DEBUG ROTATION:', {
      caSellout,
      stockMoyenValue,
      nbMoisPeriode,
      startDate,
      endDate
    });
    
    // CA mensuel moyen puis annualisé
    const caMensuelMoyen = caSellout / nbMoisPeriode;
    const caAnnualise = caMensuelMoyen * 12;
    
    // Rotation et couverture
    const rotation = stockMoyenValue > 0 ? caAnnualise / stockMoyenValue : 0;
    const couverture = rotation > 0 ? Math.round(365 / rotation) : 0;
    
    console.log('CALCUL ROTATION:', {
      caMensuelMoyen,
      caAnnualise,
      rotation,
      couverture
    });
    
    // Évolutions
    const evolutionCA = caSelloutN1 > 0 ? ((caSellout - caSelloutN1) / caSelloutN1) * 100 : 0;
    const evolutionSellin = caSellinN1 > 0 ? ((caSellin - caSellinN1) / caSellinN1) * 100 : 0;
    const evolutionMarge = margeN1 > 0 ? ((marge - margeN1) / margeN1) * 100 : 0;
    const tauxMarge = caSellout > 0 ? (marge / caSellout) * 100 : 0;
    
    // RATIO SELL-OUT/SELL-IN
    const ratioSellOutIn = caSellin > 0 ? (caSellout / caSellin) * 100 : 0;
    const differenceSellOutIn = caSellout - caSellin;
    const margeSurAchats = caSellin > 0 ? (marge / caSellin) * 100 : 0;
    
    // CONSTRUCTION DE LA RÉPONSE
    const data = {
      // SELL-OUT
      ca_sellout: caSellout,
      ca_sellout_evolution: Math.round(evolutionCA * 10) / 10,
      marge_brute: marge,
      marge_evolution: Math.round(evolutionMarge * 10) / 10,
      taux_marge: Math.round(tauxMarge * 10) / 10,
      nb_transactions: parseInt(sellout.nb_transactions || 0),
      ticket_moyen: parseFloat(sellout.ticket_moyen || 0),
      quantite_vendue: parseInt(sellout.quantite || 0),
      nb_labs_vendus: parseInt(sellout.nb_labs_vendus || 0),
      
      // SELL-IN
      ca_sellin: caSellin,
      ca_sellin_evolution: Math.round(evolutionSellin * 10) / 10,
      cout_achat: parseFloat(sellin.cout_achat || 0),
      nb_commandes: parseInt(sellin.nb_commandes || 0),
      quantite_recue: parseInt(sellin.quantite_recue || 0),
      nb_laboratoires: parseInt(sellin.nb_laboratoires || 0),
      nb_fournisseurs: parseInt(sellin.nb_fournisseurs || 0),
      
      // STOCK
      stock_valorise: stockValorise,
      stock_moyen: stockMoyenValue,
      rotation_stock: Math.round(rotation * 10) / 10,
      couverture_jours: couverture,
      nb_references: parseInt(stock.nb_references || 0),
      
      // ANALYSE SELL-IN/OUT
      ratio_sellout_sellin: Math.round(ratioSellOutIn * 10) / 10,
      difference_sellout_sellin: differenceSellOutIn,
      marge_sur_achats: Math.round(margeSurAchats * 10) / 10,
      
      // TOPS
      top_labs_sellout: topLabsSellout,
      top_labs_sellin: topLabsSellin,
      top_categories: topCategories,
      
      // RÉPARTITIONS
      repartition_tva: {
        tva_0: parseFloat(repartitionTVA.pct_tva_0 || 0),
        tva_2_1: parseFloat(repartitionTVA.pct_tva_2_1 || 0),
        tva_5_5: parseFloat(repartitionTVA.pct_tva_5_5 || 0),
        tva_10: parseFloat(repartitionTVA.pct_tva_10 || 0),
        tva_20: parseFloat(repartitionTVA.pct_tva_20 || 0)
      },
      repartition_remboursement: {
        ca_remboursable: parseFloat(repartitionRemboursement.ca_remboursable || 0),
        ca_non_remboursable: parseFloat(repartitionRemboursement.ca_non_remboursable || 0),
        pct_remboursable: parseFloat(repartitionRemboursement.pct_remboursable || 0)
      },
      
      // COMPARAISONS N-1
      ca_sellout_n1: caSelloutN1,
      ca_sellin_n1: caSellinN1,
      marge_n1: margeN1,
      
      // METADATA
      periode: {
        debut: startDate,
        fin: endDate,
        nb_mois: nbMoisPeriode
      },
      derniere_maj: stock.derniere_maj,
      
      // DEBUG INFO
      debug: {
        ca_mensuel_moyen: caMensuelMoyen,
        ca_annualise: caAnnualise,
        stock_moyen_utilise: stockMoyenValue
      }
    };
    
    return NextResponse.json({
      success: true,
      data,
      metadata: {
        pharmacyId: pharmacyId || 'all',
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
// src/app/api/dashboard/top-products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { z } from 'zod';

// Schéma de validation
const TopProductsRequestSchema = z.object({
  viewType: z.enum(['products', 'laboratories', 'categories']).default('products'),
  limit: z.number().min(1).max(500).default(100),
  
  // Dates pour les plages
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  
  // Année/mois pour compatibilité
  year: z.number().min(2020).max(2030).optional(),
  month: z.number().min(1).max(12).optional(),
  
  // Filtres
  pharmacyIds: z.string()
    .transform(val => val ? val.split(',').map(id => id.trim()).filter(Boolean) : [])
    .pipe(z.array(z.string().uuid()).max(100))
    .optional(),
  brandLabs: z.string()
    .transform(val => val ? val.split(',').map(lab => lab.trim()).filter(Boolean) : [])
    .pipe(z.array(z.string().max(100)).max(50))
    .optional(),
  sortBy: z.enum(['quantity', 'ca_ttc', 'marge']).default('quantity')
});

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Extraction des paramètres
    const searchParams = request.nextUrl.searchParams;
    const rawParams = {
      viewType: searchParams.get('viewType') || 'products',
      limit: parseInt(searchParams.get('limit') || '100'),
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
      month: searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined,
      pharmacyIds: searchParams.get('pharmacyIds') || '',
      brandLabs: searchParams.get('brandLabs') || '',
      sortBy: searchParams.get('sortBy') || 'quantity'
    };
    
    console.log('Raw params:', rawParams);
    
    // Validation
    const validated = TopProductsRequestSchema.parse(rawParams);
    
    // Déterminer le mode (plage de dates ou année/mois)
    const useDateRange = !!(validated.startDate && validated.endDate);
    
    if (useDateRange) {
      console.log('Mode: Date range from', validated.startDate, 'to', validated.endDate);
    } else {
      // Utiliser l'année et le mois actuels par défaut
      if (!validated.year) {
        validated.year = new Date().getFullYear();
      }
      if (!validated.month) {
        validated.month = new Date().getMonth() + 1;
      }
      console.log('Mode: Single month', validated.year + '-' + validated.month);
    }
    
    console.log('Validated params:', validated);
    
    // Construction de la requête selon le type de vue
    let query = '';
    let queryParams: any[] = [];
    
    switch (validated.viewType) {
      case 'products':
        const result = buildProductsQueryAndParams(validated, useDateRange);
        query = result.query;
        queryParams = result.params;
        break;
        
      case 'laboratories':
        // À implémenter
        return NextResponse.json(
          { success: false, error: 'Laboratories view not implemented yet' },
          { status: 501 }
        );
        
      case 'categories':
        // À implémenter
        return NextResponse.json(
          { success: false, error: 'Categories view not implemented yet' },
          { status: 501 }
        );
    }
    
    console.log('Query params:', queryParams);
    console.log('Query preview:', query.substring(0, 300) + '...');
    
    // Exécution de la requête
    const result = await pool.query(query, queryParams);
    
    console.log('Query returned', result.rows.length, 'rows');
    
    // Formatage des résultats
    const formattedData = result.rows.map((row, index) => ({
      rank: index + 1,
      internal_id: row.internal_id,
      code_13_ref_id: row.code_13_ref_id,
      product_name: row.product_name,
      brand_lab: row.brand_lab,
      category: row.category,
      sub_category: row.sub_category,
      range_name: row.range_name,
      quantity: parseInt(row.quantity || 0),
      ca_sellout: parseFloat(row.ca_ttc || 0),
      margin: parseFloat(row.marge || 0),
      margin_percentage: parseFloat(row.margin_percentage || 0)
    }));
    
    const executionTime = performance.now() - startTime;
    
    return NextResponse.json({
      success: true,
      data: formattedData,
      executionTime: Math.round(executionTime),
      metadata: {
        viewType: validated.viewType,
        total: formattedData.length,
        period: useDateRange ? {
          type: 'range',
          start: validated.startDate,
          end: validated.endDate
        } : {
          type: 'month',
          year: validated.year,
          month: validated.month
        },
        filters: {
          pharmacyIds: validated.pharmacyIds?.length || 0,
          brandLabs: validated.brandLabs?.length || 0
        }
      }
    });
    
  } catch (error) {
    console.error('Top Products Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid parameters', 
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Fonction pour construire la requête et les paramètres pour les produits
function buildProductsQueryAndParams(
  params: z.infer<typeof TopProductsRequestSchema>, 
  useDateRange: boolean
): { query: string; params: any[] } {
  
  if (useDateRange) {
    // ===== MODE PLAGE DE DATES =====
    return buildDateRangeQuery(params);
  } else {
    // ===== MODE MOIS UNIQUE =====
    return buildMonthQuery(params);
  }
}

// Requête pour une plage de dates
function buildDateRangeQuery(params: z.infer<typeof TopProductsRequestSchema>) {
  const queryParams: any[] = [];
  let paramCounter = 1;
  
  // Paramètres de base
  const startDateParam = `$${paramCounter++}`;  // $1
  const endDateParam = `$${paramCounter++}`;    // $2
  queryParams.push(params.startDate);
  queryParams.push(params.endDate);
  
  // Construire les conditions WHERE
  let whereConditions: string[] = [];
  
  if (params.pharmacyIds && params.pharmacyIds.length > 0) {
    whereConditions.push(`mp.pharmacy_id = ANY($${paramCounter}::uuid[])`);
    queryParams.push(params.pharmacyIds);
    paramCounter++;
  }
  
  if (params.brandLabs && params.brandLabs.length > 0) {
    whereConditions.push(`mp.brand_lab = ANY($${paramCounter}::text[])`);
    queryParams.push(params.brandLabs);
    paramCounter++;
  }
  
  const whereClause = whereConditions.length > 0 
    ? 'AND ' + whereConditions.join(' AND ')
    : '';
  
  // Ajouter le limit à la fin
  const limitParam = `$${paramCounter}`;
  queryParams.push(params.limit);
  
  // Construction de la requête SQL
  const query = `
    WITH date_range AS (
      SELECT 
        DATE_PART('year', d)::integer as year,
        DATE_PART('month', d)::integer as month
      FROM generate_series(
        ${startDateParam}::date,
        ${endDateParam}::date,
        '1 month'::interval
      ) d
    ),
    filtered_products AS (
      SELECT 
        mp.internal_id,
        mp.code_13_ref_id,
        mp.product_name,
        mp.brand_lab,
        mp.category,
        mp.sub_category,
        mp.pharmacy_id,
        mp.quantity,
        mp.ca_ttc,
        mp.ca_ht,
        mp.marge,
        mp.avg_price_ttc
      FROM mv_top_products_monthly mp
      INNER JOIN date_range dr 
        ON mp.year = dr.year 
        AND mp.month = dr.month
      ${whereClause}
    ),
    aggregated AS (
      SELECT 
        internal_id,
        code_13_ref_id,
        MIN(product_name) as product_name,
        MIN(brand_lab) as brand_lab,
        MIN(category) as category,
        MIN(sub_category) as sub_category,
        COUNT(DISTINCT pharmacy_id) as nb_pharmacies,
        SUM(quantity) as quantity,
        SUM(ca_ttc) as ca_ttc,
        SUM(ca_ht) as ca_ht,
        SUM(marge) as marge,
        CASE 
          WHEN SUM(ca_ttc) > 0 
          THEN ROUND((SUM(marge) / SUM(ca_ttc) * 100)::numeric, 1)
          ELSE 0 
        END as margin_percentage
      FROM filtered_products
      GROUP BY internal_id, code_13_ref_id
    )
    SELECT 
      internal_id,
      code_13_ref_id,
      product_name,
      brand_lab,
      category,
      sub_category,
      NULL as range_name,
      nb_pharmacies,
      quantity::bigint as quantity,
      ca_ttc,
      marge,
      margin_percentage
    FROM aggregated
    ORDER BY ${
      params.sortBy === 'ca_ttc' ? 'ca_ttc' : 
      params.sortBy === 'marge' ? 'marge' : 
      'quantity'
    } DESC
    LIMIT ${limitParam}
  `;
  
  return { query, params: queryParams };
}

// Requête pour un mois unique
function buildMonthQuery(params: z.infer<typeof TopProductsRequestSchema>) {
  const queryParams: any[] = [];
  let paramCounter = 1;
  
  // Déterminer la colonne de rang
  const rankColumn = params.sortBy === 'ca_ttc' ? 'rank_ca' : 
                     params.sortBy === 'marge' ? 'rank_marge' : 
                     'rank_quantity';
  
  // Construire les conditions WHERE
  let whereConditions: string[] = [];
  
  // Limite basée sur le rang
  whereConditions.push(`${rankColumn} <= $${paramCounter}`);
  queryParams.push(params.limit);
  paramCounter++;
  
  // Année
  if (params.year) {
    whereConditions.push(`year = $${paramCounter}`);
    queryParams.push(params.year);
    paramCounter++;
  }
  
  // Mois
  if (params.month) {
    whereConditions.push(`month = $${paramCounter}`);
    queryParams.push(params.month);
    paramCounter++;
  }
  
  // Filtres optionnels
  if (params.pharmacyIds && params.pharmacyIds.length > 0) {
    whereConditions.push(`pharmacy_id = ANY($${paramCounter}::uuid[])`);
    queryParams.push(params.pharmacyIds);
    paramCounter++;
  }
  
  if (params.brandLabs && params.brandLabs.length > 0) {
    whereConditions.push(`brand_lab = ANY($${paramCounter}::text[])`);
    queryParams.push(params.brandLabs);
    paramCounter++;
  }
  
  const whereClause = 'WHERE ' + whereConditions.join(' AND ');
  
  // Construction de la requête SQL
  const query = `
    WITH filtered_products AS (
      SELECT 
        mp.internal_id,
        mp.code_13_ref_id,
        mp.product_name,
        mp.brand_lab,
        mp.category,
        mp.sub_category,
        mp.pharmacy_id,
        mp.quantity,
        mp.ca_ttc,
        mp.ca_ht,
        mp.marge,
        mp.avg_price_ttc
      FROM mv_top_products_monthly mp
      ${whereClause}
    ),
    aggregated AS (
      SELECT 
        internal_id,
        code_13_ref_id,
        MIN(product_name) as product_name,
        MIN(brand_lab) as brand_lab,
        MIN(category) as category,
        MIN(sub_category) as sub_category,
        COUNT(DISTINCT pharmacy_id) as nb_pharmacies,
        SUM(quantity) as quantity,
        SUM(ca_ttc) as ca_ttc,
        SUM(ca_ht) as ca_ht,
        SUM(marge) as marge,
        CASE 
          WHEN SUM(ca_ttc) > 0 
          THEN ROUND((SUM(marge) / SUM(ca_ttc) * 100)::numeric, 1)
          ELSE 0 
        END as margin_percentage
      FROM filtered_products
      GROUP BY internal_id, code_13_ref_id
    )
    SELECT 
      internal_id,
      code_13_ref_id,
      product_name,
      brand_lab,
      category,
      sub_category,
      NULL as range_name,
      nb_pharmacies,
      quantity::bigint as quantity,
      ca_ttc,
      marge,
      margin_percentage
    FROM aggregated
    ORDER BY ${
      params.sortBy === 'ca_ttc' ? 'ca_ttc' : 
      params.sortBy === 'marge' ? 'marge' : 
      'quantity'
    } DESC
    LIMIT $1
  `;
  
  return { query, params: queryParams };
}
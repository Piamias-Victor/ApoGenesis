// src/app/api/dashboard/top-products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { z } from 'zod';

// Schéma de validation
const TopProductsRequestSchema = z.object({
  viewType: z.enum(['products', 'laboratories', 'categories']).default('products'),
  limit: z.number().min(1).max(500).default(100),
  year: z.number().min(2020).max(2030).optional(),
  month: z.number().min(1).max(12).optional(),
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
      year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear(),
      month: searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined,
      pharmacyIds: searchParams.get('pharmacyIds') || '',
      brandLabs: searchParams.get('brandLabs') || '',
      sortBy: searchParams.get('sortBy') || 'quantity'
    };
    
    console.log('Raw params:', rawParams);
    
    // Validation
    const validated = TopProductsRequestSchema.parse(rawParams);
    
    console.log('Validated params:', validated);
    
    // Construction de la requête selon le type de vue
    let query = '';
    let params: any[] = [];
    
    switch (validated.viewType) {
      case 'products':
        query = buildProductsQuery(validated);
        params = buildProductsParams(validated);
        break;
        
      case 'laboratories':
        query = buildLaboratoriesQuery(validated);
        params = buildLaboratoriesParams(validated);
        break;
        
      case 'categories':
        query = buildCategoriesQuery(validated);
        params = buildCategoriesParams(validated);
        break;
    }
    
    console.log('Query params:', params);
    console.log('Query:', query.substring(0, 200) + '...');
    
    // Exécution de la requête
    const result = await pool.query(query, params);
    
    console.log('Query result rows:', result.rows.length);
    
    // Formatage des résultats
    const formattedData = result.rows.map((row, index) => ({
      rank: index + 1,
      ...row,
      quantity: parseInt(row.quantity || 0),
      ca_sellout: parseFloat(row.ca_ttc || 0),
      margin: parseFloat(row.marge || 0),
      margin_percentage: parseFloat(row.margin_percentage || 0),
      stock: parseInt(row.stock || 0)
    }));
    
    const executionTime = performance.now() - startTime;
    
    console.log('Returning', formattedData.length, 'items');
    
    return NextResponse.json({
      success: true,
      data: formattedData,
      executionTime: Math.round(executionTime),
      metadata: {
        viewType: validated.viewType,
        total: formattedData.length,
        year: validated.year,
        month: validated.month,
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
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Requête pour les produits
function buildProductsQuery(params: z.infer<typeof TopProductsRequestSchema>): string {
  const rankColumn = params.sortBy === 'ca_ttc' ? 'rank_ca' : 
                     params.sortBy === 'marge' ? 'rank_marge' : 'rank_quantity';
  
  // Construire les conditions WHERE dynamiquement
  let whereConditions = [`${rankColumn} <= $1`];
  let paramIndex = 2;
  
  if (params.year) {
    whereConditions.push(`year = ${paramIndex}`);
    paramIndex++;
  }
  
  if (params.month) {
    whereConditions.push(`month = ${paramIndex}`);
    paramIndex++;
  }
  
  if (params.pharmacyIds?.length) {
    whereConditions.push(`pharmacy_id = ANY(${paramIndex}::uuid[])`);
    paramIndex++;
  }
  
  if (params.brandLabs?.length) {
    whereConditions.push(`brand_lab = ANY(${paramIndex}::text[])`);
    paramIndex++;
  }
  
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
  return `
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
        mp.avg_price_ttc,
        -- Stock actuel depuis inventorysnapshot
        0 as stock
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
        SUM(marge) as marge,
        AVG(stock) as stock,
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
      margin_percentage,
      COALESCE(stock::integer, 0) as stock
    FROM aggregated
    ORDER BY ${params.sortBy === 'ca_ttc' ? 'ca_ttc' : 
             params.sortBy === 'marge' ? 'marge' : 'quantity'} DESC
    LIMIT $1
  `;
}

// Requête pour les laboratoires
function buildLaboratoriesQuery(params: z.infer<typeof TopProductsRequestSchema>): string {
  let whereConditions = ['year = $1'];
  let paramIndex = 2;
  let limitParam = '$2';
  
  if (params.month) {
    whereConditions.push(`month = ${paramIndex}`);
    paramIndex++;
    limitParam = `${paramIndex}`;
  }
  
  if (params.pharmacyIds?.length) {
    whereConditions.push(`pharmacy_id = ANY(${paramIndex}::uuid[])`);
    paramIndex++;
    limitParam = `${paramIndex}`;
  }
  
  whereConditions.push('brand_lab IS NOT NULL');
  const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
  
  return `
    WITH lab_aggregated AS (
      SELECT 
        brand_lab,
        COUNT(DISTINCT internal_id) as nb_products,
        COUNT(DISTINCT pharmacy_id) as nb_pharmacies,
        SUM(quantity) as quantity,
        SUM(ca_ttc) as ca_ttc,
        SUM(marge) as marge
      FROM mv_top_products_by_lab_monthly
      ${whereClause}
      GROUP BY brand_lab
    )
    SELECT 
      brand_lab as product_name,
      brand_lab,
      nb_products::text as category,
      nb_pharmacies::text as sub_category,
      'Laboratoire' as code_13_ref_id,
      NULL as range_name,
      quantity::bigint as quantity,
      ca_ttc,
      marge,
      CASE 
        WHEN ca_ttc > 0 
        THEN ROUND((marge / ca_ttc * 100)::numeric, 1)
        ELSE 0 
      END as margin_percentage,
      0 as stock
    FROM lab_aggregated
    ORDER BY ${params.sortBy === 'ca_ttc' ? 'ca_ttc' : 
             params.sortBy === 'marge' ? 'marge' : 'quantity'} DESC
    LIMIT ${limitParam}
  `;
}

// Requête pour les catégories
function buildCategoriesQuery(params: z.infer<typeof TopProductsRequestSchema>): string {
  let whereConditions = ['year = $1'];
  let paramIndex = 2;
  let limitParam = '$2';
  
  if (params.month) {
    whereConditions.push(`month = ${paramIndex}`);
    paramIndex++;
    limitParam = `${paramIndex}`;
  }
  
  if (params.pharmacyIds?.length) {
    whereConditions.push(`pharmacy_id = ANY(${paramIndex}::uuid[])`);
    paramIndex++;
    limitParam = `${paramIndex}`;
  }
  
  if (params.brandLabs?.length) {
    whereConditions.push(`brand_lab = ANY(${paramIndex}::text[])`);
    paramIndex++;
    limitParam = `${paramIndex}`;
  }
  
  whereConditions.push('category IS NOT NULL');
  const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
  
  return `
    WITH cat_aggregated AS (
      SELECT 
        category,
        COUNT(DISTINCT internal_id) as nb_products,
        COUNT(DISTINCT pharmacy_id) as nb_pharmacies,
        COUNT(DISTINCT brand_lab) as nb_labs,
        SUM(quantity) as quantity,
        SUM(ca_ttc) as ca_ttc,
        SUM(marge) as marge
      FROM mv_top_products_monthly
      ${whereClause}
      GROUP BY category
    )
    SELECT 
      category as product_name,
      CAST(nb_labs AS TEXT) as brand_lab,
      category,
      CAST(nb_products AS TEXT) as sub_category,
      'Catégorie' as code_13_ref_id,
      NULL as range_name,
      quantity::bigint as quantity,
      ca_ttc,
      marge,
      CASE 
        WHEN ca_ttc > 0 
        THEN ROUND((marge / ca_ttc * 100)::numeric, 1)
        ELSE 0 
      END as margin_percentage,
      0 as stock
    FROM cat_aggregated
    ORDER BY ${params.sortBy === 'ca_ttc' ? 'ca_ttc' : 
             params.sortBy === 'marge' ? 'marge' : 'quantity'} DESC
    LIMIT ${limitParam}
  `;
}

// Construction des paramètres pour les produits
function buildProductsParams(params: z.infer<typeof TopProductsRequestSchema>): any[] {
  const result: any[] = [params.limit];
  
  if (params.year) result.push(params.year);
  if (params.month) result.push(params.month);
  if (params.pharmacyIds?.length) result.push(params.pharmacyIds);
  if (params.brandLabs?.length) result.push(params.brandLabs);
  
  return result;
}

// Construction des paramètres pour les laboratoires
function buildLaboratoriesParams(params: z.infer<typeof TopProductsRequestSchema>): any[] {
  const result: any[] = [params.year || new Date().getFullYear()];
  
  if (params.month) result.push(params.month);
  if (params.pharmacyIds?.length) result.push(params.pharmacyIds);
  result.push(params.limit);
  
  return result;
}

// Construction des paramètres pour les catégories
function buildCategoriesParams(params: z.infer<typeof TopProductsRequestSchema>): any[] {
  const result: any[] = [params.year || new Date().getFullYear()];
  
  if (params.month) result.push(params.month);
  if (params.pharmacyIds?.length) result.push(params.pharmacyIds);
  if (params.brandLabs?.length) result.push(params.brandLabs);
  result.push(params.limit);
  
  return result;
}
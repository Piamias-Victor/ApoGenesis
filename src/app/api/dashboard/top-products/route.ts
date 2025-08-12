// src/app/api/dashboard/top-products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { z } from 'zod';

// Schéma de validation
const TopProductsRequestSchema = z.object({
  pharmacyIds: z.string()
    .transform(val => val ? val.split(',').map(id => id.trim()).filter(Boolean) : [])
    .pipe(z.array(z.string().uuid()).max(100))
    .optional(),
  brandLabs: z.string()
    .transform(val => val ? val.split(',').map(lab => lab.trim()).filter(Boolean) : [])
    .pipe(z.array(z.string().max(100)).max(50))
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(500).default(100),
  viewType: z.enum(['products', 'laboratories', 'categories']).default('products')
});

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Extraction des paramètres
    const searchParams = request.nextUrl.searchParams;
    
    // Dates par défaut : année en cours
    const currentYear = new Date().getFullYear();
    const defaultStartDate = `${currentYear}-01-01`;
    const defaultEndDate = `${currentYear}-12-31`;
    
    const rawParams = {
      pharmacyIds: searchParams.get('pharmacyIds') || '',
      brandLabs: searchParams.get('brandLabs') || '',
      startDate: searchParams.get('startDate') || defaultStartDate,
      endDate: searchParams.get('endDate') || defaultEndDate,
      limit: parseInt(searchParams.get('limit') || '100'),
      viewType: searchParams.get('viewType') || 'products'
    };
    
    const validated = TopProductsRequestSchema.parse(rawParams);
    
    let query: string;
    let params: any[] = [validated.startDate, validated.endDate];
    
    // Construction des conditions WHERE
    let whereConditions: string[] = [];
    let paramIndex = 3;
    
    if (validated.pharmacyIds?.length) {
      whereConditions.push(`p.pharmacy_id = ANY(${paramIndex}::uuid[])`);
      params.push(validated.pharmacyIds);
      paramIndex++;
    }
    
    if (validated.brandLabs?.length) {
      whereConditions.push(`g.brand_lab = ANY(${paramIndex}::text[])`);
      params.push(validated.brandLabs);
      paramIndex++;
    }
    
    const whereClause = whereConditions.length > 0 
      ? `AND ${whereConditions.join(' AND ')}` 
      : '';
    
    // Ajouter la limite dans params et obtenir son index
    params.push(validated.limit);
    const limitParam = `${params.length}`;  // Sera $3, $4 ou $5 selon les filtres
    
    switch (validated.viewType) {
      case 'products':
        query = `
          SELECT 
            ROW_NUMBER() OVER (ORDER BY SUM(s.quantity * i.price_with_tax) DESC) as rank,
            p.code_13_ref_id,
            MAX(p.name) AS product_name,
            MAX(g.brand_lab) as brand_lab,
            MAX(g.range_name) as range_name,
            MAX(g.category) as category,
            MAX(g.sub_category) as sub_category,
            COUNT(DISTINCT p.pharmacy_id) as nb_pharmacies,
            COALESCE(SUM(s.quantity), 0) AS quantity,
            COALESCE(ROUND(SUM(s.quantity * i.price_with_tax)::numeric, 2), 0) AS ca_sellout,
            COALESCE(ROUND(SUM(
              s.quantity * (
                i.price_with_tax - 
                (i.weighted_average_price * (1 + COALESCE(g.tva_percentage, p."TVA", 20)/100))
              )
            )::numeric, 2), 0) AS margin,
            CASE
              WHEN SUM(s.quantity * i.price_with_tax) > 0
              THEN ROUND((
                SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + COALESCE(g.tva_percentage, p."TVA", 20)/100)))) 
                / SUM(s.quantity * i.price_with_tax) * 100
              )::numeric, 1)
              ELSE 0
            END AS margin_percentage,
            COALESCE(MAX(i.stock), 0) AS stock,
            ROUND((SUM(s.quantity * i.price_with_tax) / NULLIF(SUM(s.quantity), 0))::numeric, 2) as avg_price
          FROM 
            data_internalproduct p
          LEFT JOIN 
            data_inventorysnapshot i ON p.id = i.product_id
          LEFT JOIN 
            data_sales s ON i.id = s.product_id 
            AND s.date BETWEEN $1 AND $2
          LEFT JOIN 
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
          WHERE 1=1 ${whereClause}
          GROUP BY 
            p.code_13_ref_id
          HAVING COALESCE(SUM(s.quantity * i.price_with_tax), 0) > 0
          ORDER BY ca_sellout DESC
          LIMIT ${paramIndex}
        `;
        break;
        
      case 'laboratories':
        query = `
          SELECT 
            ROW_NUMBER() OVER (ORDER BY SUM(s.quantity * i.price_with_tax) DESC) as rank,
            g.brand_lab,
            COUNT(DISTINCT p.code_13_ref_id) as nb_products,
            COUNT(DISTINCT p.pharmacy_id) as nb_pharmacies,
            COALESCE(SUM(s.quantity), 0) AS quantity,
            COALESCE(ROUND(SUM(s.quantity * i.price_with_tax)::numeric, 2), 0) AS ca_sellout,
            COALESCE(ROUND(SUM(
              s.quantity * (
                i.price_with_tax - 
                (i.weighted_average_price * (1 + COALESCE(g.tva_percentage, p."TVA", 20)/100))
              )
            )::numeric, 2), 0) AS margin,
            CASE
              WHEN SUM(s.quantity * i.price_with_tax) > 0
              THEN ROUND((
                SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + COALESCE(g.tva_percentage, p."TVA", 20)/100)))) 
                / SUM(s.quantity * i.price_with_tax) * 100
              )::numeric, 1)
              ELSE 0
            END AS margin_percentage,
            0 AS stock
          FROM 
            data_internalproduct p
          LEFT JOIN 
            data_inventorysnapshot i ON p.id = i.product_id
          LEFT JOIN 
            data_sales s ON i.id = s.product_id 
            AND s.date BETWEEN $1 AND $2
          LEFT JOIN 
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
          WHERE g.brand_lab IS NOT NULL ${whereClause}
          GROUP BY g.brand_lab
          HAVING COALESCE(SUM(s.quantity * i.price_with_tax), 0) > 0
          ORDER BY ca_sellout DESC
          LIMIT ${paramIndex}
        `;
        break;
        
      case 'categories':
        query = `
          SELECT 
            ROW_NUMBER() OVER (ORDER BY SUM(s.quantity * i.price_with_tax) DESC) as rank,
            g.category,
            g.sub_category,
            COUNT(DISTINCT p.code_13_ref_id) as nb_products,
            COUNT(DISTINCT g.brand_lab) as nb_laboratories,
            COALESCE(SUM(s.quantity), 0) AS quantity,
            COALESCE(ROUND(SUM(s.quantity * i.price_with_tax)::numeric, 2), 0) AS ca_sellout,
            COALESCE(ROUND(SUM(
              s.quantity * (
                i.price_with_tax - 
                (i.weighted_average_price * (1 + COALESCE(g.tva_percentage, p."TVA", 20)/100))
              )
            )::numeric, 2), 0) AS margin,
            CASE
              WHEN SUM(s.quantity * i.price_with_tax) > 0
              THEN ROUND((
                SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + COALESCE(g.tva_percentage, p."TVA", 20)/100)))) 
                / SUM(s.quantity * i.price_with_tax) * 100
              )::numeric, 1)
              ELSE 0
            END AS margin_percentage,
            0 AS stock
          FROM 
            data_internalproduct p
          LEFT JOIN 
            data_inventorysnapshot i ON p.id = i.product_id
          LEFT JOIN 
            data_sales s ON i.id = s.product_id 
            AND s.date BETWEEN $1 AND $2
          LEFT JOIN 
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
          WHERE g.category IS NOT NULL ${whereClause}
          GROUP BY g.category, g.sub_category
          HAVING COALESCE(SUM(s.quantity * i.price_with_tax), 0) > 0
          ORDER BY ca_sellout DESC
          LIMIT ${paramIndex}
        `;
        break;
        
      default:
        throw new Error('Type de vue invalide');
    }
    
    // Log pour debug
    console.log('Query params count:', params.length);
    console.log('Query params:', params);
    console.log('Limit value:', validated.limit);
    
    // Supprimer la limite de params si elle y est
    if (params.length === 3 && typeof params[2] === 'number') {
      params = params.slice(0, 2); // Garder seulement les dates
    }
    
    // Exécution avec timeout
    const queryPromise = pool.query(query, params);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 100000)
    );
    
    const result = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    const executionTime = performance.now() - startTime;
    
    // Log performance si > 500ms
    if (executionTime > 500) {
      console.warn(`Top products query took ${executionTime.toFixed(0)}ms`, {
        viewType: validated.viewType,
        filters: { 
          pharmacyIds: validated.pharmacyIds?.length || 0, 
          brandLabs: validated.brandLabs?.length || 0 
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      viewType: validated.viewType,
      executionTime: Math.round(executionTime),
      filters: {
        pharmacyIds: validated.pharmacyIds?.length || 0,
        brandLabs: validated.brandLabs?.length || 0,
        period: `${validated.startDate} - ${validated.endDate}`
      }
    });
    
  } catch (error) {
    console.error('Top Products API Error:', error);
    
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
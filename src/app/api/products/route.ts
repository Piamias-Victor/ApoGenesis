// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import pool from '@/lib/db';

interface Product {
  readonly code_13_ref: string;
  readonly name: string;
  readonly brand_lab: string | null;
  readonly universe: string | null;
  readonly category: string | null;
}

interface ProductsResponse {
  readonly success: boolean;
  readonly data: Product[];
  readonly count: number;
  readonly searchType: 'name' | 'code';
  readonly query: string;
  readonly timestamp: string;
  readonly cached?: boolean;
}

// Cache en mémoire pour les recherches fréquentes (TTL 1h)
const searchCache = new Map<string, { data: Product[]; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 heure

const getCacheKey = (query: string, searchType: string): string => {
  return `${searchType}:${query.toLowerCase()}`;
};

const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_TTL;
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Vérification authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') as 'name' | 'code';
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // Validation des paramètres
    if (!query || query.length < 3) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        searchType: type || 'name',
        query: query || '',
        timestamp: new Date().toISOString()
      });
    }

    if (!type || (type !== 'name' && type !== 'code')) {
      return NextResponse.json(
        { success: false, error: 'Type de recherche invalide (name|code)' },
        { status: 400 }
      );
    }

    // Vérification cache
    const cacheKey = getCacheKey(query, type);
    const cached = searchCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
      return NextResponse.json({
        success: true,
        data: cached.data.slice(0, limit),
        count: cached.data.length,
        searchType: type,
        query,
        timestamp: new Date().toISOString(),
        cached: true
      });
    }

    let products: Product[] = [];
    let sqlQuery = '';
    let params: any[] = [];

    if (type === 'name') {
      // Recherche par nom - priorité aux commençant par puis contenant
      sqlQuery = `
        WITH name_search AS (
          -- Produits qui commencent par le terme (priorité 1)
          SELECT 
            code_13_ref, name, brand_lab, universe, category,
            1 as priority
          FROM data_globalproduct 
          WHERE LOWER(name) LIKE LOWER($1)
          
          UNION
          
          -- Produits qui contiennent le terme (priorité 2)
          SELECT 
            code_13_ref, name, brand_lab, universe, category,
            2 as priority
          FROM data_globalproduct 
          WHERE LOWER(name) LIKE LOWER($2)
          AND NOT LOWER(name) LIKE LOWER($1)
        )
        SELECT code_13_ref, name, brand_lab, universe, category
        FROM name_search
        ORDER BY priority ASC, name ASC
        LIMIT $3
      `;
      params = [`${query}%`, `%${query}%`, limit];
      
    } else if (type === 'code') {
      const cleanQuery = query.trim();
      
      if (cleanQuery.includes('*')) {
        // Recherche avec wildcards
        if (cleanQuery.startsWith('*') && !cleanQuery.endsWith('*')) {
          // *4856 = finit par 4856
          const suffix = cleanQuery.substring(1);
          sqlQuery = `
            SELECT code_13_ref, name, brand_lab, universe, category
            FROM data_globalproduct 
            WHERE code_13_ref LIKE $1
            ORDER BY code_13_ref ASC
            LIMIT $2
          `;
          params = [`%${suffix}`, limit];
          
        } else if (cleanQuery.startsWith('*') && cleanQuery.endsWith('*')) {
          // *123* = contient 123
          const middle = cleanQuery.slice(1, -1);
          if (middle.length === 0) {
            return NextResponse.json({
              success: false,
              error: 'Format wildcard invalide'
            }, { status: 400 });
          }
          sqlQuery = `
            SELECT code_13_ref, name, brand_lab, universe, category
            FROM data_globalproduct 
            WHERE code_13_ref LIKE $1
            ORDER BY code_13_ref ASC
            LIMIT $2
          `;
          params = [`%${middle}%`, limit];
        } else {
          // Cas par défaut si wildcard mal formé
          return NextResponse.json({
            success: false,
            error: 'Format wildcard invalide'
          }, { status: 400 });
        }
      } else {
        // Recherche normale par code - commence par
        sqlQuery = `
          SELECT code_13_ref, name, brand_lab, universe, category
          FROM data_globalproduct 
          WHERE code_13_ref LIKE $1
          ORDER BY code_13_ref ASC
          LIMIT $2
        `;
        params = [`${cleanQuery}%`, limit];
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'Type de recherche non supporté'
      }, { status: 400 });
    }

    const startTime = performance.now();
    const result = await pool.query(sqlQuery, params);
    const queryTime = performance.now() - startTime;

    products = result.rows;

    // Mise en cache
    searchCache.set(cacheKey, {
      data: products,
      timestamp: Date.now()
    });

    // Nettoyage du cache si trop gros (>1000 entrées)
    if (searchCache.size > 1000) {
      const oldestEntries = Array.from(searchCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 200);
      
      oldestEntries.forEach(([key]) => searchCache.delete(key));
    }

    const response: ProductsResponse = {
      success: true,
      data: products,
      count: products.length,
      searchType: type,
      query,
      timestamp: new Date().toISOString()
    };

    // Headers de cache pour performance
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // 1h cache navigateur
        'X-Query-Time': queryTime.toFixed(2) + 'ms'
      }
    });

  } catch (error) {
    console.error('Erreur API /api/products:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur serveur',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
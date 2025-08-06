// src/app/api/laboratories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import pool from '@/lib/db';

interface Laboratory {
  readonly name: string;
  readonly productCount: number;
  readonly universes: string[];
}

interface LaboratoriesResponse {
  readonly success: boolean;
  readonly data: Laboratory[];
  readonly count: number;
  readonly query: string;
  readonly timestamp: string;
  readonly cached?: boolean;
}

// Cache en mémoire pour les recherches fréquentes (TTL 1h)
const searchCache = new Map<string, { data: Laboratory[]; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 heure

const getCacheKey = (query: string): string => {
  return `lab:${query.toLowerCase()}`;
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
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // Validation des paramètres
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        query: query || '',
        timestamp: new Date().toISOString()
      });
    }

    // Vérification cache
    const cacheKey = getCacheKey(query);
    const cached = searchCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
      return NextResponse.json({
        success: true,
        data: cached.data.slice(0, limit),
        count: cached.data.length,
        query,
        timestamp: new Date().toISOString(),
        cached: true
      });
    }

    // Requête SQL optimisée avec agrégation
    const sqlQuery = `
      WITH lab_stats AS (
        -- Agrégation par laboratoire avec priorité aux commençant par le terme
        SELECT 
          brand_lab as name,
          COUNT(*) as product_count,
          ARRAY_AGG(DISTINCT universe ORDER BY universe) FILTER (WHERE universe IS NOT NULL) as universes,
          CASE 
            WHEN LOWER(brand_lab) LIKE LOWER($1) THEN 1  -- Commence par
            ELSE 2                                        -- Contient
          END as priority
        FROM data_globalproduct 
        WHERE brand_lab IS NOT NULL 
        AND brand_lab != ''
        AND (
          LOWER(brand_lab) LIKE LOWER($1) OR  -- Commence par
          LOWER(brand_lab) LIKE LOWER($2)     -- Contient
        )
        GROUP BY brand_lab
      )
      SELECT 
        name,
        product_count::integer,
        COALESCE(universes, ARRAY[]::varchar[]) as universes
      FROM lab_stats
      ORDER BY priority ASC, product_count DESC, name ASC
      LIMIT $3
    `;

    const params = [`${query}%`, `%${query}%`, limit];

    const startTime = performance.now();
    const result = await pool.query(sqlQuery, params);
    const queryTime = performance.now() - startTime;

    // Transformation des données
    const laboratories: Laboratory[] = result.rows.map(row => ({
      name: row.name,
      productCount: row.product_count,
      universes: row.universes || []
    }));

    // Mise en cache
    searchCache.set(cacheKey, {
      data: laboratories,
      timestamp: Date.now()
    });

    // Nettoyage du cache si trop gros (>1000 entrées)
    if (searchCache.size > 1000) {
      const oldestEntries = Array.from(searchCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 200);
      
      oldestEntries.forEach(([key]) => searchCache.delete(key));
    }

    const response: LaboratoriesResponse = {
      success: true,
      data: laboratories,
      count: laboratories.length,
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
    console.error('Erreur API /api/laboratories:', error);
    
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
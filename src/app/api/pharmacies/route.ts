// src/app/api/pharmacies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import pool from '@/lib/db';

interface Pharmacy {
  readonly id: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly id_nat: string | null;
  readonly name: string | null;
  readonly ca: number | null;
  readonly area: string | null;
  readonly employees_count: number | null;
  readonly address: string | null;
}

interface PharmaciesResponse {
  readonly success: boolean;
  readonly data: Pharmacy[];
  readonly count: number;
  readonly cached: boolean;
  readonly timestamp: string;
}

// Cache en mémoire (24h)
let pharmaciesCache: {
  data: Pharmacy[] | null;
  timestamp: number;
  ttl: number;
} = {
  data: null,
  timestamp: 0,
  ttl: 24 * 60 * 60 * 1000 // 24 heures en ms
};

const isCacheValid = (): boolean => {
  return pharmaciesCache.data !== null && 
         (Date.now() - pharmaciesCache.timestamp) < pharmaciesCache.ttl;
};

const setCacheData = (data: Pharmacy[]): void => {
  pharmaciesCache = {
    data,
    timestamp: Date.now(),
    ttl: 24 * 60 * 60 * 1000
  };
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

    const { user } = session;
    let pharmacies: Pharmacy[];
    let fromCache = false;

    // Admin : toutes les pharmacies avec cache
    if (user.role === 'admin') {
      if (isCacheValid() && pharmaciesCache.data) {
        pharmacies = pharmaciesCache.data;
        fromCache = true;
      } else {
        const result = await pool.query(`
          SELECT 
            id,
            created_at,
            updated_at,
            id_nat,
            name,
            ca,
            area,
            employees_count,
            address
          FROM data_pharmacy 
          ORDER BY name ASC NULLS LAST
        `);
        
        pharmacies = result.rows;
        setCacheData(pharmacies);
      }
    } 
    // Pharmacien : seulement sa pharmacie
    else if (user.role === 'pharmacien') {
      if (!user.pharmacyId) {
        return NextResponse.json(
          { success: false, error: 'Pharmacie non trouvée' },
          { status: 404 }
        );
      }

      const result = await pool.query(`
        SELECT 
          id,
          created_at,
          updated_at,
          id_nat,
          name,
          ca,
          area,
          employees_count,
          address
        FROM data_pharmacy 
        WHERE id = $1
      `, [user.pharmacyId]);
      
      pharmacies = result.rows;
    } 
    // Rôle invalide
    else {
      return NextResponse.json(
        { success: false, error: 'Rôle utilisateur invalide' },
        { status: 403 }
      );
    }

    const response: PharmaciesResponse = {
      success: true,
      data: pharmacies,
      count: pharmacies.length,
      cached: fromCache,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': user.role === 'admin' ? 'public, max-age=86400' : 'private, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Erreur API /api/pharmacies:', error);
    
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
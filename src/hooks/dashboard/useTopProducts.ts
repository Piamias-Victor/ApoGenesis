// src/hooks/dashboard/useTopProducts.ts
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

export type ViewType = 'products' | 'laboratories' | 'categories';

export interface TopProductItem {
  rank: number;
  internal_id?: number;
  code_13_ref_id?: string;
  product_name: string;
  brand_lab?: string;
  category?: string;
  sub_category?: string;
  range_name?: string;
  quantity: number;
  ca_sellout: number;
  margin: number;
  margin_percentage: number;
  stock: number;
}

interface UseTopProductsReturn {
  data: TopProductItem[] | null;
  viewType: ViewType;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  changeView: (view: ViewType) => void;
  executionTime: number | null;
}

export function useTopProducts(
  initialView: ViewType = 'products',
  limit: number = 100,
  year?: number,
  month?: number,
  pharmacyIds?: string,
  brandLabs?: string
): UseTopProductsReturn {
  const [data, setData] = useState<TopProductItem[] | null>(null);
  const [viewType, setViewType] = useState<ViewType>(initialView);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, { data: TopProductItem[], timestamp: number }>>(new Map());
  
  // Validation des paramètres
  const validatedParams = useMemo(() => {
    const result = {
      pharmacyIds: '',
      brandLabs: '',
      year: year || new Date().getFullYear(),
      month: month
    };
    
    // Validation des UUIDs pour pharmacyIds
    if (pharmacyIds) {
      const ids = pharmacyIds.split(',').map(id => id.trim()).filter(Boolean);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validIds = ids.filter(id => uuidRegex.test(id));
      result.pharmacyIds = validIds.join(',');
    }
    
    // Validation des laboratoires
    if (brandLabs) {
      const labs = brandLabs.split(',').map(lab => lab.trim()).filter(Boolean);
      result.brandLabs = labs.slice(0, 50).join(',');
    }
    
    return result;
  }, [pharmacyIds, brandLabs, year, month]);
  
  // Fonction de fetch avec cache
  const fetchTopProducts = useCallback(async (currentViewType: ViewType) => {
    // Générer une clé de cache
    const cacheKey = `${currentViewType}-${limit}-${validatedParams.year}-${validatedParams.month}-${validatedParams.pharmacyIds}-${validatedParams.brandLabs}`;
    
    // Vérifier le cache (5 minutes de TTL)
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      setData(cached.data);
      setLoading(false);
      return;
    }
    
    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const startTime = performance.now();
    
    try {
      setLoading(true);
      setError(null);
      
      // Construction des paramètres
      const params = new URLSearchParams({
        viewType: currentViewType,
        limit: limit.toString(),
        year: validatedParams.year.toString(),
        sortBy: 'quantity' // Par défaut, tri par quantité
      });
      
      if (validatedParams.month) {
        params.append('month', validatedParams.month.toString());
      }
      
      if (validatedParams.pharmacyIds) {
        params.append('pharmacyIds', validatedParams.pharmacyIds);
      }
      
      if (validatedParams.brandLabs) {
        params.append('brandLabs', validatedParams.brandLabs);
      }
      
      const response = await fetch(`/api/dashboard/top-products?${params}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      const endTime = performance.now();
      
      setExecutionTime(Math.round(endTime - startTime));
      
      if (result.success) {
        setData(result.data);
        // Mettre en cache
        cacheRef.current.set(cacheKey, {
          data: result.data,
          timestamp: Date.now()
        });
      } else {
        throw new Error(result.error || 'Erreur lors du chargement des données');
      }
      
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
        console.error('Top Products fetch error:', err);
      }
    } finally {
      if (abortControllerRef.current?.signal.aborted === false) {
        setLoading(false);
      }
    }
  }, [limit, validatedParams]);
  
  // Changement de vue
  const changeView = useCallback((newView: ViewType) => {
    setViewType(newView);
  }, []);
  
  // Effect pour charger les données
  useEffect(() => {
    fetchTopProducts(viewType);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [viewType, fetchTopProducts]);
  
  // Refetch manuel
  const refetch = useCallback(async () => {
    // Vider le cache pour forcer le rechargement
    cacheRef.current.clear();
    await fetchTopProducts(viewType);
  }, [viewType, fetchTopProducts]);
  
  return {
    data,
    viewType,
    loading,
    error,
    refetch,
    changeView,
    executionTime
  };
}
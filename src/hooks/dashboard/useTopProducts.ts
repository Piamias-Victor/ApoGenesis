// src/hooks/dashboard/useTopProducts.ts
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDateFilters } from './useDateFilters';
import { useSelectedLaboratoryNames } from '@/store/productFiltersStore';
import { usePharmacyFiltersStore } from '@/store/pharmacyFiltersStore';

// Types
export interface TopProductItem {
  rank: number;
  code_13_ref_id?: string;
  product_name?: string;
  brand_lab?: string;
  range_name?: string;
  category?: string;
  sub_category?: string;
  nb_products?: number;
  nb_pharmacies?: number;
  nb_laboratories?: number;
  quantity: number;
  ca_sellout: number;
  margin: number;
  margin_percentage: number;
  stock: number;
  avg_price?: number;
}

export type ViewType = 'products' | 'laboratories' | 'categories';

interface UseTopProductsReturn {
  data: TopProductItem[] | null;
  viewType: ViewType;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  changeView: (view: ViewType) => void;
  executionTime: number | null;
}

// Validation UUID
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid.trim());
};

export function useTopProducts(
  initialView: ViewType = 'products',
  limit: number = 100
): UseTopProductsReturn {
  const [data, setData] = useState<TopProductItem[] | null>(null);
  const [viewType, setViewType] = useState<ViewType>(initialView);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  
  // Récupération des filtres
  const { getAPIFormat } = useDateFilters();
  const apiDateFilters = getAPIFormat();
  const selectedLaboratoryNames = useSelectedLaboratoryNames();
  const selectedPharmacyIds = usePharmacyFiltersStore(state => state.selectedPharmacyIds);
  
  // Refs pour optimisation
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Construction des paramètres avec mémoisation
  const pharmacyFilter = useMemo(
    () => selectedPharmacyIds.length > 0 ? selectedPharmacyIds.join(',') : undefined,
    [selectedPharmacyIds]
  );
  
  const brandLabFilter = useMemo(
    () => selectedLaboratoryNames.length > 0 ? selectedLaboratoryNames.join(',') : undefined,
    [selectedLaboratoryNames]
  );
  
  // Validation et nettoyage des paramètres
  const validatedParams = useMemo(() => {
    const result = { pharmacyIds: '', brandLabs: '' };
    
    try {
      // Validation des pharmacyIds
      if (pharmacyFilter) {
        const ids = pharmacyFilter.split(',').map(id => id.trim()).filter(Boolean);
        const validIds = ids.filter(isValidUUID);
        
        if (ids.length !== validIds.length) {
          console.warn(`Filtered ${ids.length - validIds.length} invalid pharmacy IDs`);
        }
        
        result.pharmacyIds = validIds.slice(0, 100).join(',');
      }
      
      // Validation des brandLabs
      if (brandLabFilter) {
        const labs = brandLabFilter.split(',').map(lab => lab.trim()).filter(Boolean);
        const validLabs = labs.filter(lab => lab.length <= 100);
        
        if (labs.length !== validLabs.length) {
          console.warn(`Filtered ${labs.length - validLabs.length} invalid laboratory names`);
        }
        
        result.brandLabs = validLabs.slice(0, 50).join(',');
      }
      
      return result;
    } catch (e) {
      console.error('Parameter validation error:', e);
      return { pharmacyIds: '', brandLabs: '' };
    }
  }, [pharmacyFilter, brandLabFilter]);
  
  // Fonction de fetch stable
  const fetchTopProducts = useCallback(async () => {
    // Annuler les requêtes précédentes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Créer un nouveau controller
    abortControllerRef.current = new AbortController();
    const startTime = performance.now();
    
    try {
      setLoading(true);
      setError(null);
      
      // Construction des paramètres
      const params = new URLSearchParams();
      
      // Ajout des filtres de date
      if (apiDateFilters) {
        params.append('startDate', apiDateFilters.analysisPeriod.start);
        params.append('endDate', apiDateFilters.analysisPeriod.end);
      } else {
        // Dates par défaut : année en cours
        const currentYear = new Date().getFullYear();
        params.append('startDate', `${currentYear}-01-01`);
        params.append('endDate', `${currentYear}-12-31`);
      }
      
      // Ajout des autres paramètres
      params.append('viewType', viewType);
      params.append('limit', limit.toString());
      
      // Ajout des filtres validés
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
      const duration = Math.round(endTime - startTime);
      
      setExecutionTime(duration);
      
      if (result.success) {
        setData(result.data);
        setError(null);
        
        // Log en dev
        if (process.env.NODE_ENV === 'development') {
          console.log(`Top products loaded in ${duration}ms`, {
            viewType: result.viewType,
            count: result.data.length
          });
        }
      } else {
        throw new Error(result.error || 'Erreur lors du chargement des données');
      }
      
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
        console.error('Top products fetch error:', err);
      }
    } finally {
      if (abortControllerRef.current?.signal.aborted === false) {
        setLoading(false);
      }
    }
  }, [
    apiDateFilters,
    viewType,
    limit,
    validatedParams.pharmacyIds,
    validatedParams.brandLabs
  ]);
  
  // Fonction pour changer de vue
  const changeView = useCallback((view: ViewType) => {
    setViewType(view);
  }, []);
  
  // Création d'une clé unique pour les dépendances
  const dependencyKey = useMemo(() => {
    return JSON.stringify({
      startDate: apiDateFilters?.analysisPeriod.start,
      endDate: apiDateFilters?.analysisPeriod.end,
      viewType,
      limit,
      pharmacyIds: validatedParams.pharmacyIds,
      brandLabs: validatedParams.brandLabs
    });
  }, [
    apiDateFilters?.analysisPeriod.start,
    apiDateFilters?.analysisPeriod.end,
    viewType,
    limit,
    validatedParams.pharmacyIds,
    validatedParams.brandLabs
  ]);
  
  // Effect avec debounce et gestion propre
  useEffect(() => {
    // Clear timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Nouveau timeout avec debounce
    timeoutRef.current = setTimeout(() => {
      fetchTopProducts();
    }, 300);
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [dependencyKey]); // Utilisation de la clé unique
  
  // Refetch manuel
  const refetch = useCallback(async () => {
    await fetchTopProducts();
  }, [fetchTopProducts]);
  
  // Log performance en dev
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && executionTime) {
      console.log(`Top Products loaded in ${executionTime}ms`);
    }
  }, [executionTime]);
  
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
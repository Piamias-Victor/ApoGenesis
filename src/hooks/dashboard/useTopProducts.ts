// src/hooks/dashboard/useTopProducts.ts
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDateFilters } from './useDateFilters';
import { usePharmacyFilters } from './usePharmacyFilters';
import { useProductFilters } from './useProductFilters';

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
  
  // Récupération des filtres depuis les hooks
  const { getAPIFormat, dateFilters } = useDateFilters();
  const { selectedPharmacyIds } = usePharmacyFilters();
  const { selectedLaboratoryNames } = useProductFilters();
  
  console.log('🔍 useTopProducts - RAW dateFilters:', {
    type: dateFilters.analysisPeriod.type,
    analysisPeriod: dateFilters.analysisPeriod
  });
  
  // Extraction année/mois depuis les dates
  const apiDateFilters = getAPIFormat();
  
  console.log('🔍 useTopProducts - API dateFilters:', {
    analysisPeriod: apiDateFilters.analysisPeriod,
    comparisonPeriod: apiDateFilters.comparisonPeriod
  });
  
  const endDateParts = apiDateFilters.analysisPeriod.end.split('-');
  const year = parseInt(endDateParts[0] || String(new Date().getFullYear()));
  const month = parseInt(endDateParts[1] || String(new Date().getMonth() + 1));
  
  // Pour debug : vérifier si on devrait utiliser une période ou un mois unique
  const periodType = dateFilters.analysisPeriod.type;
  const isMultiMonth = periodType === 'custom' || periodType === 'last_month' || periodType === 'current_month';
  
  console.log('📅 useTopProducts - Date extraction:', {
    periodType,
    isMultiMonth,
    raw: apiDateFilters.analysisPeriod.end,
    year,
    month,
    fullPeriod: {
      start: apiDateFilters.analysisPeriod.start,
      end: apiDateFilters.analysisPeriod.end
    }
  });
  
  // Utilisation de useRef pour éviter les re-renders
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Validation et nettoyage des paramètres - Mémorisé  
  const validatedParams = useMemo(() => {
    const result = { 
      pharmacyIds: '', 
      brandLabs: ''
    };
    
    try {
      // Validation des pharmacyIds
      if (selectedPharmacyIds && selectedPharmacyIds.length > 0) {
        const validIds = selectedPharmacyIds.filter(isValidUUID);
        
        if (selectedPharmacyIds.length !== validIds.length) {
          console.warn(`Filtered ${selectedPharmacyIds.length - validIds.length} invalid pharmacy IDs`);
        }
        
        result.pharmacyIds = validIds.slice(0, 100).join(',');
      }
      
      // Validation des brandLabs
      if (selectedLaboratoryNames && selectedLaboratoryNames.length > 0) {
        const validLabs = selectedLaboratoryNames.filter(lab => lab.length <= 100);
        
        if (selectedLaboratoryNames.length !== validLabs.length) {
          console.warn(`Filtered ${selectedLaboratoryNames.length - validLabs.length} invalid laboratory names`);
        }
        
        result.brandLabs = validLabs.slice(0, 50).join(',');
      }
      
      return result;
    } catch (e) {
      console.error('Parameter validation error:', e);
      return result;
    }
  }, [selectedPharmacyIds, selectedLaboratoryNames]);
  
  // Fonction de fetch stable
  const fetchTopProducts = useCallback(async () => {
    console.log('🚀 useTopProducts - Fetching with params:', {
      viewType,
      startDate: apiDateFilters.analysisPeriod.start,
      endDate: apiDateFilters.analysisPeriod.end,
      pharmacyIds: validatedParams.pharmacyIds ? 'YES' : 'NO',
      brandLabs: validatedParams.brandLabs ? 'YES' : 'NO'
    });
    
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
      
      // Construction des paramètres - Utiliser les dates maintenant !
      const params = new URLSearchParams({
        viewType,
        limit: limit.toString(),
        startDate: apiDateFilters.analysisPeriod.start,
        endDate: apiDateFilters.analysisPeriod.end,
        sortBy: 'quantity'
      });
      
      // Ajout des filtres validés
      if (validatedParams.pharmacyIds) {
        params.append('pharmacyIds', validatedParams.pharmacyIds);
      }
      if (validatedParams.brandLabs) {
        params.append('brandLabs', validatedParams.brandLabs);
      }
      
      console.log('📡 useTopProducts - API Call:', `/api/dashboard/top-products?${params}`);
      
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
        console.log('✅ useTopProducts - Success:', result.data.length, 'items');
        setData(result.data);
        setError(null);
      } else {
        throw new Error(result.error || 'Erreur lors du chargement des données');
      }
      
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('❌ useTopProducts - Error:', err.message);
        setError(err.message);
      }
    } finally {
      if (abortControllerRef.current?.signal.aborted === false) {
        setLoading(false);
      }
    }
  }, [
    viewType,
    limit,
    apiDateFilters.analysisPeriod.start,
    apiDateFilters.analysisPeriod.end,
    validatedParams.pharmacyIds,
    validatedParams.brandLabs
  ]);
  
  // Création d'une clé unique pour les dépendances (pour debug)
  const dependencyKey = useMemo(() => {
    const key = JSON.stringify({
      viewType,
      limit,
      startDate: apiDateFilters.analysisPeriod.start,
      endDate: apiDateFilters.analysisPeriod.end,
      pharmacyIds: validatedParams.pharmacyIds,
      brandLabs: validatedParams.brandLabs
    });
    console.log('🔑 useTopProducts - Dependency key changed:', key);
    return key;
  }, [
    viewType,
    limit,
    apiDateFilters.analysisPeriod.start,
    apiDateFilters.analysisPeriod.end,
    validatedParams.pharmacyIds,
    validatedParams.brandLabs
  ]);
  
  // Effect avec debounce et gestion propre
  useEffect(() => {
    console.log('🔄 useTopProducts - Effect triggered with:', {
      apiDateEnd: apiDateFilters.analysisPeriod.end,
      apiDateStart: apiDateFilters.analysisPeriod.start,
      pharmacies: selectedPharmacyIds.length,
      labs: selectedLaboratoryNames.length,
      viewType
    });
    
    // Clear timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Nouveau timeout avec debounce
    timeoutRef.current = setTimeout(() => {
      console.log('⏱️ useTopProducts - Debounce complete, fetching...');
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
  }, [
    apiDateFilters.analysisPeriod.end,
    apiDateFilters.analysisPeriod.start,
    selectedPharmacyIds.length,
    selectedLaboratoryNames.length,
    viewType,
    fetchTopProducts
  ]); // Surveillance directe des valeurs
  
  // Changement de vue
  const changeView = useCallback((newView: ViewType) => {
    setViewType(newView);
  }, []);
  
  // Refetch manuel
  const refetch = useCallback(async () => {
    await fetchTopProducts();
  }, [fetchTopProducts]);
  
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
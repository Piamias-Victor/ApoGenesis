// src/hooks/dashboard/useEvolutionChart.ts
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDateFilters } from './useDateFilters';
import { useSelectedLaboratoryNames } from '@/store/productFiltersStore';
import { usePharmacyFiltersStore } from '@/store/pharmacyFiltersStore';

// Types
interface ChartDataPoint {
  period: string;
  sellIn: number | null;
  sellOut: number | null;
  marge: number | null;
  stock: number | null;
}

interface EvolutionInsights {
  croissanceSellIn: string;
  croissanceSellOut: string;
  croissanceMarge: string;
  croissanceStock: string;
}

interface UseEvolutionChartReturn {
  data: ChartDataPoint[] | null;
  mode: 'monthly' | 'quarterly';
  insights: EvolutionInsights | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  executionTime: number | null;
}

// Validation UUID
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid.trim());
};

export function useEvolutionChart(): UseEvolutionChartReturn {
  const [data, setData] = useState<ChartDataPoint[] | null>(null);
  const [mode, setMode] = useState<'monthly' | 'quarterly'>('monthly');
  const [insights, setInsights] = useState<EvolutionInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  
  // Récupération des filtres
  const { getAPIFormat, dateFilters } = useDateFilters();
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
  const fetchEvolution = useCallback(async () => {
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
      if (dateFilters.analysisPeriod.type !== 'custom' || 
          (dateFilters.analysisPeriod.type === 'custom' && apiDateFilters)) {
        params.append('analysisPeriodStart', apiDateFilters.analysisPeriod.start);
        params.append('analysisPeriodEnd', apiDateFilters.analysisPeriod.end);
        params.append('comparisonPeriodStart', apiDateFilters.comparisonPeriod.start);
        params.append('comparisonPeriodEnd', apiDateFilters.comparisonPeriod.end);
      }
      
      // Ajout des filtres validés
      if (validatedParams.pharmacyIds) {
        params.append('pharmacyIds', validatedParams.pharmacyIds);
      }
      if (validatedParams.brandLabs) {
        params.append('brandLabs', validatedParams.brandLabs);
      }
      
      const response = await fetch(`/api/dashboard/evolution?${params}`, {
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
        setMode(result.mode);
        setInsights(result.insights);
        setError(null);
        
        // Log en dev
        if (process.env.NODE_ENV === 'development') {
          console.log(`Evolution chart data loaded in ${duration}ms`, {
            mode: result.mode,
            dataPoints: result.data.length,
            insights: result.insights
          });
        }
      } else {
        throw new Error(result.error || 'Erreur lors du chargement des données');
      }
      
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
        console.error('Evolution fetch error:', err);
      }
    } finally {
      if (abortControllerRef.current?.signal.aborted === false) {
        setLoading(false);
      }
    }
  }, [
    apiDateFilters.analysisPeriod.start,
    apiDateFilters.analysisPeriod.end,
    apiDateFilters.comparisonPeriod.start,
    apiDateFilters.comparisonPeriod.end,
    dateFilters.analysisPeriod.type,
    validatedParams.pharmacyIds,
    validatedParams.brandLabs
  ]);
  
  // Création d'une clé unique pour les dépendances
  const dependencyKey = useMemo(() => {
    return JSON.stringify({
      analysisPeriodStart: apiDateFilters.analysisPeriod.start,
      analysisPeriodEnd: apiDateFilters.analysisPeriod.end,
      comparisonPeriodStart: apiDateFilters.comparisonPeriod.start,
      comparisonPeriodEnd: apiDateFilters.comparisonPeriod.end,
      pharmacyIds: validatedParams.pharmacyIds,
      brandLabs: validatedParams.brandLabs
    });
  }, [
    apiDateFilters.analysisPeriod.start,
    apiDateFilters.analysisPeriod.end,
    apiDateFilters.comparisonPeriod.start,
    apiDateFilters.comparisonPeriod.end,
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
      fetchEvolution();
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
    await fetchEvolution();
  }, [fetchEvolution]);
  
  // Log performance en dev
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && executionTime) {
      console.log(`Evolution Chart loaded in ${executionTime}ms`);
    }
  }, [executionTime]);
  
  return {
    data,
    mode,
    insights,
    loading,
    error,
    refetch,
    executionTime
  };
}
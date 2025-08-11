// src/hooks/dashboard/useKPIs.ts
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDateFilters } from './useDateFilters';

interface KPIData {
  value: string;
  rawValue: number;
  evolution: string;
  evolutionPct?: number;
  trend: 'positive' | 'negative' | 'neutral';
  label: string;
}

interface KPIsData {
  ca_sellin: KPIData;
  ca_sellout: KPIData;
  marge_brute: KPIData;
  stock_valorise: KPIData;
  rotation_stock: KPIData;
  couverture_stock: KPIData;
}

interface UseKPIsReturn {
  data: KPIsData | null;
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

export function useKPIs(
  year: number = 2025,
  pharmacyIds?: string,
  brandLabs?: string
): UseKPIsReturn {
  const [data, setData] = useState<KPIsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  
  const { getAPIFormat, dateFilters } = useDateFilters();
  const apiDateFilters = getAPIFormat();
  
  // Utilisation de useRef pour éviter les re-renders
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Validation et nettoyage des paramètres - Mémorisé
  const validatedParams = useMemo(() => {
    const result = { pharmacyIds: '', brandLabs: '' };
    
    try {
      // Validation des pharmacyIds
      if (pharmacyIds) {
        const ids = pharmacyIds.split(',').map(id => id.trim()).filter(Boolean);
        const validIds = ids.filter(isValidUUID);
        
        if (ids.length !== validIds.length) {
          console.warn(`Filtered ${ids.length - validIds.length} invalid pharmacy IDs`);
        }
        
        result.pharmacyIds = validIds.slice(0, 100).join(',');
      }
      
      // Validation des brandLabs
      if (brandLabs) {
        const labs = brandLabs.split(',').map(lab => lab.trim()).filter(Boolean);
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
  }, [pharmacyIds, brandLabs]);
  
  // Fonction de fetch stable
  const fetchKPIs = useCallback(async () => {
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
      } else {
        params.append('year', year.toString());
      }
      
      // Ajout des filtres validés
      if (validatedParams.pharmacyIds) {
        params.append('pharmacyIds', validatedParams.pharmacyIds);
      }
      if (validatedParams.brandLabs) {
        params.append('brandLabs', validatedParams.brandLabs);
      }
      
      const response = await fetch(`/api/dashboard/kpis?${params}`, {
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
      } else {
        throw new Error(result.error || 'Erreur lors du chargement des KPIs');
      }
      
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
        console.error('KPI fetch error:', err);
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
    year,
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
      year,
      pharmacyIds: validatedParams.pharmacyIds,
      brandLabs: validatedParams.brandLabs
    });
  }, [
    apiDateFilters.analysisPeriod.start,
    apiDateFilters.analysisPeriod.end,
    apiDateFilters.comparisonPeriod.start,
    apiDateFilters.comparisonPeriod.end,
    year,
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
      fetchKPIs();
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
    await fetchKPIs();
  }, [fetchKPIs]);
  
  return {
    data,
    loading,
    error,
    refetch,
    executionTime
  };
}
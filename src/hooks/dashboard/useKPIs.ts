// src/hooks/dashboard/useKPIs.ts
import { useState, useEffect } from 'react';
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
}

export function useKPIs(
  year: number = 2025,
  pharmacyIds?: string,  // Accepte plusieurs IDs séparés par des virgules
  brandLabs?: string     // Accepte plusieurs labs séparés par des virgules
): UseKPIsReturn {
  const [data, setData] = useState<KPIsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Récupération des filtres de date depuis le store
  const { getAPIFormat, dateFilters } = useDateFilters();
  const apiDateFilters = getAPIFormat();

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construire les paramètres de requête
      const params = new URLSearchParams();
      
      // Ajouter les filtres de date s'ils existent
      if (dateFilters.analysisPeriod.type !== 'custom' || 
          (dateFilters.analysisPeriod.type === 'custom' && apiDateFilters)) {
        params.append('analysisPeriodStart', apiDateFilters.analysisPeriod.start);
        params.append('analysisPeriodEnd', apiDateFilters.analysisPeriod.end);
        params.append('comparisonPeriodStart', apiDateFilters.comparisonPeriod.start);
        params.append('comparisonPeriodEnd', apiDateFilters.comparisonPeriod.end);
      } else {
        // Fallback sur l'année si pas de filtres de date
        params.append('year', year.toString());
      }
      
      // Ajouter les autres filtres
      if (pharmacyIds) {
        params.append('pharmacyIds', pharmacyIds);
      }
      if (brandLabs) {
        params.append('brandLabs', brandLabs);
      }

      const response = await fetch(`/api/dashboard/kpis?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Erreur lors du chargement des KPIs');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        console.error('Erreur:', err);
      } else {
        setError('Erreur de connexion au serveur');
        console.error('Erreur inconnue:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect pour re-fetcher quand les paramètres changent
  useEffect(() => {
    fetchKPIs();
  }, [
    // Re-fetch quand les dates changent
    apiDateFilters.analysisPeriod.start,
    apiDateFilters.analysisPeriod.end,
    apiDateFilters.comparisonPeriod.start,
    apiDateFilters.comparisonPeriod.end,
    // Ou quand les autres filtres changent
    year,
    pharmacyIds,
    brandLabs
  ]);

  return {
    data,
    loading,
    error,
    refetch: fetchKPIs
  };
}
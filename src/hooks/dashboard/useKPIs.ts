// src/hooks/dashboard/useKPIs.ts
import { useState, useEffect } from 'react';

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

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        year: year.toString(),
        ...(pharmacyIds && { pharmacyIds }), // Reste au pluriel
        ...(brandLabs && { brandLabs })     // Reste au pluriel
      });

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

  useEffect(() => {
    fetchKPIs();
  }, [year, pharmacyIds, brandLabs]);

  return {
    data,
    loading,
    error,
    refetch: fetchKPIs
  };
}
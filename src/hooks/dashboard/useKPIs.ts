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
  pharmacyId?: string,
  brandLab?: string
): UseKPIsReturn {
  const [data, setData] = useState<KPIsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construction de l'URL avec les paramètres
      const params = new URLSearchParams({
        year: year.toString(),
        ...(pharmacyId && { pharmacyId }),
        ...(brandLab && { brandLab })
      });
      
      // CORRECTION: /api/dashboard/kpis avec un 's'
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
  }, [year, pharmacyId, brandLab]);

  return {
    data,
    loading,
    error,
    refetch: fetchKPIs
  };
}
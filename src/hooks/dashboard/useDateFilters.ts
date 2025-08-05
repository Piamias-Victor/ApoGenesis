// src/hooks/dashboard/useDateFilters.ts
'use client';

import { useDateFiltersStore } from '@/store/dateFiltersStore';
import { DateFilterState, AnalysisPeriod, ComparisonPeriod } from '@/types/dateFilters';

interface APIDateRange {
  readonly start: string; // Format PostgreSQL "YYYY-MM-DD"
  readonly end: string;   // Format PostgreSQL "YYYY-MM-DD"
}

interface APIDateFilters {
  readonly analysisPeriod: APIDateRange;
  readonly comparisonPeriod: APIDateRange;
}

interface UseDateFiltersReturn {
  readonly dateFilters: DateFilterState;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly setAnalysisPeriod: (period: AnalysisPeriod) => void;
  readonly setComparisonPeriod: (period: ComparisonPeriod) => void;
  readonly setFilters: (filters: DateFilterState) => void;
  readonly resetToDefaults: () => void;
  readonly getAPIFormat: () => APIDateFilters;
  readonly setLoading: (loading: boolean) => void;
  readonly setError: (error: string | null) => void;
}

/**
 * Hook personnalisé pour gérer les filtres de dates
 * 
 * @example
 * const { 
 *   dateFilters, 
 *   setAnalysisPeriod, 
 *   setComparisonPeriod, 
 *   getAPIFormat 
 * } = useDateFilters();
 * 
 * // Utilisation pour API
 * const apiData = getAPIFormat();
 * // { analysisPeriod: { start: "2025-01-01", end: "2025-01-31" }, ... }
 */
export const useDateFilters = (): UseDateFiltersReturn => {
  const store = useDateFiltersStore();

  return {
    dateFilters: store.filters,
    isLoading: store.isLoading,
    error: store.error,
    setAnalysisPeriod: store.setAnalysisPeriod,
    setComparisonPeriod: store.setComparisonPeriod,
    setFilters: store.setFilters,
    resetToDefaults: store.resetToDefaults,
    getAPIFormat: store.getAPIFormat,
    setLoading: store.setLoading,
    setError: store.setError
  };
};
// src/stores/dateFiltersStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DateFilterState, DateUtils } from '@/types/dateFilters';

interface APIDateRange {
  readonly start: string; // Format PostgreSQL "YYYY-MM-DD"
  readonly end: string;   // Format PostgreSQL "YYYY-MM-DD"
}

interface APIDateFilters {
  readonly analysisPeriod: APIDateRange;
  readonly comparisonPeriod: APIDateRange;
}

interface DateFiltersState {
  readonly filters: DateFilterState;
  readonly isLoading: boolean;
  readonly error: string | null;
}

interface DateFiltersActions {
  readonly setFilters: (filters: DateFilterState) => void;
  readonly setAnalysisPeriod: (period: DateFilterState['analysisPeriod']) => void;
  readonly setComparisonPeriod: (period: DateFilterState['comparisonPeriod']) => void;
  readonly resetToDefaults: () => void;
  readonly setLoading: (loading: boolean) => void;
  readonly setError: (error: string | null) => void;
  readonly getAPIFormat: () => APIDateFilters;
}

const getDefaultFilters = (): DateFilterState => {
  const currentMonth = DateUtils.getCurrentMonth();
  const previousPeriod = DateUtils.getPreviousPeriod(currentMonth);
  
  return {
    analysisPeriod: {
      type: 'current_month',
      range: currentMonth,
      label: 'Mois en cours'
    },
    comparisonPeriod: {
      type: 'previous_period',
      range: previousPeriod,
      label: 'Période précédente'
    }
  };
};

const formatDateForAPI = (date: Date): string => {
  const isoString = date.toISOString().split('T')[0];
  if (!isoString) {
    throw new Error('Invalid date format');
  }
  return isoString; // "YYYY-MM-DD"
};

export const useDateFiltersStore = create<DateFiltersState & DateFiltersActions>()(
  devtools(
    (set, get) => ({
      // État initial
      filters: getDefaultFilters(),
      isLoading: false,
      error: null,

      // Actions
      setFilters: (filters) => {
        set({ 
          filters, 
          error: null 
        }, false, 'setFilters');
      },

      setAnalysisPeriod: (analysisPeriod) => {
        const currentState = get();
        // Recalculer automatiquement la période de comparaison si nécessaire
        let newComparisonPeriod = currentState.filters.comparisonPeriod;
        
        if (currentState.filters.comparisonPeriod.type === 'previous_period') {
          newComparisonPeriod = {
            type: 'previous_period',
            range: DateUtils.getPreviousPeriod(analysisPeriod.range),
            label: 'Période précédente'
          };
        } else if (currentState.filters.comparisonPeriod.type === 'same_period_last_year') {
          newComparisonPeriod = {
            type: 'same_period_last_year',
            range: DateUtils.getSamePeriodLastYear(analysisPeriod.range),
            label: 'Année dernière'
          };
        }

        set({
          filters: {
            analysisPeriod,
            comparisonPeriod: newComparisonPeriod
          },
          error: null
        }, false, 'setAnalysisPeriod');
      },

      setComparisonPeriod: (comparisonPeriod) => {
        const currentState = get();
        set({
          filters: {
            ...currentState.filters,
            comparisonPeriod
          },
          error: null
        }, false, 'setComparisonPeriod');
      },

      resetToDefaults: () => {
        set({
          filters: getDefaultFilters(),
          error: null,
          isLoading: false
        }, false, 'resetToDefaults');
      },

      setLoading: (isLoading) => {
        set({ isLoading }, false, 'setLoading');
      },

      setError: (error) => {
        set({ error, isLoading: false }, false, 'setError');
      },

      getAPIFormat: (): APIDateFilters => {
        const { filters } = get();
        return {
          analysisPeriod: {
            start: formatDateForAPI(filters.analysisPeriod.range.start),
            end: formatDateForAPI(filters.analysisPeriod.range.end)
          },
          comparisonPeriod: {
            start: formatDateForAPI(filters.comparisonPeriod.range.start),
            end: formatDateForAPI(filters.comparisonPeriod.range.end)
          }
        };
      }
    }),
    { 
      name: 'date-filters-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// Sélecteurs optimisés pour éviter les re-renders
export const useDateFilters = () => useDateFiltersStore(state => state.filters);
export const useDateFiltersLoading = () => useDateFiltersStore(state => state.isLoading);
export const useDateFiltersError = () => useDateFiltersStore(state => state.error);
export const useDateFiltersActions = () => useDateFiltersStore(state => ({
  setFilters: state.setFilters,
  setAnalysisPeriod: state.setAnalysisPeriod,
  setComparisonPeriod: state.setComparisonPeriod,
  resetToDefaults: state.resetToDefaults,
  setLoading: state.setLoading,
  setError: state.setError,
  getAPIFormat: state.getAPIFormat
}));
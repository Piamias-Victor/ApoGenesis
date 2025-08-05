// src/hooks/dashboard/usePharmacyFilters.ts
'use client';

import { usePharmacyFiltersStore } from "@/store/pharmacyFiltersStore";


interface Pharmacy {
  readonly id: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly id_nat: string | null;
  readonly name: string | null;
  readonly ca: string | null;
  readonly area: string | null;
  readonly employees_count: number | null;
  readonly address: string | null;
}

type CARange = 'all' | '0-3' | '3-5' | '5.1-7' | '7-10' | '10+';
type EmployeesRange = 'all' | '<10' | '10-20' | '20-30' | '>30';

interface UsePharmacyFiltersReturn {
  readonly pharmacies: Pharmacy[];
  readonly selectedPharmacyIds: string[];
  readonly selectedPharmacies: Pharmacy[];
  readonly searchTerm: string;
  readonly selectedRegions: string[];
  readonly caRange: CARange;
  readonly employeesRange: EmployeesRange;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly filteredPharmacies: Pharmacy[];
  readonly selectedCount: number;
  readonly totalCount: number;
  readonly setPharmacies: (pharmacies: Pharmacy[]) => void;
  readonly setSelectedPharmacyIds: (ids: string[]) => void;
  readonly togglePharmacySelection: (id: string) => void;
  readonly selectAllPharmacies: () => void;
  readonly deselectAllPharmacies: () => void;
  readonly setSearchTerm: (term: string) => void;
  readonly toggleRegionSelection: (region: string) => void;
  readonly setCARange: (range: CARange) => void;
  readonly setEmployeesRange: (range: EmployeesRange) => void;
  readonly resetFilters: () => void;
  readonly getPharmaciesByRegion: (region: string) => Pharmacy[];
  readonly getAPIFormat: () => string[];
}

/**
 * Hook personnalisé pour gérer les filtres de pharmacies
 * 
 * @example
 * const { 
 *   selectedPharmacies,
 *   togglePharmacySelection,
 *   setSearchTerm,
 *   getAPIFormat
 * } = usePharmacyFilters();
 * 
 * // Utilisation pour API
 * const selectedIds = getAPIFormat();
 * // ["uuid1", "uuid2", "uuid3"]
 */
export const usePharmacyFilters = (): UsePharmacyFiltersReturn => {
  const store = usePharmacyFiltersStore();
  
  // Calculs dérivés
  const filteredPharmacies = store.getFilteredPharmacies();
  const selectedPharmacies = store.pharmacies.filter(p => 
    store.selectedPharmacyIds.includes(p.id)
  );
  const selectedCount = store.selectedPharmacyIds.length;
  const totalCount = store.pharmacies.length;

  return {
    // État de base
    pharmacies: store.pharmacies,
    selectedPharmacyIds: store.selectedPharmacyIds,
    selectedPharmacies,
    searchTerm: store.searchTerm,
    selectedRegions: store.selectedRegions,
    caRange: store.caRange,
    employeesRange: store.employeesRange,
    isLoading: store.isLoading,
    error: store.error,
    
    // Données calculées
    filteredPharmacies,
    selectedCount,
    totalCount,
    
    // Actions
    setPharmacies: store.setPharmacies,
    setSelectedPharmacyIds: store.setSelectedPharmacyIds,
    togglePharmacySelection: store.togglePharmacySelection,
    selectAllPharmacies: store.selectAllPharmacies,
    deselectAllPharmacies: store.deselectAllPharmacies,
    setSearchTerm: store.setSearchTerm,
    toggleRegionSelection: store.toggleRegionSelection,
    setCARange: store.setCARange,
    setEmployeesRange: store.setEmployeesRange,
    resetFilters: store.resetFilters,
    getPharmaciesByRegion: store.getPharmaciesByRegion,
    
    // Format API
    getAPIFormat: (): string[] => store.selectedPharmacyIds,
  };
};
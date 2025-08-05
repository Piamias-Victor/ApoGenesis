// src/stores/pharmacyFiltersStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Pharmacy {
  readonly id: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly id_nat: string | null;
  readonly name: string | null;
  readonly ca: string | null; // Format PostgreSQL "15354910.49"
  readonly area: string | null;
  readonly employees_count: number | null;
  readonly address: string | null;
}

type CARange = 'all' | '0-3' | '3-5' | '5.1-7' | '7-10' | '10+';
type EmployeesRange = 'all' | '<10' | '10-20' | '20-30' | '>30';

interface PharmacyFiltersState {
  readonly pharmacies: Pharmacy[];
  readonly selectedPharmacyIds: string[];
  readonly searchTerm: string;
  readonly selectedRegions: string[];
  readonly caRange: CARange;
  readonly employeesRange: EmployeesRange;
  readonly isLoading: boolean;
  readonly error: string | null;
}

interface PharmacyFiltersActions {
  readonly setPharmacies: (pharmacies: Pharmacy[]) => void;
  readonly setSelectedPharmacyIds: (ids: string[]) => void;
  readonly togglePharmacySelection: (id: string) => void;
  readonly selectAllPharmacies: () => void;
  readonly deselectAllPharmacies: () => void;
  readonly setSearchTerm: (term: string) => void;
  readonly setSelectedRegions: (regions: string[]) => void;
  readonly toggleRegionSelection: (region: string) => void;
  readonly setCARange: (range: CARange) => void;
  readonly setEmployeesRange: (range: EmployeesRange) => void;
  readonly setLoading: (loading: boolean) => void;
  readonly setError: (error: string | null) => void;
  readonly resetFilters: () => void;
  readonly getFilteredPharmacies: () => Pharmacy[];
  readonly getPharmaciesByRegion: (region: string) => Pharmacy[];
}

const getDefaultState = (): PharmacyFiltersState => ({
  pharmacies: [],
  selectedPharmacyIds: [],
  searchTerm: '',
  selectedRegions: [],
  caRange: 'all',
  employeesRange: 'all',
  isLoading: false,
  error: null,
});

// Utilitaires de filtrage
const filterBySearch = (pharmacies: Pharmacy[], searchTerm: string): Pharmacy[] => {
  if (!searchTerm.trim()) return pharmacies;
  
  const term = searchTerm.toLowerCase().trim();
  return pharmacies.filter(pharmacy => 
    pharmacy.name?.toLowerCase().includes(term) ||
    pharmacy.area?.toLowerCase().includes(term) ||
    pharmacy.address?.toLowerCase().includes(term)
  );
};

const filterByRegions = (pharmacies: Pharmacy[], regions: string[]): Pharmacy[] => {
  if (regions.length === 0) return pharmacies;
  
  return pharmacies.filter(pharmacy => 
    pharmacy.area && regions.includes(pharmacy.area)
  );
};

const filterByCA = (pharmacies: Pharmacy[], range: CARange): Pharmacy[] => {
  if (range === 'all') return pharmacies;
  
  return pharmacies.filter(pharmacy => {
    if (!pharmacy.ca) return false;
    
    const ca = parseFloat(pharmacy.ca) / 1000000; // Conversion en millions
    
    switch (range) {
      case '0-3': return ca >= 0 && ca <= 3;
      case '3-5': return ca > 3 && ca <= 5;
      case '5.1-7': return ca > 5.1 && ca <= 7;
      case '7-10': return ca > 7 && ca <= 10;
      case '10+': return ca > 10;
      default: return true;
    }
  });
};

const filterByEmployees = (pharmacies: Pharmacy[], range: EmployeesRange): Pharmacy[] => {
  if (range === 'all') return pharmacies;
  
  return pharmacies.filter(pharmacy => {
    if (pharmacy.employees_count === null) return false;
    
    const count = pharmacy.employees_count;
    
    switch (range) {
      case '<10': return count < 10;
      case '10-20': return count >= 10 && count <= 20;
      case '20-30': return count >= 20 && count <= 30;
      case '>30': return count > 30;
      default: return true;
    }
  });
};

export const usePharmacyFiltersStore = create<PharmacyFiltersState & PharmacyFiltersActions>(
  devtools(
    (set, get) => ({
      // État initial
      ...getDefaultState(),

      // Actions
      setPharmacies: (pharmacies) => {
        set({ pharmacies, error: null }, false, 'setPharmacies');
      },

      setSelectedPharmacyIds: (selectedPharmacyIds) => {
        set({ selectedPharmacyIds }, false, 'setSelectedPharmacyIds');
      },

      togglePharmacySelection: (id) => {
        const { selectedPharmacyIds } = get();
        const newIds = selectedPharmacyIds.includes(id)
          ? selectedPharmacyIds.filter(existingId => existingId !== id)
          : [...selectedPharmacyIds, id];
        
        set({ selectedPharmacyIds: newIds }, false, 'togglePharmacySelection');
      },

      selectAllPharmacies: () => {
        const { getFilteredPharmacies } = get();
        const filteredPharmacies = getFilteredPharmacies();
        const allIds = filteredPharmacies.map(p => p.id);
        
        set({ selectedPharmacyIds: allIds }, false, 'selectAllPharmacies');
      },

      deselectAllPharmacies: () => {
        set({ selectedPharmacyIds: [] }, false, 'deselectAllPharmacies');
      },

      setSearchTerm: (searchTerm) => {
        set({ searchTerm }, false, 'setSearchTerm');
      },

      setSelectedRegions: (selectedRegions) => {
        set({ selectedRegions }, false, 'setSelectedRegions');
      },

      toggleRegionSelection: (region) => {
        const { selectedRegions } = get();
        const newRegions = selectedRegions.includes(region)
          ? selectedRegions.filter(r => r !== region)
          : [...selectedRegions, region];
        
        set({ selectedRegions: newRegions }, false, 'toggleRegionSelection');
      },

      setCARange: (caRange) => {
        set({ caRange }, false, 'setCARange');
      },

      setEmployeesRange: (employeesRange) => {
        set({ employeesRange }, false, 'setEmployeesRange');
      },

      setLoading: (isLoading) => {
        set({ isLoading }, false, 'setLoading');
      },

      setError: (error) => {
        set({ error, isLoading: false }, false, 'setError');
      },

      resetFilters: () => {
        const { pharmacies } = get();
        set({
          ...getDefaultState(),
          pharmacies, // Garder les pharmacies chargées
        }, false, 'resetFilters');
      },

      getFilteredPharmacies: () => {
        const { 
          pharmacies, 
          searchTerm, 
          selectedRegions, 
          caRange, 
          employeesRange 
        } = get();
        
        let filtered = pharmacies;
        filtered = filterBySearch(filtered, searchTerm);
        filtered = filterByRegions(filtered, selectedRegions);
        filtered = filterByCA(filtered, caRange);
        filtered = filterByEmployees(filtered, employeesRange);
        
        return filtered;
      },

      getPharmaciesByRegion: (region) => {
        const { pharmacies } = get();
        return pharmacies.filter(pharmacy => pharmacy.area === region);
      },
    }),
    { 
      name: 'pharmacy-filters-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// Sélecteurs optimisés
export const usePharmacies = () => usePharmacyFiltersStore(state => state.pharmacies);
export const useSelectedPharmacyIds = () => usePharmacyFiltersStore(state => state.selectedPharmacyIds);
export const usePharmacyFiltersActions = () => usePharmacyFiltersStore(state => ({
  setPharmacies: state.setPharmacies,
  togglePharmacySelection: state.togglePharmacySelection,
  selectAllPharmacies: state.selectAllPharmacies,
  deselectAllPharmacies: state.deselectAllPharmacies,
  setSearchTerm: state.setSearchTerm,
  toggleRegionSelection: state.toggleRegionSelection,
  setCARange: state.setCARange,
  setEmployeesRange: state.setEmployeesRange,
  resetFilters: state.resetFilters,
  getFilteredPharmacies: state.getFilteredPharmacies,
  getPharmaciesByRegion: state.getPharmaciesByRegion,
}));
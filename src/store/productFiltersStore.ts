// src/store/productFiltersStore.ts (EXTENDED)
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Product {
  readonly code_13_ref: string;
  readonly name: string;
  readonly brand_lab: string | null;
  readonly universe: string | null;
  readonly category: string | null;
}

interface Laboratory {
  readonly name: string;
  readonly productCount: number;
  readonly universes: string[];
}

interface ProductFiltersState {
  // === PRODUCTS ===
  readonly selectedProductIds: string[]; // code_13_ref
  readonly searchResults: Product[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly lastSearchQuery: string;
  readonly lastSearchType: 'name' | 'code';
  
  // === LABORATORIES ===
  readonly selectedLaboratoryNames: string[]; // brand_lab names
  readonly laboratorySearchResults: Laboratory[];
  readonly isLaboratoryLoading: boolean;
  readonly laboratoryError: string | null;
  readonly lastLaboratorySearchQuery: string;
}

interface ProductFiltersActions {
  // === PRODUCTS ACTIONS ===
  readonly setSelectedProductIds: (ids: string[]) => void;
  readonly toggleProductSelection: (code_13_ref: string) => void;
  readonly selectAllProducts: () => void;
  readonly deselectAllProducts: () => void;
  readonly setSearchResults: (products: Product[]) => void;
  readonly setLoading: (loading: boolean) => void;
  readonly setError: (error: string | null) => void;
  readonly setLastSearch: (query: string, type: 'name' | 'code') => void;
  
  // === LABORATORIES ACTIONS ===
  readonly setSelectedLaboratoryNames: (names: string[]) => void;
  readonly toggleLaboratorySelection: (name: string) => void;
  readonly selectAllLaboratories: () => void;
  readonly deselectAllLaboratories: () => void;
  readonly setLaboratorySearchResults: (laboratories: Laboratory[]) => void;
  readonly setLaboratoryLoading: (loading: boolean) => void;
  readonly setLaboratoryError: (error: string | null) => void;
  readonly setLastLaboratorySearch: (query: string) => void;
  
  // === SHARED ACTIONS ===
  readonly resetFilters: () => void;
  readonly resetProductFilters: () => void;
  readonly resetLaboratoryFilters: () => void;
  readonly getSelectedProducts: () => Product[];
  readonly getSelectedLaboratories: () => Laboratory[];
  readonly isProductSelected: (code_13_ref: string) => boolean;
  readonly isLaboratorySelected: (name: string) => boolean;
  readonly getAPIFormat: () => {
    productIds: string[];
    laboratoryNames: string[];
  };
}

const getDefaultState = (): ProductFiltersState => ({
  // Products
  selectedProductIds: [],
  searchResults: [],
  isLoading: false,
  error: null,
  lastSearchQuery: '',
  lastSearchType: 'name',
  
  // Laboratories
  selectedLaboratoryNames: [],
  laboratorySearchResults: [],
  isLaboratoryLoading: false,
  laboratoryError: null,
  lastLaboratorySearchQuery: '',
});

type ProductFiltersStore = ProductFiltersState & ProductFiltersActions;

export const useProductFiltersStore = create<ProductFiltersStore>()(
  devtools(
    (set, get) => ({
      ...getDefaultState(),

      // === PRODUCTS ACTIONS ===
      setSelectedProductIds: (selectedProductIds) => {
        set({ selectedProductIds }, false, 'setSelectedProductIds');
      },

      toggleProductSelection: (code_13_ref) => {
        const { selectedProductIds } = get();
        const newIds = selectedProductIds.includes(code_13_ref)
          ? selectedProductIds.filter(id => id !== code_13_ref)
          : [...selectedProductIds, code_13_ref];
        
        set({ selectedProductIds: newIds }, false, 'toggleProductSelection');
      },

      selectAllProducts: () => {
        const { searchResults } = get();
        const allIds = searchResults.map(p => p.code_13_ref);
        set({ selectedProductIds: allIds }, false, 'selectAllProducts');
      },

      deselectAllProducts: () => {
        set({ selectedProductIds: [] }, false, 'deselectAllProducts');
      },

      setSearchResults: (searchResults) => {
        set({ searchResults, error: null }, false, 'setSearchResults');
      },

      setLoading: (isLoading) => {
        set({ isLoading }, false, 'setLoading');
      },

      setError: (error) => {
        set({ error, isLoading: false }, false, 'setError');
      },

      setLastSearch: (lastSearchQuery, lastSearchType) => {
        set({ lastSearchQuery, lastSearchType }, false, 'setLastSearch');
      },

      // === LABORATORIES ACTIONS ===
      setSelectedLaboratoryNames: (selectedLaboratoryNames) => {
        set({ selectedLaboratoryNames }, false, 'setSelectedLaboratoryNames');
      },

      toggleLaboratorySelection: (name) => {
        const { selectedLaboratoryNames } = get();
        const newNames = selectedLaboratoryNames.includes(name)
          ? selectedLaboratoryNames.filter(n => n !== name)
          : [...selectedLaboratoryNames, name];
        
        set({ selectedLaboratoryNames: newNames }, false, 'toggleLaboratorySelection');
      },

      selectAllLaboratories: () => {
        const { laboratorySearchResults } = get();
        const allNames = laboratorySearchResults.map(l => l.name);
        set({ selectedLaboratoryNames: allNames }, false, 'selectAllLaboratories');
      },

      deselectAllLaboratories: () => {
        set({ selectedLaboratoryNames: [] }, false, 'deselectAllLaboratories');
      },

      setLaboratorySearchResults: (laboratorySearchResults) => {
        set({ laboratorySearchResults, laboratoryError: null }, false, 'setLaboratorySearchResults');
      },

      setLaboratoryLoading: (isLaboratoryLoading) => {
        set({ isLaboratoryLoading }, false, 'setLaboratoryLoading');
      },

      setLaboratoryError: (laboratoryError) => {
        set({ laboratoryError, isLaboratoryLoading: false }, false, 'setLaboratoryError');
      },

      setLastLaboratorySearch: (lastLaboratorySearchQuery) => {
        set({ lastLaboratorySearchQuery }, false, 'setLastLaboratorySearch');
      },

      // === SHARED ACTIONS ===
      resetFilters: () => {
        set({
          ...getDefaultState(),
        }, false, 'resetFilters');
      },

      resetProductFilters: () => {
        const current = get();
        set({
          selectedProductIds: [],
          searchResults: [],
          isLoading: false,
          error: null,
          lastSearchQuery: '',
          lastSearchType: 'name',
        }, false, 'resetProductFilters');
      },

      resetLaboratoryFilters: () => {
        set({
          selectedLaboratoryNames: [],
          laboratorySearchResults: [],
          isLaboratoryLoading: false,
          laboratoryError: null,
          lastLaboratorySearchQuery: '',
        }, false, 'resetLaboratoryFilters');
      },

      getSelectedProducts: () => {
        const { selectedProductIds, searchResults } = get();
        return searchResults.filter(p => selectedProductIds.includes(p.code_13_ref));
      },

      getSelectedLaboratories: () => {
        const { selectedLaboratoryNames, laboratorySearchResults } = get();
        return laboratorySearchResults.filter(l => selectedLaboratoryNames.includes(l.name));
      },

      isProductSelected: (code_13_ref) => {
        const { selectedProductIds } = get();
        return selectedProductIds.includes(code_13_ref);
      },

      isLaboratorySelected: (name) => {
        const { selectedLaboratoryNames } = get();
        return selectedLaboratoryNames.includes(name);
      },

      getAPIFormat: () => {
        const { selectedProductIds, selectedLaboratoryNames } = get();
        return {
          productIds: selectedProductIds,
          laboratoryNames: selectedLaboratoryNames,
        };
      },
    }),
    { 
      name: 'product-filters-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// === SELECTORS OPTIMISÉS ===

// Products selectors
export const useSelectedProductIds = () => useProductFiltersStore(state => state.selectedProductIds);
export const useSearchResults = () => useProductFiltersStore(state => state.searchResults);
export const useProductFiltersLoading = () => useProductFiltersStore(state => state.isLoading);
export const useProductFiltersError = () => useProductFiltersStore(state => state.error);

// Laboratories selectors
export const useSelectedLaboratoryNames = () => useProductFiltersStore(state => state.selectedLaboratoryNames);
export const useLaboratorySearchResults = () => useProductFiltersStore(state => state.laboratorySearchResults);
export const useLaboratoryFiltersLoading = () => useProductFiltersStore(state => state.isLaboratoryLoading);
export const useLaboratoryFiltersError = () => useProductFiltersStore(state => state.laboratoryError);

// Combined selectors
export const useProductFiltersActions = () => useProductFiltersStore(state => ({
  // Products
  setSelectedProductIds: state.setSelectedProductIds,
  toggleProductSelection: state.toggleProductSelection,
  selectAllProducts: state.selectAllProducts,
  deselectAllProducts: state.deselectAllProducts,
  setSearchResults: state.setSearchResults,
  setLoading: state.setLoading,
  setError: state.setError,
  setLastSearch: state.setLastSearch,
  
  // Laboratories
  setSelectedLaboratoryNames: state.setSelectedLaboratoryNames,
  toggleLaboratorySelection: state.toggleLaboratorySelection,
  selectAllLaboratories: state.selectAllLaboratories,
  deselectAllLaboratories: state.deselectAllLaboratories,
  setLaboratorySearchResults: state.setLaboratorySearchResults,
  setLaboratoryLoading: state.setLaboratoryLoading,
  setLaboratoryError: state.setLaboratoryError,
  setLastLaboratorySearch: state.setLastLaboratorySearch,
  
  // Shared
  resetFilters: state.resetFilters,
  resetProductFilters: state.resetProductFilters,
  resetLaboratoryFilters: state.resetLaboratoryFilters,
  getSelectedProducts: state.getSelectedProducts,
  getSelectedLaboratories: state.getSelectedLaboratories,
  isProductSelected: state.isProductSelected,
  isLaboratorySelected: state.isLaboratorySelected,
  getAPIFormat: state.getAPIFormat,
}));
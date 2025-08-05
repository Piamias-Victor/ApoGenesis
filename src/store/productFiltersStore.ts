// src/store/productFiltersStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Product {
  readonly code_13_ref: string;
  readonly name: string;
  readonly brand_lab: string | null;
  readonly universe: string | null;
  readonly category: string | null;
}

interface ProductFiltersState {
  readonly selectedProductIds: string[]; // code_13_ref
  readonly searchResults: Product[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly lastSearchQuery: string;
  readonly lastSearchType: 'name' | 'code';
}

interface ProductFiltersActions {
  readonly setSelectedProductIds: (ids: string[]) => void;
  readonly toggleProductSelection: (code_13_ref: string) => void;
  readonly selectAllProducts: () => void;
  readonly deselectAllProducts: () => void;
  readonly setSearchResults: (products: Product[]) => void;
  readonly setLoading: (loading: boolean) => void;
  readonly setError: (error: string | null) => void;
  readonly setLastSearch: (query: string, type: 'name' | 'code') => void;
  readonly resetFilters: () => void;
  readonly getSelectedProducts: () => Product[];
  readonly isProductSelected: (code_13_ref: string) => boolean;
  readonly getAPIFormat: () => string[];
}

const getDefaultState = (): ProductFiltersState => ({
  selectedProductIds: [],
  searchResults: [],
  isLoading: false,
  error: null,
  lastSearchQuery: '',
  lastSearchType: 'name',
});

type ProductFiltersStore = ProductFiltersState & ProductFiltersActions;

export const useProductFiltersStore = create<ProductFiltersStore>()(
  devtools(
    (set, get) => ({
      ...getDefaultState(),

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

      resetFilters: () => {
        set({
          ...getDefaultState(),
        }, false, 'resetFilters');
      },

      getSelectedProducts: () => {
        const { selectedProductIds, searchResults } = get();
        return searchResults.filter(p => selectedProductIds.includes(p.code_13_ref));
      },

      isProductSelected: (code_13_ref) => {
        const { selectedProductIds } = get();
        return selectedProductIds.includes(code_13_ref);
      },

      getAPIFormat: (): string[] => {
        const { selectedProductIds } = get();
        return selectedProductIds;
      },
    }),
    { 
      name: 'product-filters-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// Sélecteurs optimisés pour éviter les re-renders
export const useSelectedProductIds = () => useProductFiltersStore(state => state.selectedProductIds);
export const useSearchResults = () => useProductFiltersStore(state => state.searchResults);
export const useProductFiltersLoading = () => useProductFiltersStore(state => state.isLoading);
export const useProductFiltersError = () => useProductFiltersStore(state => state.error);
export const useProductFiltersActions = () => useProductFiltersStore(state => ({
  setSelectedProductIds: state.setSelectedProductIds,
  toggleProductSelection: state.toggleProductSelection,
  selectAllProducts: state.selectAllProducts,
  deselectAllProducts: state.deselectAllProducts,
  setSearchResults: state.setSearchResults,
  setLoading: state.setLoading,
  setError: state.setError,
  setLastSearch: state.setLastSearch,
  resetFilters: state.resetFilters,
  getSelectedProducts: state.getSelectedProducts,
  isProductSelected: state.isProductSelected,
  getAPIFormat: state.getAPIFormat,
}));
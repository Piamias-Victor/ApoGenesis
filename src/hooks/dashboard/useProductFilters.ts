// src/hooks/dashboard/useProductFilters.ts
'use client';

import { useProductFiltersStore } from '@/store/productFiltersStore';

interface Product {
  readonly code_13_ref: string;
  readonly name: string;
  readonly brand_lab: string | null;
  readonly universe: string | null;
  readonly category: string | null;
}

interface UseProductFiltersReturn {
  readonly selectedProductIds: string[];
  readonly selectedProducts: Product[];
  readonly searchResults: Product[];
  readonly selectedCount: number;
  readonly totalResults: number;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly lastSearchQuery: string;
  readonly lastSearchType: 'name' | 'code';
  readonly setSelectedProductIds: (ids: string[]) => void;
  readonly toggleProductSelection: (code_13_ref: string) => void;
  readonly selectAllProducts: () => void;
  readonly deselectAllProducts: () => void;
  readonly resetFilters: () => void;
  readonly isProductSelected: (code_13_ref: string) => boolean;
  readonly getAPIFormat: () => string[];
}

/**
 * Hook personnalisé pour gérer les filtres de produits
 * 
 * @example
 * const { 
 *   selectedProducts,
 *   toggleProductSelection,
 *   selectedCount,
 *   getAPIFormat
 * } = useProductFilters();
 * 
 * // Utilisation pour API
 * const selectedIds = getAPIFormat();
 * // ["3401579", "3401580", "3401581"]
 */
export const useProductFilters = (): UseProductFiltersReturn => {
  const store = useProductFiltersStore();
  
  // Calculs dérivés
  const selectedProducts = store.getSelectedProducts();
  const selectedCount = store.selectedProductIds.length;
  const totalResults = store.searchResults.length;

  return {
    // État de base
    selectedProductIds: store.selectedProductIds,
    selectedProducts,
    searchResults: store.searchResults,
    selectedCount,
    totalResults,
    isLoading: store.isLoading,
    error: store.error,
    lastSearchQuery: store.lastSearchQuery,
    lastSearchType: store.lastSearchType,
    
    // Actions
    setSelectedProductIds: store.setSelectedProductIds,
    toggleProductSelection: store.toggleProductSelection,
    selectAllProducts: store.selectAllProducts,
    deselectAllProducts: store.deselectAllProducts,
    resetFilters: store.resetFilters,
    isProductSelected: store.isProductSelected,
    
    // Format API
    getAPIFormat: (): string[] => store.selectedProductIds,
  };
};
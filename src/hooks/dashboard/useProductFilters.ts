// src/hooks/dashboard/useProductFilters.ts (UPDATED)
'use client';

import { useProductFiltersStore } from '@/store/productFiltersStore';

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

interface UseProductFiltersReturn {
  // === PRODUCTS ===
  readonly selectedProductIds: string[];
  readonly selectedProducts: Product[];
  readonly searchResults: Product[];
  readonly selectedProductCount: number;
  readonly totalProductResults: number;
  readonly isProductLoading: boolean;
  readonly productError: string | null;
  readonly lastProductSearchQuery: string;
  readonly lastSearchType: 'name' | 'code';

  // === LABORATORIES ===
  readonly selectedLaboratoryNames: string[];
  readonly selectedLaboratories: Laboratory[];
  readonly laboratorySearchResults: Laboratory[];
  readonly selectedLaboratoryCount: number;
  readonly totalLaboratoryResults: number;
  readonly isLaboratoryLoading: boolean;
  readonly laboratoryError: string | null;
  readonly lastLaboratorySearchQuery: string;

  // === COMBINED ===
  readonly totalSelections: number;
  readonly hasSelections: boolean;
  readonly hasProductSelections: boolean;
  readonly hasLaboratorySelections: boolean;

  // === ACTIONS ===
  readonly setSelectedProductIds: (ids: string[]) => void;
  readonly toggleProductSelection: (code_13_ref: string) => void;
  readonly selectAllProducts: () => void;
  readonly deselectAllProducts: () => void;
  readonly setSelectedLaboratoryNames: (names: string[]) => void;
  readonly toggleLaboratorySelection: (name: string) => void;
  readonly selectAllLaboratories: () => void;
  readonly deselectAllLaboratories: () => void;
  readonly resetFilters: () => void;
  readonly resetProductFilters: () => void;
  readonly resetLaboratoryFilters: () => void;
  readonly isProductSelected: (code_13_ref: string) => boolean;
  readonly isLaboratorySelected: (name: string) => boolean;
  readonly getAPIFormat: () => {
    productIds: string[];
    laboratoryNames: string[];
  };
}

/**
 * Hook personnalisé pour gérer les filtres de produits ET laboratoires
 * 
 * @example
 * const { 
 *   selectedProducts,
 *   selectedLaboratories,
 *   toggleProductSelection,
 *   toggleLaboratorySelection,
 *   totalSelections,
 *   getAPIFormat
 * } = useProductFilters();
 * 
 * // Utilisation pour API
 * const apiData = getAPIFormat();
 * // { productIds: ["3401579"], laboratoryNames: ["Pfizer", "Sanofi"] }
 */
export const useProductFilters = (): UseProductFiltersReturn => {
  const store = useProductFiltersStore();
  
  // Calculs dérivés - Products
  const selectedProducts = store.getSelectedProducts();
  const selectedProductCount = store.selectedProductIds.length;
  const totalProductResults = store.searchResults.length;

  // Calculs dérivés - Laboratories
  const selectedLaboratories = store.getSelectedLaboratories();
  const selectedLaboratoryCount = store.selectedLaboratoryNames.length;
  const totalLaboratoryResults = store.laboratorySearchResults.length;

  // Calculs dérivés - Combined
  const totalSelections = selectedProductCount + selectedLaboratoryCount;
  const hasSelections = totalSelections > 0;
  const hasProductSelections = selectedProductCount > 0;
  const hasLaboratorySelections = selectedLaboratoryCount > 0;

  return {
    // === PRODUCTS ===
    selectedProductIds: store.selectedProductIds,
    selectedProducts,
    searchResults: store.searchResults,
    selectedProductCount,
    totalProductResults,
    isProductLoading: store.isLoading,
    productError: store.error,
    lastProductSearchQuery: store.lastSearchQuery,
    lastSearchType: store.lastSearchType,

    // === LABORATORIES ===
    selectedLaboratoryNames: store.selectedLaboratoryNames,
    selectedLaboratories,
    laboratorySearchResults: store.laboratorySearchResults,
    selectedLaboratoryCount,
    totalLaboratoryResults,
    isLaboratoryLoading: store.isLaboratoryLoading,
    laboratoryError: store.laboratoryError,
    lastLaboratorySearchQuery: store.lastLaboratorySearchQuery,

    // === COMBINED ===
    totalSelections,
    hasSelections,
    hasProductSelections,
    hasLaboratorySelections,

    // === ACTIONS ===
    setSelectedProductIds: store.setSelectedProductIds,
    toggleProductSelection: store.toggleProductSelection,
    selectAllProducts: store.selectAllProducts,
    deselectAllProducts: store.deselectAllProducts,
    setSelectedLaboratoryNames: store.setSelectedLaboratoryNames,
    toggleLaboratorySelection: store.toggleLaboratorySelection,
    selectAllLaboratories: store.selectAllLaboratories,
    deselectAllLaboratories: store.deselectAllLaboratories,
    resetFilters: store.resetFilters,
    resetProductFilters: store.resetProductFilters,
    resetLaboratoryFilters: store.resetLaboratoryFilters,
    isProductSelected: store.isProductSelected,
    isLaboratorySelected: store.isLaboratorySelected,
    
    // Format API
    getAPIFormat: (): { productIds: string[]; laboratoryNames: string[]; } => store.getAPIFormat(),
  };
};
// src/components/molecules/ProductSearchInput/ProductSearchInput.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Building, Globe, Tag, Check, AlertCircle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { useProductFiltersStore } from '@/store/productFiltersStore';

interface Product {
  readonly code_13_ref: string;
  readonly name: string;
  readonly brand_lab: string | null;
  readonly universe: string | null;
  readonly category: string | null;
}

interface ProductsResponse {
  readonly success: boolean;
  readonly data: Product[];
  readonly count: number;
  readonly searchType: 'name' | 'code';
  readonly query: string;
  readonly timestamp: string;
  readonly cached?: boolean;
}

interface ProductSearchInputProps {
  readonly className?: string;
}

export const ProductSearchInput: React.FC<ProductSearchInputProps> = ({ 
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'code'>('name');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    searchResults,
    selectedProductIds,
    isLoading,
    error,
    setSearchResults,
    setLoading,
    setError,
    setLastSearch,
    toggleProductSelection,
    isProductSelected,
    selectAllProducts,
    deselectAllProducts,
    getSelectedProducts,
  } = useProductFiltersStore();

  // Détection automatique du type de recherche
  useEffect(() => {
    if (searchTerm.length >= 1) {
      const isNumericOrWildcard = /^[\d*]+$/.test(searchTerm);
      const newType = isNumericOrWildcard ? 'code' : 'name';
      if (newType !== searchType) {
        setSearchType(newType);
      }
    }
  }, [searchTerm, searchType]);

  // Debounced search après 3 caractères
  useEffect(() => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchTerm, searchType);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchType]);

  // Close dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (query: string, type: 'name' | 'code'): Promise<void> => {
    if (query.length < 3) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        type,
        limit: '100'
      });

      const response = await fetch(`/api/products?${params}`);
      const data: ProductsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur de recherche');
      }

      setSearchResults(data.data);
      setLastSearch(query, type);
      setIsDropdownOpen(data.data.length > 0);

    } catch (err) {
      console.error('Erreur recherche produits:', err);
      setError(err instanceof Error ? err.message : 'Erreur de recherche');
      setSearchResults([]);
      setIsDropdownOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  const handleProductClick = (product: Product): void => {
    toggleProductSelection(product.code_13_ref);
  };

  const handleRemoveProduct = (code_13_ref: string): void => {
    toggleProductSelection(code_13_ref);
  };

  const selectedProducts = getSelectedProducts();

  const getSearchPlaceholder = (): string => {
    if (searchType === 'code') {
      return 'Code produit (ex: 3401579, *4856)...';
    }
    return 'Nom produit (ex: aspirine, doliprane)...';
  };

  const formatProductDisplay = (product: Product): React.ReactNode => {
    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="font-mono text-sm text-gray-600 flex-shrink-0">
                {product.code_13_ref}
              </span>
            </div>
            <h4 className="font-medium text-gray-900 truncate mb-1">
              {product.name}
            </h4>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {product.brand_lab && (
                <div className="flex items-center space-x-1">
                  <Building className="w-3 h-3" />
                  <span className="truncate">{product.brand_lab}</span>
                </div>
              )}
              {product.universe && (
                <div className="flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span className="truncate">{product.universe}</span>
                </div>
              )}
              {product.category && (
                <div className="flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span className="truncate">{product.category}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div ref={containerRef} className="relative">
        {/* Input de recherche */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => {
              if (searchResults.length > 0) {
                setIsDropdownOpen(true);
              }
            }}
            placeholder={getSearchPlaceholder()}
            className="
              w-full pl-10 pr-4 py-3 text-sm rounded-lg border-2 border-gray-300
              bg-white text-gray-900 placeholder:text-gray-400
              hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
              focus:outline-none transition-all duration-200 ease-in-out
            "
          />

          {/* Indicateur de type de recherche */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className={`
              px-2 py-1 rounded text-xs font-medium
              ${searchType === 'code' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-blue-100 text-blue-700'
              }
            `}>
              {searchType === 'code' ? 'Code' : 'Nom'}
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Dropdown résultats */}
        <AnimatePresence>
          {isDropdownOpen && (searchResults.length > 0 || error) && (
            <motion.div
              className="
                absolute top-full left-0 right-0 mt-1 z-50
                bg-white rounded-lg border border-gray-200 shadow-xl
                max-h-96 overflow-y-auto
              "
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {error ? (
                <div className="p-4">
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  {/* Header avec info et boutons */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                    <div className="text-xs text-gray-500">
                      {searchResults.length} produit(s) trouvé(s)
                      {searchType === 'code' && searchTerm.includes('*') && (
                        <span className="ml-2 text-purple-600 font-medium">
                          (recherche avec wildcard)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={selectAllProducts}
                        disabled={searchResults.length === 0}
                        className="text-xs"
                      >
                        Tout sélectionner
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={deselectAllProducts}
                        disabled={selectedProductIds.length === 0}
                        className="text-xs"
                      >
                        Tout désélectionner
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mt-2">
                    {searchResults.map((product) => {
                      const selected = isProductSelected(product.code_13_ref);
                      
                      return (
                        <motion.button
                          key={product.code_13_ref}
                          onClick={() => handleProductClick(product)}
                          className={`
                            w-full flex items-start space-x-3 p-3 rounded-lg
                            transition-colors duration-200 text-left
                            ${selected
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50'
                            }
                          `}
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0
                            ${selected
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300'
                            }
                          `}>
                            {selected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          
                          {formatProductDisplay(product)}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Liste des produits sélectionnés */}
      {selectedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">
              Produits sélectionnés ({selectedProducts.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={deselectAllProducts}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Tout supprimer
            </Button>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedProducts.map((product) => (
              <motion.div
                key={product.code_13_ref}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <Package className="w-4 h-4 text-blue-600 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-xs text-blue-600 font-medium">
                      {product.code_13_ref}
                    </span>
                  </div>
                  <h5 className="font-medium text-gray-900 truncate text-sm">
                    {product.name}
                  </h5>
                  {product.brand_lab && (
                    <p className="text-xs text-gray-500 truncate">
                      {product.brand_lab}
                    </p>
                  )}
                </div>
                
                <motion.button
                  onClick={() => handleRemoveProduct(product.code_13_ref)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Supprimer ce produit"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
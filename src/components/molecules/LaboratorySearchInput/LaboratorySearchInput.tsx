// src/components/molecules/LaboratorySearchInput/LaboratorySearchInput.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building, Globe, Check, AlertCircle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { useProductFiltersStore } from '@/store/productFiltersStore';

interface Laboratory {
  readonly name: string;
  readonly productCount: number;
  readonly universes: string[];
}

interface LaboratoriesResponse {
  readonly success: boolean;
  readonly data: Laboratory[];
  readonly count: number;
  readonly query: string;
  readonly timestamp: string;
  readonly cached?: boolean;
}

interface LaboratorySearchInputProps {
  readonly className?: string;
}

export const LaboratorySearchInput: React.FC<LaboratorySearchInputProps> = ({ 
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    laboratorySearchResults,
    selectedLaboratoryNames,
    isLaboratoryLoading,
    laboratoryError,
    setLaboratorySearchResults,
    setLaboratoryLoading,
    setLaboratoryError,
    setLastLaboratorySearch,
    toggleLaboratorySelection,
    isLaboratorySelected,
    selectAllLaboratories,
    deselectAllLaboratories,
    getSelectedLaboratories,
  } = useProductFiltersStore();

  // Debounced search après 2 caractères
  useEffect(() => {
    if (searchTerm.length < 2) {
      setIsDropdownOpen(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

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

  const performSearch = async (query: string): Promise<void> => {
    if (query.length < 2) return;

    setLaboratoryLoading(true);
    setLaboratoryError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        limit: '100'
      });

      const response = await fetch(`/api/laboratories?${params}`);
      const data: LaboratoriesResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error('Erreur de recherche');
      }

      setLaboratorySearchResults(data.data);
      setLastLaboratorySearch(query);
      setIsDropdownOpen(data.data.length > 0);

    } catch (err) {
      console.error('Erreur recherche laboratoires:', err);
      setLaboratoryError(err instanceof Error ? err.message : 'Erreur de recherche');
      setIsDropdownOpen(false);
    } finally {
      setLaboratoryLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  const handleLaboratoryClick = (laboratory: Laboratory): void => {
    toggleLaboratorySelection(laboratory.name);
  };

  const handleRemoveLaboratory = (name: string): void => {
    toggleLaboratorySelection(name);
  };

  const handleClearSearch = (): void => {
    setSearchTerm('');
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const selectedLaboratories = getSelectedLaboratories();

  const formatUniverses = (universes: string[]): string => {
    if (universes.length === 0) return '';
    if (universes.length <= 3) return universes.join(', ');
    return `${universes.slice(0, 3).join(', ')} +${universes.length - 3}`;
  };

  const formatLaboratoryDisplay = (laboratory: Laboratory): React.ReactNode => {
    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <h4 className="font-medium text-gray-900 truncate">
                {laboratory.name}
              </h4>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <span className="font-medium">{laboratory.productCount}</span>
                <span>produit{laboratory.productCount > 1 ? 's' : ''}</span>
              </div>
              {laboratory.universes.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Globe className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{formatUniverses(laboratory.universes)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const shouldShowSelectedList = selectedLaboratories.length > 0;

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
              if (laboratorySearchResults.length > 0 && searchTerm.length >= 2) {
                setIsDropdownOpen(true);
              }
            }}
            placeholder="Nom laboratoire (ex: Pfizer, Sanofi)..."
            className="
              w-full pl-10 pr-12 py-3 text-sm rounded-lg border-2 border-gray-300
              bg-white text-gray-900 placeholder:text-gray-400
              hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
              focus:outline-none transition-all duration-200 ease-in-out
            "
          />

          {/* Bouton clear search */}
          {searchTerm && (
            <motion.button
              type="button"
              onClick={handleClearSearch}
              className="
                absolute right-16 top-1/2 transform -translate-y-1/2
                text-gray-400 hover:text-gray-600 transition-colors duration-200
              "
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}

          {/* Indicateur de type */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
              Labo
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {isLaboratoryLoading && (
          <div className="absolute right-20 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Dropdown résultats */}
        <AnimatePresence>
          {isDropdownOpen && (laboratorySearchResults.length > 0 || laboratoryError) && (
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
              {laboratoryError ? (
                <div className="p-4">
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{laboratoryError}</span>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  {/* Header avec info et boutons */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                    <div className="text-xs text-gray-500">
                      {laboratorySearchResults.length} laboratoire(s) trouvé(s)
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={selectAllLaboratories}
                        disabled={laboratorySearchResults.length === 0}
                        className="text-xs"
                      >
                        Tout sélectionner
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={deselectAllLaboratories}
                        disabled={selectedLaboratoryNames.length === 0}
                        className="text-xs"
                      >
                        Tout désélectionner
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mt-2">
                    {laboratorySearchResults.map((laboratory) => {
                      const selected = isLaboratorySelected(laboratory.name);
                      
                      return (
                        <motion.button
                          key={laboratory.name}
                          onClick={() => handleLaboratoryClick(laboratory)}
                          className={`
                            w-full flex items-start space-x-3 p-3 rounded-lg
                            transition-colors duration-200 text-left
                            ${selected
                              ? 'bg-green-50 border border-green-200'
                              : 'hover:bg-gray-50'
                            }
                          `}
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0
                            ${selected
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300'
                            }
                          `}>
                            {selected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          
                          {formatLaboratoryDisplay(laboratory)}
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

      {/* Liste des laboratoires sélectionnés */}
      {shouldShowSelectedList && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">
              Laboratoires sélectionnés ({selectedLaboratories.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={deselectAllLaboratories}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Tout supprimer
            </Button>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedLaboratories.map((laboratory) => (
              <motion.div
                key={laboratory.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <Building className="w-4 h-4 text-green-600 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 truncate text-sm">
                    {laboratory.name}
                  </h5>
                  <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                    <span className="font-medium">{laboratory.productCount} produits</span>
                    {laboratory.universes.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span className="truncate">{formatUniverses(laboratory.universes)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <motion.button
                  onClick={() => handleRemoveLaboratory(laboratory.name)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Supprimer ce laboratoire"
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
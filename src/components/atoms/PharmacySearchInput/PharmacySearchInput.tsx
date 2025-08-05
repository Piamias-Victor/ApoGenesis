// src/components/atoms/PharmacySearchInput/PharmacySearchInput.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Building2, Check } from 'lucide-react';

interface Pharmacy {
  readonly id: string;
  readonly name: string | null;
  readonly area: string | null;
  readonly address: string | null;
  readonly ca: string | null;
  readonly employees_count: number | null;
}

interface PharmacySearchInputProps {
  readonly placeholder?: string;
  readonly pharmacies: Pharmacy[];
  readonly selectedPharmacyIds: string[];
  readonly onSearch: (term: string) => void;
  readonly onToggleSelection: (id: string) => void;
  readonly debounce?: number;
  readonly maxResults?: number;
  readonly className?: string;
}

export const PharmacySearchInput: React.FC<PharmacySearchInputProps> = ({
  placeholder = 'Rechercher une pharmacie...',
  pharmacies,
  selectedPharmacyIds,
  onSearch,
  onToggleSelection,
  debounce = 300,
  maxResults = 50,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchTerm);
      
      // Filter pharmacies for dropdown
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const filtered = pharmacies
          .filter(pharmacy => 
            pharmacy.name?.toLowerCase().includes(term) ||
            pharmacy.area?.toLowerCase().includes(term) ||
            pharmacy.address?.toLowerCase().includes(term)
          )
          .slice(0, maxResults);
        setFilteredPharmacies(filtered);
        setIsOpen(filtered.length > 0);
      } else {
        setFilteredPharmacies([]);
        setIsOpen(false);
      }
    }, debounce);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, debounce, onSearch, pharmacies, maxResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = (): void => {
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handlePharmacyClick = (pharmacy: Pharmacy): void => {
    onToggleSelection(pharmacy.id);
  };

  const formatCA = (ca: string | null): string => {
    if (!ca) return 'N/A';
    const amount = parseFloat(ca) / 1000000;
    return `${amount.toFixed(1)}M€`;
  };

  const isSelected = (id: string): boolean => {
    return selectedPharmacyIds.includes(id);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <Search className="w-4 h-4 text-gray-500" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (filteredPharmacies.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border-2 border-gray-300
            bg-white text-gray-900 placeholder:text-gray-400
            hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
            focus:outline-none transition-all duration-200 ease-in-out
          "
        />

        {searchTerm && (
          <motion.button
            type="button"
            onClick={handleClear}
            className="
              absolute right-3 top-1/2 transform -translate-y-1/2
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
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && filteredPharmacies.length > 0 && (
          <motion.div
            className="
              absolute top-full left-0 right-0 mt-1 z-50
              bg-white rounded-lg border border-gray-200 shadow-xl
              max-h-80 overflow-y-auto
            "
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="p-2">
              <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">
                {filteredPharmacies.length} résultat(s) trouvé(s)
              </div>
              
              <div className="space-y-1 mt-2">
                {filteredPharmacies.map((pharmacy) => (
                  <motion.button
                    key={pharmacy.id}
                    onClick={() => handlePharmacyClick(pharmacy)}
                    className={`
                      w-full flex items-start space-x-3 p-3 rounded-lg
                      transition-colors duration-200 text-left
                      ${isSelected(pharmacy.id)
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                      }
                    `}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0
                      ${isSelected(pharmacy.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                      }
                    `}>
                      {isSelected(pharmacy.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <h4 className="font-medium text-gray-900 truncate">
                              {pharmacy.name || 'Nom non renseigné'}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {pharmacy.area || 'Région non renseignée'}
                          </p>
                          {pharmacy.address && (
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {pharmacy.address}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right flex-shrink-0 ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCA(pharmacy.ca)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {pharmacy.employees_count || 0} emp.
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              {pharmacies.length > maxResults && (
                <div className="text-xs text-gray-500 px-3 py-2 mt-2 border-t border-gray-100">
                  Affichage des {maxResults} premiers résultats
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
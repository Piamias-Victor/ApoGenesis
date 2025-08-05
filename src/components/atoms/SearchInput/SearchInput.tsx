// src/components/atoms/SearchInput/SearchInput.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

type SearchInputVariant = 'default' | 'filled' | 'outlined' | 'ghost';
type SearchInputSize = 'sm' | 'md' | 'lg';

interface SearchInputProps {
  readonly placeholder?: string;
  readonly variant?: SearchInputVariant;
  readonly size?: SearchInputSize;
  readonly debounce?: number;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onSearch: (term: string) => void;
  readonly onClear?: () => void;
  readonly className?: string;
  readonly 'data-testid'?: string;
}

/**
 * SearchInput - Composant de recherche réutilisable avec debounce
 * 
 * @example
 * <SearchInput 
 *   placeholder="Rechercher une pharmacie..." 
 *   onSearch={(term) => filterPharmacies(term)}
 *   debounce={300}
 * />
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Rechercher...',
  variant = 'default',
  size = 'md',
  debounce = 300,
  disabled = false,
  loading = false,
  onSearch,
  onClear,
  className = '',
  'data-testid': testId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchTerm);
    }, debounce);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, debounce, onSearch]);

  const handleClear = useCallback((): void => {
    setSearchTerm('');
    onClear?.();
  }, [onClear]);

  const baseStyles = `
    relative w-full rounded-lg font-medium transition-all duration-200 ease-in-out
    focus-within:ring-2 focus-within:ring-offset-1
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
  `;

  const variants = {
    default: `
      bg-white border border-gray-300
      hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-blue-500/20
      ${disabled ? 'bg-gray-50 border-gray-200' : ''}
    `,
    filled: `
      bg-gray-100 border border-transparent
      hover:bg-gray-150 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-blue-500/20
      ${disabled ? 'bg-gray-50' : ''}
    `,
    outlined: `
      bg-transparent border-2 border-gray-300
      hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-blue-500/20
      ${disabled ? 'border-gray-200' : ''}
    `,
    ghost: `
      bg-transparent border border-transparent
      hover:bg-gray-100 focus-within:bg-white focus-within:border-gray-300 focus-within:ring-gray-500/20
      ${disabled ? 'bg-gray-50' : ''}
    `,
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-4 py-3 text-base min-h-[48px]',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <motion.div
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      whileFocus={{ scale: 1.01 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      <div className="flex items-center">
        {/* Search Icon */}
        <Search className={`${iconSizes[size]} text-gray-500 flex-shrink-0 mr-3`} />
        
        {/* Input */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          data-testid={testId}
          className="
            flex-1 bg-transparent border-none outline-none 
            placeholder:text-gray-400 text-gray-900
            disabled:cursor-not-allowed
          "
        />

        {/* Loading Spinner */}
        {loading && (
          <motion.div
            className={`${iconSizes[size]} mr-2 flex-shrink-0`}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <div className="w-full h-full rounded-full border-2 border-gray-300 border-t-blue-500" />
          </motion.div>
        )}

        {/* Clear Button */}
        {searchTerm && !loading && (
          <motion.button
            type="button"
            onClick={handleClear}
            className={`
              ${iconSizes[size]} text-gray-400 hover:text-gray-600 
              flex-shrink-0 transition-colors duration-200
              focus:outline-none focus:text-gray-600
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <X className="w-full h-full" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
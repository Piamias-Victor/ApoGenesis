// src/components/molecules/ProductFilterButton/ProductFilterButton.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/atoms/Button/Button';
import { Package, ChevronDown } from 'lucide-react';

interface ProductFilterButtonProps {
  readonly onClick: () => void;
  readonly loading?: boolean;
  readonly selectedCount?: number;
  readonly className?: string;
}

/**
 * ProductFilterButton - Bouton de sélection des produits
 * 
 * Affiche le nombre de produits/labs/segments sélectionnés
 * Disponible pour tous les utilisateurs
 */
export const ProductFilterButton: React.FC<ProductFilterButtonProps> = ({
  onClick,
  loading = false,
  selectedCount = 0,
  className = '',
}) => {
  const formatButtonText = (): string => {
    if (selectedCount === 0) {
      return 'Tous les produits';
    }
    if (selectedCount === 1) {
      return '1 sélection';
    }
    return `${selectedCount} sélections`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Button
        variant="secondary"
        size="md"
        onClick={onClick}
        loading={loading}
        loadingText="Chargement..."
        iconLeft={<Package className="w-4 h-4" />}
        iconRight={<ChevronDown className="w-4 h-4" />}
        className="min-w-[180px] justify-between hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
      >
        <span className="truncate font-medium">
          {formatButtonText()}
        </span>
      </Button>
    </motion.div>
  );
};
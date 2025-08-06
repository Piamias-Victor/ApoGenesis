// src/components/molecules/ProductFilterButton/ProductFilterButton.tsx (UPDATED)
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/atoms/Button/Button';
import { Package, ChevronDown } from 'lucide-react';
import { useSelectedProductIds, useSelectedLaboratoryNames } from '@/store/productFiltersStore';

interface ProductFilterButtonProps {
  readonly onClick: () => void;
  readonly loading?: boolean;
  readonly className?: string;
}

/**
 * ProductFilterButton - Bouton de sélection des produits ET laboratoires
 * 
 * Affiche le nombre total de sélections (produits + laboratoires)
 * Format intelligent selon les sélections
 */
export const ProductFilterButton: React.FC<ProductFilterButtonProps> = ({
  onClick,
  loading = false,
  className = '',
}) => {
  const selectedProductIds = useSelectedProductIds();
  const selectedLaboratoryNames = useSelectedLaboratoryNames();
  
  const productCount = selectedProductIds.length;
  const laboratoryCount = selectedLaboratoryNames.length;
  const totalCount = productCount + laboratoryCount;

  const formatButtonText = (): string => {
    if (totalCount === 0) {
      return 'Tous les produits';
    }

    // Si seulement des produits sélectionnés
    if (productCount > 0 && laboratoryCount === 0) {
      return productCount === 1 ? '1 produit' : `${productCount} produits`;
    }

    // Si seulement des laboratoires sélectionnés
    if (laboratoryCount > 0 && productCount === 0) {
      return laboratoryCount === 1 ? '1 laboratoire' : `${laboratoryCount} laboratoires`;
    }

    // Si les deux types sont sélectionnés
    if (productCount > 0 && laboratoryCount > 0) {
      return `${totalCount} sélections`;
    }

    return 'Sélections';
  };

  const getTooltipText = (): string => {
    if (totalCount === 0) return 'Aucune sélection';
    
    const parts: string[] = [];
    if (productCount > 0) {
      parts.push(`${productCount} produit${productCount > 1 ? 's' : ''}`);
    }
    if (laboratoryCount > 0) {
      parts.push(`${laboratoryCount} laboratoire${laboratoryCount > 1 ? 's' : ''}`);
    }
    
    return parts.join(' + ');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
      title={getTooltipText()}
    >
      <Button
        variant="secondary"
        size="md"
        onClick={onClick}
        loading={loading}
        loadingText="Chargement..."
        iconLeft={<Package className="w-4 h-4" />}
        iconRight={<ChevronDown className="w-4 h-4" />}
        className={`
          min-w-[180px] justify-between transition-all duration-200
          ${totalCount > 0
            ? 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 border-blue-200'
            : 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
          }
        `}
      >
        <span className="truncate font-medium">
          {formatButtonText()}
        </span>
      </Button>
    </motion.div>
  );
};
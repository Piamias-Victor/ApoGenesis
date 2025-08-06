// src/components/molecules/PharmacyFilterButton/PharmacyFilterButton.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/atoms/Button/Button';
import { Building2, ChevronDown } from 'lucide-react';
import { useSelectedPharmacyIds } from '@/store/pharmacyFiltersStore';

interface PharmacyFilterButtonProps {
  readonly onClick: () => void;
  readonly loading?: boolean;
  readonly className?: string;
}

/**
 * PharmacyFilterButton - Bouton de sélection des pharmacies pour admins
 * 
 * Connecté au store Zustand pour affichage temps réel
 * Visible uniquement pour les utilisateurs admin
 */
export const PharmacyFilterButton: React.FC<PharmacyFilterButtonProps> = ({
  onClick,
  loading = false,
  className = '',
}) => {
  const selectedPharmacyIds = useSelectedPharmacyIds();
  const selectedCount = selectedPharmacyIds.length;

  const formatButtonText = (): string => {
    if (selectedCount === 0) {
      return 'Toutes les pharmacies';
    }
    if (selectedCount === 1) {
      return '1 pharmacie';
    }
    return `${selectedCount} pharmacies`;
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
        iconLeft={<Building2 className="w-4 h-4" />}
        iconRight={<ChevronDown className="w-4 h-4" />}
        className={`
          min-w-[180px] justify-between transition-all duration-200
          ${selectedCount > 0
            ? 'hover:bg-green-50 hover:border-green-300 hover:text-green-700 border-green-200'
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
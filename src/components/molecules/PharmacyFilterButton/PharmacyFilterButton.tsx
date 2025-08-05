// src/components/molecules/PharmacyFilterButton/PharmacyFilterButton.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/atoms/Button/Button';
import { Building2, ChevronDown } from 'lucide-react';

interface PharmacyFilterButtonProps {
  readonly onClick: () => void;
  readonly loading?: boolean;
  readonly selectedCount?: number;
  readonly className?: string;
}

/**
 * PharmacyFilterButton - Bouton de sélection des pharmacies pour admins
 * 
 * Affiche le nombre de pharmacies sélectionnées
 * Visible uniquement pour les utilisateurs admin
 */
export const PharmacyFilterButton: React.FC<PharmacyFilterButtonProps> = ({
  onClick,
  loading = false,
  selectedCount = 0,
  className = '',
}) => {
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
        className="min-w-[180px] justify-between hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
      >
        <span className="truncate font-medium">
          {formatButtonText()}
        </span>
      </Button>
    </motion.div>
  );
};
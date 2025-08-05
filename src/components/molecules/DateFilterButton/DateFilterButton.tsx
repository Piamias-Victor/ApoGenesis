// src/components/molecules/DateFilterButton/DateFilterButton.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/atoms/Button/Button';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { DateFilterState, DateUtils } from '@/types/dateFilters';

interface DateFilterButtonProps {
  readonly filterState: DateFilterState;
  readonly onClick: () => void;
  readonly loading?: boolean;
  readonly className?: string;
}

/**
 * DateFilterButton - Bouton de sélection de période pour dashboard
 * 
 * Affiche les périodes d'analyse et de comparaison
 * Format: "Fév 2025 vs Jan 2025"
 */
export const DateFilterButton: React.FC<DateFilterButtonProps> = ({
  filterState,
  onClick,
  loading = false,
  className = '',
}) => {
  const formatButtonText = (): string => {
    return DateUtils.formatComparison(filterState.analysisPeriod, filterState.comparisonPeriod);
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
        iconLeft={<CalendarDays className="w-4 h-4" />}
        iconRight={<ChevronDown className="w-4 h-4" />}
        className="min-w-[200px] justify-between hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
      >
        <span className="truncate font-medium">
          {formatButtonText()}
        </span>
      </Button>
    </motion.div>
  );
};
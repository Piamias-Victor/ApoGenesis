// src/components/molecules/ActiveFiltersBar/ActiveFiltersBar.tsx
'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/atoms/Button/Button';
import { useDateFilters } from '@/hooks/dashboard/useDateFilters';
import { usePharmacyFilters } from '@/hooks/dashboard/usePharmacyFilters';
import { useProductFilters } from '@/hooks/dashboard/useProductFilters';
import { useAuth } from '@/hooks/shared/useAuth';
import { DateUtils } from '@/types/dateFilters';
import { 
  Calendar, 
  Building2, 
  Package, 
  X, 
  RotateCcw,
  ChevronRight
} from 'lucide-react';

interface FilterChip {
  readonly id: string;
  readonly type: 'date' | 'pharmacy' | 'product' | 'laboratory';
  readonly label: string;
  readonly value: string;
  readonly icon: React.ReactNode;
  readonly color: 'blue' | 'green' | 'purple' | 'orange';
  readonly onClick: () => void;
  readonly onRemove?: () => void;
  readonly removable?: boolean;
}

interface ActiveFiltersBarProps {
  readonly onDateFilterClick: () => void;
  readonly onPharmacyFilterClick: () => void;
  readonly onProductFilterClick: () => void;
  readonly className?: string;
}

/**
 * ActiveFiltersBar - Barre des filtres avec affichage intelligent
 * 
 * Affiche le détail si 1 seul élément, sinon nombre total
 * Date avec vs: "Fév 2025 vs Jan 2025"
 */
export const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = React.memo(({
  onDateFilterClick,
  onPharmacyFilterClick,
  onProductFilterClick,
  className = '',
}) => {
  const { role } = useAuth();
  const { dateFilters, resetToDefaults: resetDateFilters } = useDateFilters();
  const { 
    selectedPharmacyIds, 
    selectedCount: pharmacyCount,
    selectedPharmacies,
    deselectAllPharmacies 
  } = usePharmacyFilters();
  const {
    selectedProductIds,
    selectedLaboratoryNames,
    selectedProducts,
    selectedLaboratories,
    totalSelections: productTotalSelections,
    hasSelections: hasProductSelections,
    resetFilters: resetProductFilters,
  } = useProductFilters();

  // Création des chips avec logique d'affichage intelligente
  const filterChips = useMemo((): FilterChip[] => {
    const chips: FilterChip[] = [];

    // 1. Date - avec vs
    const dateLabel = `${dateFilters.analysisPeriod.label} vs ${dateFilters.comparisonPeriod.label}`;
    chips.push({
      id: 'date-filter',
      type: 'date',
      label: dateLabel,
      value: `${dateFilters.analysisPeriod.type}_${dateFilters.comparisonPeriod.type}`,
      icon: <Calendar className="w-3 h-3" />,
      color: 'blue',
      onClick: onDateFilterClick,
      removable: false,
    });

    // 2. Pharmacies (admin seulement)
    if (role === 'admin') {
      if (pharmacyCount === 0) {
        chips.push({
          id: 'pharmacy-all',
          type: 'pharmacy',
          label: 'Toutes les pharmacies',
          value: 'all',
          icon: <Building2 className="w-3 h-3" />,
          color: 'green',
          onClick: onPharmacyFilterClick,
          removable: false,
        });
      } else if (pharmacyCount === 1) {
        // Affichage détaillé si 1 seule
        const pharmacyName = selectedPharmacies[0]?.name || 'Pharmacie inconnue';
        chips.push({
          id: 'pharmacy-single',
          type: 'pharmacy',
          label: pharmacyName,
          value: selectedPharmacyIds[0] || '',
          icon: <Building2 className="w-3 h-3" />,
          color: 'green',
          onClick: onPharmacyFilterClick,
          onRemove: deselectAllPharmacies,
          removable: true,
        });
      } else {
        // Multiple pharmacies
        chips.push({
          id: 'pharmacy-multiple',
          type: 'pharmacy',
          label: `${pharmacyCount} pharmacies`,
          value: selectedPharmacyIds.join(','),
          icon: <Building2 className="w-3 h-3" />,
          color: 'green',
          onClick: onPharmacyFilterClick,
          onRemove: deselectAllPharmacies,
          removable: true,
        });
      }
    }

    // 3. Produits et Laboratoires
    if (!hasProductSelections) {
      chips.push({
        id: 'products-all',
        type: 'product',
        label: 'Tous les produits',
        value: 'all',
        icon: <Package className="w-3 h-3" />,
        color: 'purple',
        onClick: onProductFilterClick,
        removable: false,
      });
    } else {
      // Produits spécifiques
      if (selectedProductIds.length > 0) {
        if (selectedProductIds.length === 1) {
          // Affichage détaillé si 1 seul produit
          const productName = selectedProducts[0]?.name || 'Produit inconnu';
          chips.push({
            id: 'product-single',
            type: 'product',
            label: productName,
            value: selectedProductIds[0] || '',
            icon: <Package className="w-3 h-3" />,
            color: 'purple',
            onClick: onProductFilterClick,
            onRemove: resetProductFilters,
            removable: true,
          });
        } else {
          // Multiple produits
          chips.push({
            id: 'products-multiple',
            type: 'product',
            label: `${selectedProductIds.length} produits`,
            value: selectedProductIds.join(','),
            icon: <Package className="w-3 h-3" />,
            color: 'purple',
            onClick: onProductFilterClick,
            onRemove: resetProductFilters,
            removable: true,
          });
        }
      }

      // Laboratoires
      if (selectedLaboratoryNames.length > 0) {
        if (selectedLaboratoryNames.length === 1) {
          // Affichage détaillé si 1 seul labo
          const labName = selectedLaboratories[0]?.name || selectedLaboratoryNames[0] || 'Laboratoire inconnu';
          chips.push({
            id: 'laboratory-single',
            type: 'laboratory',
            label: labName,
            value: selectedLaboratoryNames[0] || '',
            icon: <Package className="w-3 h-3" />,
            color: 'orange',
            onClick: onProductFilterClick,
            onRemove: resetProductFilters,
            removable: true,
          });
        } else {
          // Multiple laboratoires
          chips.push({
            id: 'laboratories-multiple',
            type: 'laboratory',
            label: `${selectedLaboratoryNames.length} laboratoires`,
            value: selectedLaboratoryNames.join(','),
            icon: <Package className="w-3 h-3" />,
            color: 'orange',
            onClick: onProductFilterClick,
            onRemove: resetProductFilters,
            removable: true,
          });
        }
      }
    }

    return chips;
  }, [
    dateFilters,
    role,
    pharmacyCount,
    selectedPharmacyIds,
    selectedPharmacies,
    selectedProductIds,
    selectedProducts,
    selectedLaboratoryNames,
    selectedLaboratories,
    hasProductSelections,
    onDateFilterClick,
    onPharmacyFilterClick,
    onProductFilterClick,
    deselectAllPharmacies,
    resetProductFilters,
  ]);

  const hasCustomFilters = useMemo(() => {
    return (
      pharmacyCount > 0 || 
      hasProductSelections ||
      dateFilters.analysisPeriod.type !== 'current_month' ||
      dateFilters.comparisonPeriod.type !== 'previous_period'
    );
  }, [pharmacyCount, hasProductSelections, dateFilters]);

  const handleResetAll = (): void => {
    resetDateFilters();
    deselectAllPharmacies();
    resetProductFilters();
  };

  return (
    <motion.div
      className={`bg-white border border-gray-200 rounded-lg p-3 sm:p-4 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between">
        
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <h3 className="text-sm font-medium text-gray-700 flex-shrink-0 hidden sm:block">
            Filtres actifs
          </h3>
          
          <div className="flex items-center space-x-2 overflow-x-auto sm:flex-wrap sm:overflow-visible scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {filterChips.map((chip, index) => (
                <motion.div
                  key={chip.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  transition={{ 
                    duration: 0.2, 
                    delay: index * 0.05,
                    ease: 'easeOut' 
                  }}
                  className="flex-shrink-0"
                >
                  <motion.button
                    onClick={chip.onClick}
                    className={`
                      inline-flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium
                      transition-all duration-200 hover:scale-105 active:scale-95
                      ${chip.color === 'blue' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200' :
                        chip.color === 'green' ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200' :
                        chip.color === 'purple' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200' :
                        'bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-200'
                      }
                    `}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex-shrink-0">{chip.icon}</span>
                    <span className="" title={chip.label}>
                      {chip.label}
                    </span>
                    <ChevronRight className="w-3 h-3 opacity-60 flex-shrink-0" />
                    
                    {chip.removable && chip.onRemove && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          chip.onRemove?.();
                        }}
                        className={`
                          p-0.5 rounded-sm transition-colors duration-200
                          ${chip.color === 'blue' ? 'hover:bg-blue-200' :
                            chip.color === 'green' ? 'hover:bg-green-200' :
                            chip.color === 'purple' ? 'hover:bg-purple-200' :
                            'hover:bg-orange-200'
                          }
                        `}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    )}
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {hasCustomFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 ml-3"
            >
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<RotateCcw className="w-3 h-3" />}
                onClick={handleResetAll}
                className="text-xs hover:bg-gray-100"
              >
                <span className="hidden sm:inline">Réinitialiser</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="sm:hidden mt-2 flex items-center justify-center">
        <div className="w-8 h-1 bg-gray-200 rounded-full" />
      </div>
    </motion.div>
  );
});

ActiveFiltersBar.displayName = 'ActiveFiltersBar';
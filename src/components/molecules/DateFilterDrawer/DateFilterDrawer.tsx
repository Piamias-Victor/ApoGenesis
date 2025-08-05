// src/components/molecules/DateFilterDrawer/DateFilterDrawer.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { X, Calendar, TrendingUp } from 'lucide-react';
import { 
  DateFilterState, 
  AnalysisPeriod, 
  ComparisonPeriod, 
  AnalysisPeriodType,
  ComparisonPeriodType,
  DateUtils 
} from '@/types/dateFilters';

interface DateFilterDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly filterState: DateFilterState;
  readonly onFilterChange: (state: DateFilterState) => void;
  readonly className?: string;
}

/**
 * DateFilterDrawer - Drawer de sélection des périodes d'analyse et de comparaison
 * 
 * Section 1: Période d'analyse (mois en cours, mois dernier, 12 derniers mois, custom)
 * Section 2: Période de comparaison (période précédente, année dernière, custom)
 */
export const DateFilterDrawer: React.FC<DateFilterDrawerProps> = ({
  isOpen,
  onClose,
  filterState,
  onFilterChange,
  className = '',
}) => {
  const [localState, setLocalState] = useState<DateFilterState>(filterState);

  // Prevent body scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setLocalState(filterState);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, filterState]);

  const handleAnalysisPeriodChange = (type: AnalysisPeriodType): void => {
    let newAnalysisPeriod: AnalysisPeriod;
    
    switch (type) {
      case 'current_month':
        newAnalysisPeriod = {
          type,
          range: DateUtils.getCurrentMonth(),
          label: 'Mois en cours'
        };
        break;
      case 'last_month':
        newAnalysisPeriod = {
          type,
          range: DateUtils.getLastMonth(),
          label: 'Mois dernier'
        };
        break;
      case 'last_12_months':
        newAnalysisPeriod = {
          type,
          range: DateUtils.getLast12Months(),
          label: '12 derniers mois'
        };
        break;
      default:
        return;
    }

    // Recalculer automatiquement la période de comparaison
    let newComparisonPeriod: ComparisonPeriod;
    if (localState.comparisonPeriod.type === 'previous_period') {
      newComparisonPeriod = {
        type: 'previous_period',
        range: DateUtils.getPreviousPeriod(newAnalysisPeriod.range),
        label: 'Période précédente'
      };
    } else if (localState.comparisonPeriod.type === 'same_period_last_year') {
      newComparisonPeriod = {
        type: 'same_period_last_year',
        range: DateUtils.getSamePeriodLastYear(newAnalysisPeriod.range),
        label: 'Année dernière'
      };
    } else {
      newComparisonPeriod = localState.comparisonPeriod;
    }

    setLocalState({
      analysisPeriod: newAnalysisPeriod,
      comparisonPeriod: newComparisonPeriod
    });
  };

  const handleComparisonPeriodChange = (type: ComparisonPeriodType): void => {
    let newComparisonPeriod: ComparisonPeriod;
    
    switch (type) {
      case 'previous_period':
        newComparisonPeriod = {
          type,
          range: DateUtils.getPreviousPeriod(localState.analysisPeriod.range),
          label: 'Période précédente'
        };
        break;
      case 'same_period_last_year':
        newComparisonPeriod = {
          type,
          range: DateUtils.getSamePeriodLastYear(localState.analysisPeriod.range),
          label: 'Année dernière'
        };
        break;
      default:
        return;
    }

    setLocalState({
      ...localState,
      comparisonPeriod: newComparisonPeriod
    });
  };

  const handleApply = (): void => {
    onFilterChange(localState);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={onClose}
          />

          <motion.div
            className={`
              fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-50
              flex flex-col ${className}
            `}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Périodes d'analyse
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Configurez l'analyse et la comparaison
                </p>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Astuce :</strong> Choisissez votre période d'analyse principale, puis sélectionnez 
                    la période de comparaison pour calculer les évolutions. Les choix rapides 
                    recalculent automatiquement les comparaisons.
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={onClose}
                className="
                  p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100
                  transition-colors duration-200 flex-shrink-0
                "
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-8">
              
              {/* Section 1: Période d'analyse */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Période d'analyse
                  </h3>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Sélectionnée :</strong> {localState.analysisPeriod.label}
                  </p>
                  <p className="text-xs text-blue-600">
                    Du {localState.analysisPeriod.range.start.toLocaleDateString('fr-FR')} au{' '}
                    {localState.analysisPeriod.range.end.toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={localState.analysisPeriod.type === 'current_month' ? 'primary' : 'secondary'}
                    size="md"
                    onClick={() => handleAnalysisPeriodChange('current_month')}
                    fullWidth
                  >
                    Mois en cours
                  </Button>
                  <Button
                    variant={localState.analysisPeriod.type === 'last_month' ? 'primary' : 'secondary'}
                    size="md"
                    onClick={() => handleAnalysisPeriodChange('last_month')}
                    fullWidth
                  >
                    Mois dernier
                  </Button>
                  <Button
                    variant={localState.analysisPeriod.type === 'last_12_months' ? 'primary' : 'secondary'}
                    size="md"
                    onClick={() => handleAnalysisPeriodChange('last_12_months')}
                    fullWidth
                  >
                    12 derniers mois
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Période personnalisée</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      variant="default"
                      size="sm"
                      type="date"
                      label="Date début"
                      value={localState.analysisPeriod.range.start.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newStart = new Date(e.target.value);
                        const newAnalysisPeriod = {
                          ...localState.analysisPeriod,
                          type: 'custom' as AnalysisPeriodType,
                          range: {
                            start: newStart,
                            end: localState.analysisPeriod.range.end
                          },
                          label: 'Période personnalisée'
                        };
                        setLocalState({
                          ...localState,
                          analysisPeriod: newAnalysisPeriod
                        });
                      }}
                    />
                    <Input
                      variant="default"
                      size="sm"  
                      type="date"
                      label="Date fin"
                      value={localState.analysisPeriod.range.end.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newEnd = new Date(e.target.value);
                        const newAnalysisPeriod = {
                          ...localState.analysisPeriod,
                          type: 'custom' as AnalysisPeriodType,
                          range: {
                            start: localState.analysisPeriod.range.start,
                            end: newEnd
                          },
                          label: 'Période personnalisée'
                        };
                        setLocalState({
                          ...localState,
                          analysisPeriod: newAnalysisPeriod
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Période de comparaison */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Période de comparaison
                  </h3>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-2">
                    <strong>Comparaison :</strong> {localState.comparisonPeriod.label}
                  </p>
                  <p className="text-xs text-green-600">
                    Du {localState.comparisonPeriod.range.start.toLocaleDateString('fr-FR')} au{' '}
                    {localState.comparisonPeriod.range.end.toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={localState.comparisonPeriod.type === 'previous_period' ? 'primary' : 'secondary'}
                    size="md"
                    onClick={() => handleComparisonPeriodChange('previous_period')}
                    fullWidth
                  >
                    Période précédente
                  </Button>
                  <Button
                    variant={localState.comparisonPeriod.type === 'same_period_last_year' ? 'primary' : 'secondary'}
                    size="md"
                    onClick={() => handleComparisonPeriodChange('same_period_last_year')}
                    fullWidth
                  >
                    Année dernière
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Comparaison personnalisée</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      variant="default"
                      size="sm"
                      type="date"
                      label="Date début"
                      value={localState.comparisonPeriod.range.start.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newStart = new Date(e.target.value);
                        const newComparisonPeriod = {
                          ...localState.comparisonPeriod,
                          type: 'custom' as ComparisonPeriodType,
                          range: {
                            start: newStart,
                            end: localState.comparisonPeriod.range.end
                          },
                          label: 'Comparaison personnalisée'
                        };
                        setLocalState({
                          ...localState,
                          comparisonPeriod: newComparisonPeriod
                        });
                      }}
                    />
                    <Input
                      variant="default"
                      size="sm"
                      type="date"
                      label="Date fin"
                      value={localState.comparisonPeriod.range.end.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newEnd = new Date(e.target.value);
                        const newComparisonPeriod = {
                          ...localState.comparisonPeriod,
                          type: 'custom' as ComparisonPeriodType,
                          range: {
                            start: localState.comparisonPeriod.range.start,
                            end: newEnd
                          },
                          label: 'Comparaison personnalisée'
                        };
                        setLocalState({
                          ...localState,
                          comparisonPeriod: newComparisonPeriod
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onClose}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleApply}
                >
                  Appliquer
                </Button>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
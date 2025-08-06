// src/components/molecules/DateFilterDrawer/DateFilterDrawer.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { useDateFilters } from '@/hooks/dashboard/useDateFilters';
import { X, Calendar, TrendingUp } from 'lucide-react';
import { 
  AnalysisPeriod, 
  ComparisonPeriod, 
  AnalysisPeriodType,
  ComparisonPeriodType,
  DateUtils 
} from '@/types/dateFilters';

interface DateFilterDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly className?: string;
}

/**
 * DateFilterDrawer - Drawer responsive de sélection des périodes
 * 
 * Mobile: Full width, mobile-first UX
 * Desktop: 500px width comme avant
 * Utilise breakpoints Tailwind pour adaptation
 */
export const DateFilterDrawer: React.FC<DateFilterDrawerProps> = ({
  isOpen,
  onClose,
  className = '',
}) => {
  const { 
    dateFilters, 
    setFilters, 
    resetToDefaults 
  } = useDateFilters();

  const [localAnalysisPeriod, setLocalAnalysisPeriod] = useState<AnalysisPeriod>(dateFilters.analysisPeriod);
  const [localComparisonPeriod, setLocalComparisonPeriod] = useState<ComparisonPeriod>(dateFilters.comparisonPeriod);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setLocalAnalysisPeriod(dateFilters.analysisPeriod);
      setLocalComparisonPeriod(dateFilters.comparisonPeriod);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, dateFilters]);

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

    setLocalAnalysisPeriod(newAnalysisPeriod);

    if (localComparisonPeriod.type === 'previous_period') {
      setLocalComparisonPeriod({
        type: 'previous_period',
        range: DateUtils.getPreviousPeriod(newAnalysisPeriod.range),
        label: 'Période précédente'
      });
    } else if (localComparisonPeriod.type === 'same_period_last_year') {
      setLocalComparisonPeriod({
        type: 'same_period_last_year',
        range: DateUtils.getSamePeriodLastYear(newAnalysisPeriod.range),
        label: 'Année dernière'
      });
    }
  };

  const handleComparisonPeriodChange = (type: ComparisonPeriodType): void => {
    let newComparisonPeriod: ComparisonPeriod;
    
    switch (type) {
      case 'previous_period':
        newComparisonPeriod = {
          type,
          range: DateUtils.getPreviousPeriod(localAnalysisPeriod.range),
          label: 'Période précédente'
        };
        break;
      case 'same_period_last_year':
        newComparisonPeriod = {
          type,
          range: DateUtils.getSamePeriodLastYear(localAnalysisPeriod.range),
          label: 'Année dernière'
        };
        break;
      default:
        return;
    }

    setLocalComparisonPeriod(newComparisonPeriod);
  };

  const handleApply = (): void => {
    setFilters({
      analysisPeriod: localAnalysisPeriod,
      comparisonPeriod: localComparisonPeriod
    });
    onClose();
  };

  const handleCancel = (): void => {
    setLocalAnalysisPeriod(dateFilters.analysisPeriod);
    setLocalComparisonPeriod(dateFilters.comparisonPeriod);
    onClose();
  };

  const handleReset = (): void => {
    resetToDefaults();
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
            onClick={handleCancel}
          />

          <motion.div
            className={`
              fixed top-0 right-0 h-full bg-white shadow-2xl z-50
              w-full sm:w-[900px] flex flex-col ${className}
            `}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Périodes d'analyse
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Configurez l'analyse et la comparaison
                </p>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Astuce :</strong> Choisissez votre période d'analyse principale, puis sélectionnez 
                    la période de comparaison pour calculer les évolutions.
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={handleCancel}
                className="
                  p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100
                  transition-colors duration-200 flex-shrink-0 ml-4
                "
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 sm:space-y-8">
              
              {/* Section 1: Période d'analyse */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Période d'analyse
                  </h3>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Sélectionnée :</strong> {localAnalysisPeriod.label}
                  </p>
                  <p className="text-xs text-blue-600">
                    Du {localAnalysisPeriod.range.start.toLocaleDateString('fr-FR')} au{' '}
                    {localAnalysisPeriod.range.end.toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={localAnalysisPeriod.type === 'current_month' ? 'primary' : 'secondary'}
                    size="md"
                    onClick={() => handleAnalysisPeriodChange('current_month')}
                    fullWidth
                  >
                    Mois en cours
                  </Button>
                  <Button
                    variant={localAnalysisPeriod.type === 'last_month' ? 'primary' : 'secondary'}
                    size="md"
                    onClick={() => handleAnalysisPeriodChange('last_month')}
                    fullWidth
                  >
                    Mois dernier
                  </Button>
                  <Button
                    variant={localAnalysisPeriod.type === 'last_12_months' ? 'primary' : 'secondary'}
                    size="md"
                    onClick={() => handleAnalysisPeriodChange('last_12_months')}
                    fullWidth
                  >
                    12 derniers mois
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Période personnalisée</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      variant="default"
                      size="sm"
                      type="date"
                      label="Date début"
                      value={localAnalysisPeriod.range.start.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newStart = new Date(e.target.value);
                        setLocalAnalysisPeriod({
                          type: 'custom',
                          range: {
                            start: newStart,
                            end: localAnalysisPeriod.range.end
                          },
                          label: 'Période personnalisée'
                        });
                      }}
                    />
                    <Input
                      variant="default"
                      size="sm"  
                      type="date"
                      label="Date fin"
                      value={localAnalysisPeriod.range.end.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newEnd = new Date(e.target.value);
                        setLocalAnalysisPeriod({
                          type: 'custom',
                          range: {
                            start: localAnalysisPeriod.range.start,
                            end: newEnd
                          },
                          label: 'Période personnalisée'
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
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Période de comparaison
                  </h3>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <p className="text-sm text-green-800 mb-2">
                    <strong>Comparaison :</strong> {localComparisonPeriod.label}
                  </p>
                  <p className="text-xs text-green-600">
                    Du {localComparisonPeriod.range.start.toLocaleDateString('fr-FR')} au{' '}
                    {localComparisonPeriod.range.end.toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={localComparisonPeriod.type === 'previous_period' ? 'primary' : 'secondary'}
                    size="md"
                    onClick={() => handleComparisonPeriodChange('previous_period')}
                    fullWidth
                  >
                    Période précédente
                  </Button>
                  <Button
                    variant={localComparisonPeriod.type === 'same_period_last_year' ? 'primary' : 'secondary'}
                    size="md"
                    onClick={() => handleComparisonPeriodChange('same_period_last_year')}
                    fullWidth
                  >
                    Année dernière
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Comparaison personnalisée</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      variant="default"
                      size="sm"
                      type="date"
                      label="Date début"
                      value={localComparisonPeriod.range.start.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newStart = new Date(e.target.value);
                        setLocalComparisonPeriod({
                          type: 'custom',
                          range: {
                            start: newStart,
                            end: localComparisonPeriod.range.end
                          },
                          label: 'Comparaison personnalisée'
                        });
                      }}
                    />
                    <Input
                      variant="default"
                      size="sm"
                      type="date"
                      label="Date fin"
                      value={localComparisonPeriod.range.end.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newEnd = new Date(e.target.value);
                        setLocalComparisonPeriod({
                          type: 'custom',
                          range: {
                            start: localComparisonPeriod.range.start,
                            end: newEnd
                          },
                          label: 'Comparaison personnalisée'
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleReset}
                  className="w-full sm:w-auto"
                >
                  Réinitialiser
                </Button>
                
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleCancel}
                    className="flex-1 sm:flex-none"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleApply}
                    className="flex-1 sm:flex-none"
                  >
                    Appliquer
                  </Button>
                </div>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
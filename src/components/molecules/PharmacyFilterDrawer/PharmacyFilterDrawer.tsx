'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/atoms/Button/Button';
import { PharmacySearchInput } from '@/components/atoms/PharmacySearchInput/PharmacySearchInput';
import { FranceRegionsMap } from '@/components/molecules/FranceRegionsMap/FranceRegionsMap';
import { usePharmacyFiltersStore } from '@/store/pharmacyFiltersStore';
import { 
  X, 
  Building2, 
  AlertCircle, 
  Check, 
  MapPin, 
  DollarSign, 
  Users,
  RotateCcw
} from 'lucide-react';

interface Pharmacy {
  readonly id: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly id_nat: string | null;
  readonly name: string | null;
  readonly ca: string | null;
  readonly area: string | null;
  readonly employees_count: number | null;
  readonly address: string | null;
}

interface PharmaciesResponse {
  readonly success: boolean;
  readonly data: Pharmacy[];
  readonly count: number;
  readonly cached: boolean;
  readonly timestamp: string;
  readonly error?: string;
}

interface PharmacyFilterDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly className?: string;
}

type CARange = 'all' | '0-3' | '3-5' | '5.1-7' | '7-10' | '10+';
type EmployeesRange = 'all' | '<10' | '10-20' | '20-30' | '>30';

const CA_RANGES: { value: CARange; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: '0-3', label: '0-3M€' },
  { value: '3-5', label: '3-5M€' },
  { value: '5.1-7', label: '5.1-7M€' },
  { value: '7-10', label: '7-10M€' },
  { value: '10+', label: '+10M€' },
];

const EMPLOYEES_RANGES: { value: EmployeesRange; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: '<10', label: '<10' },
  { value: '10-20', label: '10-20' },
  { value: '20-30', label: '20-30' },
  { value: '>30', label: '>30' },
];

export const PharmacyFilterDrawer: React.FC<PharmacyFilterDrawerProps> = ({
  isOpen,
  onClose,
  className = '',
}) => {
  const {
    selectedPharmacyIds,
    selectedRegions,
    caRange,
    employeesRange,
    isLoading,
    error,
    setPharmacies,
    togglePharmacySelection,
    selectAllPharmacies,
    deselectAllPharmacies,
    setSearchTerm,
    toggleRegionSelection,
    setCARange,
    setEmployeesRange,
    resetFilters,
    getFilteredPharmacies,
    getPharmaciesByRegion,
  } = usePharmacyFiltersStore();

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !hasLoaded) {
      fetchPharmacies();
    }
  }, [isOpen, hasLoaded]);

  const fetchPharmacies = async (): Promise<void> => {
    try {
      const response = await fetch('/api/pharmacies');
      const data: PharmaciesResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur de chargement');
      }

      setPharmacies(data.data);
      setHasLoaded(true);
      
    } catch (err) {
      console.error('Erreur fetch pharmacies:', err);
    }
  };

  const filteredPharmacies = getFilteredPharmacies();
  const selectedCount = selectedPharmacyIds.length;

  const handleApply = (): void => {
    console.log('Pharmacies sélectionnées:', selectedPharmacyIds);
    onClose();
  };

  const formatCA = (ca: string | null): string => {
    if (!ca) return 'N/A';
    const amount = parseFloat(ca) / 1000000;
    return `${amount.toFixed(1)}M€`;
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
              fixed top-0 right-0 h-full w-[800px] bg-white shadow-2xl z-50
              flex flex-col ${className}
            `}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Sélection Pharmacies
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedCount > 0 
                      ? `${selectedCount} pharmacie(s) sélectionnée(s) sur ${filteredPharmacies.length}`
                      : `${filteredPharmacies.length} pharmacie(s) disponible(s)`
                    }
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto">
              
              {isLoading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des pharmacies...</p>
                  </div>
                </div>
              )}

              {error && !isLoading && (
                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-red-800">
                          Erreur de chargement
                        </h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isLoading && !error && (
                <div className="space-y-6 p-6">
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      Rechercher
                    </h3>
                    <PharmacySearchInput
                      placeholder="Rechercher une pharmacie..."
                      pharmacies={getFilteredPharmacies()}
                      selectedPharmacyIds={selectedPharmacyIds}
                      onSearch={setSearchTerm}
                      onToggleSelection={togglePharmacySelection}
                      debounce={300}
                      maxResults={50}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={selectAllPharmacies}
                        disabled={filteredPharmacies.length === 0}
                      >
                        Tout sélectionner
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={deselectAllPharmacies}
                        disabled={selectedCount === 0}
                      >
                        Tout désélectionner
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      iconLeft={<RotateCcw className="w-4 h-4" />}
                      onClick={resetFilters}
                    >
                      Réinitialiser
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Sélection par région
                    </h3>
                    <FranceRegionsMap
                      selectedRegions={selectedRegions}
                      onRegionClick={toggleRegionSelection}
                      getPharmacyCount={(region) => getPharmaciesByRegion(region).length}
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Chiffre d'affaires
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {CA_RANGES.map((range) => (
                        <Button
                          key={range.value}
                          variant={caRange === range.value ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setCARange(range.value)}
                        >
                          {range.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Nombre d'employés
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {EMPLOYEES_RANGES.map((range) => (
                        <Button
                          key={range.value}
                          variant={employeesRange === range.value ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setEmployeesRange(range.value)}
                        >
                          {range.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Pharmacies ({filteredPharmacies.length})
                    </h3>
                    
                    {filteredPharmacies.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Aucune pharmacie ne correspond aux critères</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredPharmacies.map((pharmacy: Pharmacy) => {
                          const isSelected = selectedPharmacyIds.includes(pharmacy.id);
                          
                          return (
                            <motion.div
                              key={pharmacy.id}
                              className={`
                                flex items-start space-x-3 p-3 rounded-lg border cursor-pointer
                                transition-all duration-200
                                ${isSelected 
                                  ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' 
                                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                }
                              `}
                              onClick={() => togglePharmacySelection(pharmacy.id)}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className={`
                                w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
                                ${isSelected 
                                  ? 'bg-blue-500 border-blue-500' 
                                  : 'border-gray-300'
                                }
                              `}>
                                {isSelected && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900 truncate">
                                      {pharmacy.name || 'Nom non renseigné'}
                                    </h4>
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
                                      {pharmacy.employees_count || 0} employé(s)
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedCount > 0 && (
                    <span className="font-medium text-blue-600">
                      {selectedCount} pharmacie(s) sélectionnée(s)
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
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
                    disabled={selectedCount === 0}
                  >
                    Appliquer ({selectedCount})
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
// src/components/molecules/ProductFilterDrawer/ProductFilterDrawer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/atoms/Button/Button';
import { ProductSearchInput } from '@/components/molecules/ProductSearchInput/ProductSearchInput';
import { LaboratorySearchInput } from '@/components/molecules/LaboratorySearchInput/LaboratorySearchInput';
import { useProductFiltersStore } from '@/store/productFiltersStore';
import { 
  X, 
  Package, 
  Search, 
  Building, 
  BarChart3,
  RotateCcw
} from 'lucide-react';

interface ProductFilterDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly className?: string;
}

type TabType = 'products' | 'laboratories' | 'segments';

interface Tab {
  readonly id: TabType;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly description: string;
}

const TABS: Tab[] = [
  {
    id: 'products',
    label: 'Produits',
    icon: <Search className="w-4 h-4" />,
    description: 'Rechercher et sélectionner des produits spécifiques'
  },
  {
    id: 'laboratories', 
    label: 'Laboratoires',
    icon: <Building className="w-4 h-4" />,
    description: 'Filtrer par laboratoires et distributeurs'
  },
  {
    id: 'segments',
    label: 'Segments',
    icon: <BarChart3 className="w-4 h-4" />,
    description: 'Sélectionner par catégories et familles'
  }
];

/**
 * ProductFilterDrawer - Drawer responsive de sélection produits et laboratoires
 * 
 * Mobile: Full width avec tabs empilés et UX touch
 * Desktop: 900px width avec tabs horizontaux
 * Support des deux modes de recherche avec état partagé
 */
export const ProductFilterDrawer: React.FC<ProductFilterDrawerProps> = ({
  isOpen,
  onClose,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  
  const {
    selectedProductIds,
    selectedLaboratoryNames,
    searchResults,
    laboratorySearchResults,
    resetFilters,
    selectAllProducts,
    deselectAllProducts,
    selectAllLaboratories,
    deselectAllLaboratories,
    getSelectedProducts,
    getSelectedLaboratories,
    getAPIFormat,
  } = useProductFiltersStore();

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

  const handleApply = (): void => {
    const selectedProducts = getSelectedProducts();
    const selectedLaboratories = getSelectedLaboratories();
    const apiFormat = getAPIFormat();
    
    console.log('Filtres appliqués:', {
      activeTab,
      products: {
        count: selectedProductIds.length,
        ids: selectedProductIds,
        items: selectedProducts
      },
      laboratories: {
        count: selectedLaboratoryNames.length,
        names: selectedLaboratoryNames,
        items: selectedLaboratories
      },
      apiFormat
    });
    onClose();
  };

  const handleReset = (): void => {
    resetFilters();
  };

  const getTotalSelections = (): number => {
    return selectedProductIds.length + selectedLaboratoryNames.length;
  };

  const renderTabContent = (): React.ReactNode => {
    switch (activeTab) {
      case 'products':
        return (
          <div className="flex-1 flex flex-col p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Recherche de produits
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tapez au moins 3 caractères. La recherche se fait automatiquement par nom ou code produit.
                </p>
              </div>
              
              <ProductSearchInput />
              
              {searchResults.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
                  <div className="text-sm text-gray-600">
                    {searchResults.length} résultat(s) • {selectedProductIds.length} sélectionné(s)
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={selectAllProducts}
                      disabled={searchResults.length === 0}
                      className="flex-1 sm:flex-none"
                    >
                      Tout sélectionner
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deselectAllProducts}
                      disabled={selectedProductIds.length === 0}
                      className="flex-1 sm:flex-none"
                    >
                      Tout désélectionner
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'laboratories':
        return (
          <div className="flex-1 flex flex-col p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Recherche de laboratoires
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tapez au moins 2 caractères. Recherche par nom de laboratoire avec nombre de produits et univers.
                </p>
              </div>
              
              <LaboratorySearchInput />
              
              {laboratorySearchResults.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
                  <div className="text-sm text-gray-600">
                    {laboratorySearchResults.length} résultat(s) • {selectedLaboratoryNames.length} sélectionné(s)
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={selectAllLaboratories}
                      disabled={laboratorySearchResults.length === 0}
                      className="flex-1 sm:flex-none"
                    >
                      Tout sélectionner
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deselectAllLaboratories}
                      disabled={selectedLaboratoryNames.length === 0}
                      className="flex-1 sm:flex-none"
                    >
                      Tout désélectionner
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'segments':
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Recherche Segments
              </h3>
              <p className="text-sm text-gray-500">
                Contenu à venir...
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
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
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <Package className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Filtres Produits
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    Sélectionnez vos critères par onglet
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex-shrink-0 ml-4"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex overflow-x-auto">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        relative flex-1 min-w-0 px-4 sm:px-6 py-4 text-sm font-medium
                        whitespace-nowrap
                        ${isActive 
                          ? 'text-blue-600 bg-white' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200'
                        }
                      `}
                      whileHover={{ scale: isActive ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <motion.div
                          animate={{ 
                            color: isActive ? '#2563eb' : '#6b7280',
                            scale: isActive ? 1.1 : 1
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {tab.icon}
                        </motion.div>
                        <span className="truncate">{tab.label}</span>
                      </div>
                      
                      {/* Active tab indicator */}
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                          layoutId="activeTabIndicator"
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Tab Description */}
            <div className="px-4 sm:px-6 py-3 bg-blue-50 border-b border-blue-100">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeTab}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-blue-800"
                >
                  💡 {TABS.find(tab => tab.id === activeTab)?.description}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Tab Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="flex-1 flex flex-col"
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                <Button
                  variant="ghost"
                  size="md"
                  iconLeft={<RotateCcw className="w-4 h-4" />}
                  onClick={handleReset}
                  className="w-full sm:w-auto"
                >
                  Réinitialiser
                </Button>
                
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <div className="text-sm text-gray-600 text-center">
                    {getTotalSelections() > 0 && (
                      <span className="font-medium text-blue-600">
                        {getTotalSelections()} sélection(s) 
                        {selectedProductIds.length > 0 && selectedLaboratoryNames.length > 0 && (
                          <span className="text-gray-500 ml-1">
                            ({selectedProductIds.length} produits, {selectedLaboratoryNames.length} labos)
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={onClose}
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
                      Appliquer{getTotalSelections() > 0 && ` (${getTotalSelections()})`}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
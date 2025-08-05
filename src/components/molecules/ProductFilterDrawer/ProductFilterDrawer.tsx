// src/components/molecules/ProductFilterDrawer/ProductFilterDrawer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/atoms/Button/Button';
import { ProductSearchInput } from '@/components/molecules/ProductSearchInput/ProductSearchInput';
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

export const ProductFilterDrawer: React.FC<ProductFilterDrawerProps> = ({
  isOpen,
  onClose,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  
  const {
    selectedProductIds,
    searchResults,
    resetFilters,
    selectAllProducts,
    deselectAllProducts,
    getSelectedProducts,
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
    console.log('Filtres produits appliqués:', {
      activeTab,
      selectedCount: selectedProductIds.length,
      selectedIds: selectedProductIds,
      selectedProducts
    });
    onClose();
  };

  const handleReset = (): void => {
    resetFilters();
  };

  const renderTabContent = (): React.ReactNode => {
    switch (activeTab) {
      case 'products':
        return (
          <div className="flex-1 flex flex-col p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Recherche de produits
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tapez au moins 3 caractères. La recherche se fait automatiquement par nom ou code produit.
                </p>
              </div>
              
              <ProductSearchInput />
              
              {searchResults.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {searchResults.length} résultat(s) • {selectedProductIds.length} sélectionné(s)
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={selectAllProducts}
                      disabled={searchResults.length === 0}
                    >
                      Tout sélectionner
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deselectAllProducts}
                      disabled={selectedProductIds.length === 0}
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Recherche Laboratoires
              </h3>
              <p className="text-sm text-gray-500">
                Contenu à venir...
              </p>
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
              fixed top-0 right-0 h-full w-[900px] bg-white shadow-2xl z-50
              flex flex-col ${className}
            `}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Package className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Filtres Produits
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Sélectionnez vos critères par onglet
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

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex">
                {TABS.map((tab, index) => {
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        relative flex-1 px-6 py-4 text-sm font-medium
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
                        <span>{tab.label}</span>
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
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
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
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="md"
                  iconLeft={<RotateCcw className="w-4 h-4" />}
                  onClick={handleReset}
                >
                  Réinitialiser
                </Button>
                
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    {selectedProductIds.length > 0 && (
                      <span className="font-medium text-blue-600">
                        {selectedProductIds.length} produit(s) sélectionné(s)
                      </span>
                    )}
                  </div>
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
                    Appliquer{selectedProductIds.length > 0 && ` (${selectedProductIds.length})`}
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
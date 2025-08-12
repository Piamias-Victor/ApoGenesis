// src/components/organisms/Top100Section/Top100Section.tsx
'use client';

import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/atoms/Card/Card';
import { Badge } from '@/components/atoms/Badge/Badge';
import { RefreshCw } from 'lucide-react';
import ProductsTable from '../ProductsTable/ProductsTable';
import { useTopProducts, ViewType } from '@/hooks/dashboard/useTopProducts';

type SortField = 'ca_sellout' | 'quantity' | 'margin' | 'stock';
type SortDirection = 'asc' | 'desc';

interface Top100SectionProps {
  className?: string;
}

// Skeleton loader
const TableSkeleton = memo(() => (
  <div className="animate-pulse">
    <div className="h-10 bg-gray-200 rounded mb-4"></div>
    {[...Array(10)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
    ))}
  </div>
));

TableSkeleton.displayName = 'TableSkeleton';

export default function Top100Section({ className = '' }: Top100SectionProps) {
  const [activeView, setActiveView] = useState<ViewType>('products');
  const [sortField, setSortField] = useState<SortField>('ca_sellout');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Utilisation du hook
  const { 
    data, 
    viewType,
    loading, 
    error, 
    refetch,
    changeView,
    executionTime 
  } = useTopProducts(activeView, 100);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    changeView(view);
    setSortField('ca_sellout');
    setSortDirection('desc');
    setSearchTerm('');
  };

  const getViewLabel = (view: ViewType) => {
    switch (view) {
      case 'products': return 'Produits';
      case 'laboratories': return 'Laboratoires';
      case 'categories': return 'Catégories';
      default: return 'Produits';
    }
  };

  // Log performance en dev
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && executionTime) {
      console.log(`Top 100 Section rendered in ${executionTime}ms`);
    }
  }, [executionTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
      className={`${className}`}
    >
      <Card variant="elevated" padding="lg">
        <div className="space-y-6">
          {/* Header avec tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Top 100 - {getViewLabel(viewType)}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Analyse détaillée par performance et rentabilité
              </p>
            </div>

            {/* Tabs de sélection */}
            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['products', 'laboratories', 'categories'] as ViewType[]).map((view) => (
                  <button
                    key={view}
                    onClick={() => handleViewChange(view)}
                    disabled={loading}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeView === view
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {getViewLabel(view)}
                  </button>
                ))}
              </div>
              
              {error && (
                <button 
                  onClick={refetch}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded text-sm font-medium text-red-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </button>
              )}
            </div>
          </div>

          {/* Barre de recherche et indicateurs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder={`Rechercher ${getViewLabel(viewType).toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="primary" size="sm">
                Tri: {sortField === 'ca_sellout' ? 'CA' : sortField === 'quantity' ? 'Quantité' : sortField === 'margin' ? 'Marge' : 'Stock'}
              </Badge>
              <Badge variant="gray" size="sm">
                {sortDirection === 'desc' ? '↓' : '↑'}
              </Badge>
              {data && (
                <Badge variant="success" size="sm">
                  {data.length} résultats
                </Badge>
              )}
            </div>
          </div>

          {/* Contenu */}
          {loading ? (
            <TableSkeleton />
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p className="text-sm">{error}</p>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Aucune donnée disponible</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              {viewType === 'products' && (
                <ProductsTable
                  data={data}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  searchTerm={searchTerm}
                  onSort={handleSort}
                />
              )}
              {viewType === 'laboratories' && (
                <LaboratoriesTable
                  data={data}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  searchTerm={searchTerm}
                  onSort={handleSort}
                />
              )}
              {viewType === 'categories' && (
                <CategoriesTable
                  data={data}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  searchTerm={searchTerm}
                  onSort={handleSort}
                />
              )}
            </div>
          )}
          
          {/* Performance indicator (dev only) */}
          {process.env.NODE_ENV === 'development' && executionTime && (
            <div className="text-xs text-gray-400 text-right">
              Chargé en {executionTime}ms
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// Composants pour les autres vues (simplifiés pour l'exemple)
const LaboratoriesTable = ({ data }: any) => (
  <div className="text-center py-8 text-gray-500">
    Vue Laboratoires - À implémenter
  </div>
);

const CategoriesTable = ({ data }: any) => (
  <div className="text-center py-8 text-gray-500">
    Vue Catégories - À implémenter
  </div>
);
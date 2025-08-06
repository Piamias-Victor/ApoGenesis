// src/components/organisms/Top100Section.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/atoms/Card/Card';
import { Badge } from '@/components/atoms/Badge/Badge';
import CategoriesTable from '../CategoriesTable/CategoriesTable';
import LaboratoriesTable from '../LaboratoriesTable/LaboratoriesTable';
import ProductsTable from '../ProductsTable/ProductsTable';

type ViewType = 'products' | 'laboratories' | 'categories';
type SortField = 'ca_sellout' | 'quantity' | 'margin' | 'stock';
type SortDirection = 'asc' | 'desc';

interface Top100SectionProps {
  className?: string;
}

export default function Top100Section({ className = '' }: Top100SectionProps) {
  const [activeView, setActiveView] = useState<ViewType>('products');
  const [sortField, setSortField] = useState<SortField>('ca_sellout');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');

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
    setSortField('ca_sellout');
    setSortDirection('desc');
    setSearchTerm('');
  };

  const renderActiveTable = () => {
    const commonProps = {
      sortField,
      sortDirection,
      searchTerm,
      onSort: handleSort
    };

    switch (activeView) {
      case 'products':
        return <ProductsTable {...commonProps} />;
      case 'laboratories':
        return <LaboratoriesTable {...commonProps} />;
      case 'categories':
        return <CategoriesTable {...commonProps} />;
      default:
        return <ProductsTable {...commonProps} />;
    }
  };

  const getViewLabel = (view: ViewType) => {
    switch (view) {
      case 'products': return 'Produits';
      case 'laboratories': return 'Laboratoires';
      case 'categories': return 'Catégories';
      default: return 'Produits';
    }
  };

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
                Top 100 - {getViewLabel(activeView)}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Analyse détaillée par performance et rentabilité
              </p>
            </div>

            {/* Tabs de sélection */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['products', 'laboratories', 'categories'] as ViewType[]).map((view) => (
                <button
                  key={view}
                  onClick={() => handleViewChange(view)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === view
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {getViewLabel(view)}
                </button>
              ))}
            </div>
          </div>

          {/* Barre de recherche et indicateurs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder={`Rechercher ${getViewLabel(activeView).toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
            </div>
          </div>

          {/* Table dynamique */}
          <div className="overflow-hidden">
            {renderActiveTable()}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
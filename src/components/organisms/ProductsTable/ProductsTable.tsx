// src/components/organisms/ProductsTable/ProductsTable.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { TopProductItem } from '@/hooks/dashboard/useTopProducts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type SortField = 'ca_sellout' | 'quantity' | 'margin';
export type SortDirection = 'asc' | 'desc';

interface ProductsTableProps {
  data: TopProductItem[];
  sortField: SortField;
  sortDirection: SortDirection;
  searchTerm: string;
  onSort: (field: SortField) => void;
  loading?: boolean;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M €`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K €`;
  return `${value.toFixed(0)} €`;
};

const formatNumber = (value: number): string => {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

const ITEMS_PER_PAGE = 10;

export default function ProductsTable({
  data,
  sortField,
  sortDirection,
  searchTerm,
  onSort,
  loading = false
}: ProductsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filtrage et tri des données
  const processedData = useMemo(() => {
    let filtered = data;
    
    // Filtrage par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = data.filter(item => 
        item.product_name?.toLowerCase().includes(search) ||
        item.brand_lab?.toLowerCase().includes(search) ||
        item.category?.toLowerCase().includes(search) ||
        item.code_13_ref_id?.includes(search)
      );
    }
    
    // Tri
    const sorted = [...filtered].sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      switch (sortField) {
        case 'ca_sellout':
          aValue = a.ca_sellout;
          bValue = b.ca_sellout;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'margin':
          aValue = a.margin;
          bValue = b.margin;
          break;
        default:
          return 0;
      }
      
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    return sorted;
  }, [data, searchTerm, sortField, sortDirection]);
  
  // Calcul de la pagination
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = processedData.slice(startIndex, endIndex);
  
  // Reset page quand les filtres changent
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection]);
  
  // Header avec tri
  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          <span className="text-blue-600">
            {sortDirection === 'desc' ? '↓' : '↑'}
          </span>
        )}
      </div>
    </th>
  );
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }
  
  if (processedData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {searchTerm ? 'Aucun produit trouvé' : 'Aucune donnée disponible'}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rang
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Laboratoire
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <SortableHeader field="quantity">Quantité</SortableHeader>
              <SortableHeader field="ca_sellout">CA TTC</SortableHeader>
              <SortableHeader field="margin">Marge</SortableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((item, index) => (
              <tr key={`${item.code_13_ref_id}-${index}`} className="hover:bg-gray-50">
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {startIndex + index + 1}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-xs text-gray-500">{item.code_13_ref_id}</div>
                    {item.range_name && (
                      <div className="text-xs text-gray-400">{item.range_name}</div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                  {item.brand_lab}
                </td>
                <td className="px-3 py-4 text-sm text-gray-600">
                  <div>
                    <div>{item.category}</div>
                    {item.sub_category && (
                      <div className="text-xs text-gray-400">{item.sub_category}</div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {formatNumber(item.quantity)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {formatCurrency(item.ca_sellout)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  <div>
                    <div className="font-medium text-gray-900">
                      {formatCurrency(item.margin)}
                    </div>
                    <div className={`text-xs ${
                      item.margin_percentage > 30 ? 'text-green-600' :
                      item.margin_percentage > 20 ? 'text-blue-600' :
                      'text-gray-500'
                    }`}>
                      {item.margin_percentage}%
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
        
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Affichage de{' '}
              <span className="font-medium">{startIndex + 1}</span> à{' '}
              <span className="font-medium">{Math.min(endIndex, processedData.length)}</span> sur{' '}
              <span className="font-medium">{processedData.length}</span> résultats
            </p>
          </div>
          
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Précédent</span>
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {/* Pages numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNumber
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Suivant</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
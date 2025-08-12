// src/components/organisms/ProductsTable/ProductsTable.tsx
'use client';

import React, { useMemo } from 'react';
import { TopProductItem } from '@/hooks/dashboard/useTopProducts';

export type SortField = 'ca_sellout' | 'quantity' | 'margin' | 'stock';
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

export default function ProductsTable({
  data,
  sortField,
  sortDirection,
  searchTerm,
  onSort,
  loading = false
}: ProductsTableProps) {
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
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        default:
          return 0;
      }
      
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    return sorted;
  }, [data, searchTerm, sortField, sortDirection]);
  
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
            <SortableHeader field="stock">Stock</SortableHeader>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {processedData.map((item, index) => (
            <tr key={`${item.code_13_ref_id}-${index}`} className="hover:bg-gray-50">
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {item.rank}
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
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatNumber(item.stock)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
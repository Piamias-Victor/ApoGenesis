// src/components/organisms/ProductsTable.tsx
'use client';

import React, { useMemo } from 'react';

interface Product {
  id: string;
  nom: string;
  code: string;
  ca_sellout: number;
  quantite_vendue: number;
  marge_pct: number;
  stock_valorise: number;
  laboratoire: string;
  categorie: string;
}

interface ProductsTableProps {
  sortField: 'ca_sellout' | 'quantity' | 'margin' | 'stock';
  sortDirection: 'asc' | 'desc';
  searchTerm: string;
  onSort: (field: 'ca_sellout' | 'quantity' | 'margin' | 'stock') => void;
}

const mockProducts: Product[] = [
  { id: '1', nom: 'Doliprane 1000mg', code: 'DLP1000', ca_sellout: 45230, quantite_vendue: 1520, marge_pct: 22.5, stock_valorise: 8940, laboratoire: 'Sanofi', categorie: 'Antalgique' },
  { id: '2', nom: 'Amoxicilline 500mg', code: 'AMX500', ca_sellout: 38720, quantite_vendue: 890, marge_pct: 28.3, stock_valorise: 12450, laboratoire: 'Biogaran', categorie: 'Antibiotique' },
  { id: '3', nom: 'Efferalgan 500mg', code: 'EFF500', ca_sellout: 35890, quantite_vendue: 1340, marge_pct: 19.8, stock_valorise: 6780, laboratoire: 'UPSA', categorie: 'Antalgique' },
  { id: '4', nom: 'Ventoline 100µg', code: 'VEN100', ca_sellout: 29450, quantite_vendue: 520, marge_pct: 31.2, stock_valorise: 9850, laboratoire: 'GSK', categorie: 'Respiratoire' },
  { id: '5', nom: 'Smecta vanille', code: 'SME001', ca_sellout: 27340, quantite_vendue: 780, marge_pct: 25.7, stock_valorise: 4320, laboratoire: 'Ipsen', categorie: 'Digestif' }
];

export default function ProductsTable({ sortField, sortDirection, searchTerm, onSort }: ProductsTableProps) {
  const sortedAndFilteredProducts = useMemo(() => {
    let filtered = mockProducts.filter(product =>
      product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.laboratoire.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let aVal: number, bVal: number;
      
      switch (sortField) {
        case 'ca_sellout': aVal = a.ca_sellout; bVal = b.ca_sellout; break;
        case 'quantity': aVal = a.quantite_vendue; bVal = b.quantite_vendue; break;
        case 'margin': aVal = a.marge_pct; bVal = b.marge_pct; break;
        case 'stock': aVal = a.stock_valorise; bVal = b.stock_valorise; break;
        default: aVal = a.ca_sellout; bVal = b.ca_sellout;
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [sortField, sortDirection, searchTerm]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);
  const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

  const getSortIcon = (field: string) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produit
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th 
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => onSort('ca_sellout')}
            >
              CA Sell-Out {getSortIcon('ca_sellout')}
            </th>
            <th 
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => onSort('quantity')}
            >
              Quantité {getSortIcon('quantity')}
            </th>
            <th 
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => onSort('margin')}
            >
              % Marge {getSortIcon('margin')}
            </th>
            <th 
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => onSort('stock')}
            >
              Stock {getSortIcon('stock')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Laboratoire
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Catégorie
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedAndFilteredProducts.map((product, index) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white font-medium mr-3 ${
                    index < 3 ? 'bg-green-500' : index < 10 ? 'bg-blue-500' : 'bg-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{product.nom}</div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{product.code}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(product.ca_sellout)}</td>
              <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatNumber(product.quantite_vendue)}</td>
              <td className="px-4 py-3 text-right">
                <span className={`text-sm font-medium ${product.marge_pct > 25 ? 'text-green-600' : product.marge_pct > 20 ? 'text-orange-600' : 'text-red-600'}`}>
                  {product.marge_pct.toFixed(1)}%
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(product.stock_valorise)}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{product.laboratoire}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {product.categorie}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
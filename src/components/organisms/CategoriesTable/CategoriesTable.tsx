// src/components/organisms/CategoriesTable.tsx
'use client';

import React, { useMemo } from 'react';

interface Category {
  id: string;
  nom: string;
  ca_sellout: number;
  quantite_vendue: number;
  marge_pct_moyenne: number;
  stock_valorise: number;
  nb_produits: number;
  top_laboratoires: string[];
}

interface CategoriesTableProps {
  sortField: 'ca_sellout' | 'quantity' | 'margin' | 'stock';
  sortDirection: 'asc' | 'desc';
  searchTerm: string;
  onSort: (field: 'ca_sellout' | 'quantity' | 'margin' | 'stock') => void;
}

const mockCategories: Category[] = [
  { id: '1', nom: 'Antalgique', ca_sellout: 198450, quantite_vendue: 6840, marge_pct_moyenne: 21.3, stock_valorise: 52340, nb_produits: 34, top_laboratoires: ['Sanofi', 'UPSA', 'Pfizer'] },
  { id: '2', nom: 'Antibiotique', ca_sellout: 167230, quantite_vendue: 4520, marge_pct_moyenne: 26.8, stock_valorise: 48920, nb_produits: 28, top_laboratoires: ['Biogaran', 'Pfizer', 'Novartis'] },
  { id: '3', nom: 'Respiratoire', ca_sellout: 142680, quantite_vendue: 3240, marge_pct_moyenne: 29.4, stock_valorise: 41230, nb_produits: 22, top_laboratoires: ['GSK', 'Novartis', 'AstraZeneca'] },
  { id: '4', nom: 'Cardiovasculaire', ca_sellout: 128940, quantite_vendue: 2890, marge_pct_moyenne: 24.7, stock_valorise: 38460, nb_produits: 19, top_laboratoires: ['Sanofi', 'Servier', 'Pfizer'] },
  { id: '5', nom: 'Digestif', ca_sellout: 98750, quantite_vendue: 4120, marge_pct_moyenne: 22.1, stock_valorise: 28940, nb_produits: 26, top_laboratoires: ['Ipsen', 'Mayoly', 'Sanofi'] },
  { id: '6', nom: 'Dermatologie', ca_sellout: 87420, quantite_vendue: 2340, marge_pct_moyenne: 31.5, stock_valorise: 24680, nb_produits: 15, top_laboratoires: ['La Roche-Posay', 'Avène', 'GSK'] },
  { id: '7', nom: 'Neurologie', ca_sellout: 76890, quantite_vendue: 1890, marge_pct_moyenne: 33.2, stock_valorise: 22140, nb_produits: 12, top_laboratoires: ['Roche', 'Novartis', 'Pfizer'] },
  { id: '8', nom: 'Ophtalmologie', ca_sellout: 64230, quantite_vendue: 1520, marge_pct_moyenne: 28.9, stock_valorise: 18670, nb_produits: 9, top_laboratoires: ['Novartis', 'Allergan', 'Thea'] }
];

export default function CategoriesTable({ sortField, sortDirection, searchTerm, onSort }: CategoriesTableProps) {
  const sortedAndFilteredCategories = useMemo(() => {
    let filtered = mockCategories.filter(category =>
      category.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.top_laboratoires.some(lab => lab.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return filtered.sort((a, b) => {
      let aVal: number, bVal: number;
      
      switch (sortField) {
        case 'ca_sellout': aVal = a.ca_sellout; bVal = b.ca_sellout; break;
        case 'quantity': aVal = a.quantite_vendue; bVal = b.quantite_vendue; break;
        case 'margin': aVal = a.marge_pct_moyenne; bVal = b.marge_pct_moyenne; break;
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

  const getCategoryIcon = (categoryName: string) => {
    const icons: Record<string, string> = {
      'Antalgique': '💊',
      'Antibiotique': '🦠',
      'Respiratoire': '🫁',
      'Cardiovasculaire': '❤️',
      'Digestif': '🍃',
      'Dermatologie': '🧴',
      'Neurologie': '🧠',
      'Ophtalmologie': '👁️'
    };
    return icons[categoryName] || '💊';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Catégorie
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
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produits
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Top Labs
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedAndFilteredCategories.map((category, index) => (
            <tr key={category.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white font-medium mr-3 ${
                    index < 3 ? 'bg-green-500' : index < 10 ? 'bg-blue-500' : 'bg-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{getCategoryIcon(category.nom)}</span>
                    <div className="text-sm font-medium text-gray-900">{category.nom}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(category.ca_sellout)}</td>
              <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatNumber(category.quantite_vendue)}</td>
              <td className="px-4 py-3 text-right">
                <span className={`text-sm font-medium ${category.marge_pct_moyenne > 30 ? 'text-green-600' : category.marge_pct_moyenne > 25 ? 'text-orange-600' : 'text-red-600'}`}>
                  {category.marge_pct_moyenne.toFixed(1)}%
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(category.stock_valorise)}</td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {category.nb_produits}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {category.top_laboratoires.slice(0, 2).map((lab, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                      {lab}
                    </span>
                  ))}
                  {category.top_laboratoires.length > 2 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      +{category.top_laboratoires.length - 2}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
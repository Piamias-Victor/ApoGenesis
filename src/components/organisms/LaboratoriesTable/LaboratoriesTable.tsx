// src/components/organisms/LaboratoriesTable.tsx
'use client';

import React, { useMemo } from 'react';

interface Laboratory {
  id: string;
  nom: string;
  ca_sellout: number;
  quantite_vendue: number;
  marge_pct_moyenne: number;
  stock_valorise: number;
  nb_produits: number;
  categories_principales: string[];
}

interface LaboratoriesTableProps {
  sortField: 'ca_sellout' | 'quantity' | 'margin' | 'stock';
  sortDirection: 'asc' | 'desc';
  searchTerm: string;
  onSort: (field: 'ca_sellout' | 'quantity' | 'margin' | 'stock') => void;
}

const mockLaboratories: Laboratory[] = [
  { id: '1', nom: 'Sanofi', ca_sellout: 156780, quantite_vendue: 4520, marge_pct_moyenne: 24.8, stock_valorise: 45230, nb_produits: 23, categories_principales: ['Antalgique', 'Cardiovasculaire', 'Diabète'] },
  { id: '2', nom: 'Pfizer', ca_sellout: 142350, quantite_vendue: 3890, marge_pct_moyenne: 28.2, stock_valorise: 38940, nb_produits: 18, categories_principales: ['Antibiotique', 'Oncologie', 'Vaccins'] },
  { id: '3', nom: 'Novartis', ca_sellout: 128740, quantite_vendue: 3240, marge_pct_moyenne: 26.5, stock_valorise: 32180, nb_produits: 15, categories_principales: ['Ophtalmologie', 'Respiratoire', 'Neurologie'] },
  { id: '4', nom: 'GSK', ca_sellout: 98650, quantite_vendue: 2780, marge_pct_moyenne: 31.2, stock_valorise: 28940, nb_produits: 12, categories_principales: ['Respiratoire', 'Vaccins', 'Dermatologie'] },
  { id: '5', nom: 'Roche', ca_sellout: 87420, quantite_vendue: 1890, marge_pct_moyenne: 33.8, stock_valorise: 25670, nb_produits: 9, categories_principales: ['Oncologie', 'Immunologie', 'Neurologie'] }
];

export default function LaboratoriesTable({ sortField, sortDirection, searchTerm, onSort }: LaboratoriesTableProps) {
  const sortedAndFilteredLaboratories = useMemo(() => {
    let filtered = mockLaboratories.filter(lab =>
      lab.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.categories_principales.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Laboratoire
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
              Catégories
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedAndFilteredLaboratories.map((lab, index) => (
            <tr key={lab.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white font-medium mr-3 ${
                    index < 3 ? 'bg-green-500' : index < 10 ? 'bg-blue-500' : 'bg-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{lab.nom}</div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(lab.ca_sellout)}</td>
              <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatNumber(lab.quantite_vendue)}</td>
              <td className="px-4 py-3 text-right">
                <span className={`text-sm font-medium ${lab.marge_pct_moyenne > 30 ? 'text-green-600' : lab.marge_pct_moyenne > 25 ? 'text-orange-600' : 'text-red-600'}`}>
                  {lab.marge_pct_moyenne.toFixed(1)}%
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(lab.stock_valorise)}</td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {lab.nb_produits}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {lab.categories_principales.slice(0, 2).map((categorie, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {categorie}
                    </span>
                  ))}
                  {lab.categories_principales.length > 2 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      +{lab.categories_principales.length - 2}
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
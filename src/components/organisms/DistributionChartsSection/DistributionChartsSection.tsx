// src/components/organisms/DistributionChartsSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/atoms/Card/Card';

interface DistributionData {
  name: string;
  current: number;
  previous: number;
  color: string;
}

const tvaData: DistributionData[] = [
  { name: 'TVA 20%', current: 156780, previous: 148200, color: 'bg-blue-500' },
  { name: 'TVA 10%', current: 89420, previous: 85600, color: 'bg-green-500' },
  { name: 'TVA 5.5%', current: 67340, previous: 64800, color: 'bg-yellow-500' },
  { name: 'TVA 2.1%', current: 23890, previous: 22400, color: 'bg-purple-500' },
  { name: 'TVA 0%', current: 12450, previous: 13200, color: 'bg-gray-500' }
];

const remboursementData: DistributionData[] = [
  { name: 'Remboursé', current: 234680, previous: 220400, color: 'bg-green-500' },
  { name: 'Non Remboursé', current: 115200, previous: 112800, color: 'bg-red-500' }
];

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);

const calculateEvolution = (current: number, previous: number) => {
  const evolution = ((current - previous) / previous) * 100;
  return {
    value: evolution,
    formatted: evolution >= 0 ? `+${evolution.toFixed(1)}%` : `${evolution.toFixed(1)}%`,
    isPositive: evolution >= 0
  };
};

const DistributionList = ({ 
  data, 
  title 
}: { 
  data: DistributionData[]; 
  title: string;
}) => {
  const total = data.reduce((sum, item) => sum + item.current, 0);
  
  return (
    <div className="space-y-4">
      <h4 className="text-md font-semibold text-gray-900">{title}</h4>
      
      <div className="space-y-3">
        {data.map((item) => {
          const percentage = (item.current / total) * 100;
          const evolution = calculateEvolution(item.current, item.previous);
          
          return (
            <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${item.color} rounded-full flex-shrink-0`} />
                <span className="font-medium text-gray-900">{item.name}</span>
                <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(item.current)}
                </div>
                <div className={`text-xs font-medium ${
                  evolution.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {evolution.formatted}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Total */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="font-semibold text-gray-900">Total</span>
            <div className="font-bold text-gray-900">
              {formatCurrency(total)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DistributionChartsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
      className="mt-8"
    >
      <Card variant="elevated" padding="lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Répartition des Ventes
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Analyse par taux de TVA et type de remboursement avec évolutions
            </p>
          </div>

          {/* Deux listes côte à côte */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DistributionList
              data={tvaData}
              title="Répartition par Taux TVA"
            />
            
            <DistributionList
              data={remboursementData}
              title="Répartition par Remboursement"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
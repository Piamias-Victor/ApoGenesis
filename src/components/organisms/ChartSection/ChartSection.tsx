// src/components/organisms/ChartSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/atoms/Card/Card';
import EvolutionChart from '../EvolutionChart/EvolutionChart';

export default function ChartSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
      className="mb-8"
    >
      <Card variant="elevated" padding="lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Évolution du Chiffre d'Affaires
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Comparaison 2025 vs 2024 - Sell-In, Sell-Out et Marge
              </p>
            </div>
            
            {/* Period indicator */}
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 px-3 py-1.5 rounded-lg">
                <span className="text-xs font-medium text-gray-700">
                  Année 2025
                </span>
              </div>
              <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                <span className="text-xs font-medium text-blue-700">
                  vs 2024
                </span>
              </div>
            </div>
          </div>
          
          {/* Chart */}
          <div className="w-full">
            <EvolutionChart />
          </div>
          
          {/* Quick insights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">+12.3%</div>
              <div className="text-xs text-gray-500">Croissance Sell-Out</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">+8.7%</div>
              <div className="text-xs text-gray-500">Croissance Sell-In</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">+15.8%</div>
              <div className="text-xs text-gray-500">Croissance Marge</div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
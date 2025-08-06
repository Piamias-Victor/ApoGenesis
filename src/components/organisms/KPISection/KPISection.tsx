// src/components/organisms/KPISection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/atoms/Card/Card';

export default function KPISection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8"
    >
      {/* KPI Sell-In */}
      <Card variant="elevated" padding="lg" className="order-1">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
              CA Sell-In
            </h3>
            <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              189 420 €
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <span className="text-green-600 font-medium">+2.1%</span>
              <span className="text-gray-500 ml-1">vs période précédente</span>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Sell-Out */}
      <Card variant="elevated" padding="lg" className="order-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
              CA Sell-Out
            </h3>
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              245 850 €
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <span className="text-green-600 font-medium">+12.5%</span>
              <span className="text-gray-500 ml-1">vs période précédente</span>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Marge Brute */}
      <Card variant="elevated" padding="lg" className="order-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
              Marge Brute
            </h3>
            <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0" />
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              56 430 €
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <span className="text-green-600 font-medium">+18.3%</span>
              <span className="text-gray-500 ml-1">rentabilité</span>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Stock Valorisé */}
      <Card variant="elevated" padding="lg" className="order-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
              Stock Valorisé
            </h3>
            <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0" />
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              89 640 €
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <span className="text-green-600 font-medium">+8.3%</span>
              <span className="text-gray-500 ml-1">optimal</span>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Rotation Stock */}
      <Card variant="elevated" padding="lg" className="order-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
              Rotation Stock
            </h3>
            <div className="w-3 h-3 bg-pink-500 rounded-full flex-shrink-0" />
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              4.2x/an
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <span className="text-green-600 font-medium">+0.8x</span>
              <span className="text-gray-500 ml-1">performance</span>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Couverture Stock */}
      <Card variant="elevated" padding="lg" className="order-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
              Couverture Stock
            </h3>
            <div className="w-3 h-3 bg-cyan-500 rounded-full flex-shrink-0" />
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              45 jours
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <span className="text-green-600 font-medium">-3j</span>
              <span className="text-gray-500 ml-1">optimal</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
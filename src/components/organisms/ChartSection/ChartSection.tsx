// src/components/organisms/ChartSection/ChartSection.tsx
'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/atoms/Card/Card';
import EvolutionChart from '../EvolutionChart/EvolutionChart';
import { useEvolutionChart } from '@/hooks/dashboard/useEvolutionChart';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

// Mémoisation du composant d'insight
const InsightCard = memo(({ 
  value, 
  label, 
  color 
}: { 
  value: string; 
  label: string; 
  color: 'green' | 'blue' | 'orange' | 'purple' 
}) => {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600'
  };

  const getIcon = () => {
    if (value.startsWith('+')) return <TrendingUp className="w-4 h-4" />;
    if (value.startsWith('-')) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className="text-center">
      <div className={`text-lg font-semibold ${colorClasses[color]} flex items-center justify-center gap-1`}>
        {getIcon()}
        <span>{value}</span>
      </div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
});

InsightCard.displayName = 'InsightCard';

// Skeleton loader
const ChartSkeleton = memo(() => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
      <div>
        <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>
    </div>
    
    <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
    
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
      {[1, 2, 3].map(i => (
        <div key={i} className="text-center">
          <div className="h-6 bg-gray-200 rounded w-16 mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
));

ChartSkeleton.displayName = 'ChartSkeleton';

export default function ChartSection() {
  const { 
    data, 
    mode, 
    loading, 
    error, 
    refetch,
    executionTime 
  } = useEvolutionChart();

  // Log performance en dev
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && executionTime) {
      console.log(`Chart Section rendered in ${executionTime}ms`);
    }
  }, [executionTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
      className="mb-8"
    >
      <Card variant="elevated" padding="lg">
        {loading ? (
          <ChartSkeleton />
        ) : error ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 text-red-600 rounded-lg">
              <span className="text-sm">{error}</span>
              <button 
                onClick={refetch}
                className="flex items-center gap-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Évolution du Chiffre d'Affaires
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Comparaison des périodes - Sell-In, Sell-Out et Marge
                  {mode === 'quarterly' && ' (Vue trimestrielle)'}
                </p>
              </div>
              
              {/* Period indicator */}
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 px-3 py-1.5 rounded-lg">
                  <span className="text-xs font-medium text-gray-700">
                    {mode === 'monthly' ? 'Vue mensuelle' : 'Vue trimestrielle'}
                  </span>
                </div>
                <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                  <span className="text-xs font-medium text-blue-700">
                    Comparaison active
                  </span>
                </div>
              </div>
            </div>
            
            {/* Chart */}
            <div className="w-full">
              <EvolutionChart 
                data={data} 
                mode={mode} 
                loading={loading} 
                error={error} 
              />
            </div>
            
            {/* Performance indicator (dev only) */}
            {process.env.NODE_ENV === 'development' && executionTime && (
              <div className="text-xs text-gray-400 text-right mt-4">
                Chargé en {executionTime}ms
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
// src/components/organisms/KPISection/KPISection.tsx
'use client';

import React, { useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/atoms/Card/Card';
import { useKPIs } from '@/hooks/dashboard/useKPIs';
import { useSelectedLaboratoryNames } from '@/store/productFiltersStore';
import { usePharmacyFiltersStore } from '@/store/pharmacyFiltersStore';

// Mémoisation du composant KPI Card
const KPICard = memo(({ title, data, color, index }: {
  title: string;
  data: any;
  color: string;
  index: number;
}) => (
  <Card variant="elevated" padding="lg" className={`order-${index + 1}`}>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </h3>
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: getColorHex(color) }}
        />
      </div>
      <div className="space-y-1">
        <div className="text-xl sm:text-2xl font-bold text-gray-900">
          {data.value}
        </div>
        <div className="flex items-center text-xs sm:text-sm">
          <span className={`font-medium ${
            data.trend === 'positive' ? 'text-green-600' : 
            data.trend === 'negative' ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {data.evolution}
          </span>
          <span className="text-gray-500 ml-1">{data.label}</span>
        </div>
      </div>
    </div>
  </Card>
));

KPICard.displayName = 'KPICard';

// Skeleton loader mémorisé
const KPISkeleton = memo(() => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8"
  >
    {[...Array(6)].map((_, i) => (
      <Card key={i} variant="elevated" padding="lg" className={`order-${i + 1}`}>
        <div className="space-y-3">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    ))}
  </motion.div>
));

KPISkeleton.displayName = 'KPISkeleton';

export default function KPISection() {
  // Récupération optimisée des filtres
  const selectedLaboratoryNames = useSelectedLaboratoryNames();
  const selectedPharmacyIds = usePharmacyFiltersStore(state => state.selectedPharmacyIds);
  
  // Construction des paramètres avec mémoisation
  const pharmacyFilter = React.useMemo(
    () => selectedPharmacyIds.length > 0 ? selectedPharmacyIds.join(',') : undefined,
    [selectedPharmacyIds]
  );
  
  const brandLabFilter = React.useMemo(
    () => selectedLaboratoryNames.length > 0 ? selectedLaboratoryNames.join(',') : undefined,
    [selectedLaboratoryNames]
  );
  
  // Hook avec gestion d'erreur et performance
  const { data: kpis, loading, error, refetch, executionTime } = useKPIs(
    2025, 
    pharmacyFilter,
    brandLabFilter
  );
  
  // Log performance en dev
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && executionTime) {
      console.log(`KPI Section rendered in ${executionTime}ms`);
    }
  }, [executionTime]);
  
  // Loading state
  if (loading) {
    return <KPISkeleton />;
  }
  
  // Error state
  if (error || !kpis) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="p-4 bg-red-50 text-red-600 rounded-lg mb-8"
      >
        <div className="flex items-center justify-between">
          <span>{error || 'Erreur lors du chargement des KPIs'}</span>
          <button 
            onClick={refetch}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      </motion.div>
    );
  }
  
  // Configuration des cartes KPI
  const kpiCards = [
    { title: 'CA Sell-In', data: kpis.ca_sellin, color: 'blue' },
    { title: 'CA Sell-Out', data: kpis.ca_sellout, color: 'green' },
    { title: 'Marge Brute', data: kpis.marge_brute, color: 'orange' },
    { title: 'Stock Valorisé', data: kpis.stock_valorise, color: 'purple' },
    { title: 'Rotation Stock', data: kpis.rotation_stock, color: 'pink' },
    { title: 'Couverture Stock', data: kpis.couverture_stock, color: 'cyan' }
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8"
    >
      {kpiCards.map((kpi, index) => (
        <KPICard
          key={kpi.title}
          title={kpi.title}
          data={kpi.data}
          color={kpi.color}
          index={index}
        />
      ))}
    </motion.div>
  );
}

// Fonction utilitaire mémorisée
const getColorHex = (color: string): string => {
  const colors: Record<string, string> = {
    blue: '#3B82F6',
    green: '#10B981',
    orange: '#F97316',
    purple: '#A855F7',
    pink: '#EC4899',
    cyan: '#06B6D4'
  };
  return colors[color] || '#6B7280';
};
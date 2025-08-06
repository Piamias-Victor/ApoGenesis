// src/app/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/shared/useAuth';
import { Card } from '@/components/atoms/Card/Card';
import { Badge } from '@/components/atoms/Badge/Badge';
import { AnimatedBackground } from '@/components/atoms/AnimatedBackground/AnimatedBackground';
import { ActiveFiltersBar } from '@/components/molecules/ActiveFiltersBar/ActiveFiltersBar';
import { DateFilterDrawer } from '@/components/molecules/DateFilterDrawer/DateFilterDrawer';
import { PharmacyFilterDrawer } from '@/components/molecules/PharmacyFilterDrawer/PharmacyFilterDrawer';
import { ProductFilterDrawer } from '@/components/molecules/ProductFilterDrawer/ProductFilterDrawer';

import { redirect } from 'next/navigation';
import ChartSection from '@/components/organisms/ChartSection/ChartSection';
import KPISection from '@/components/organisms/KPISection/KPISection';
import Top100Section from '@/components/organisms/Top100Section/Top100Section';

/**
 * Dashboard Page - Page principale avec filtres actifs et AnimatedBackground
 * 
 * Mobile-first responsive avec ActiveFiltersBar au-dessus des KPIs
 * Grid KPIs : 1 col mobile, 2 cols tablet, 3 cols desktop
 * Background animé identique à la homepage
 */
export default function DashboardPage(): JSX.Element {
  const { user, isAuthenticated, isLoading, role, pharmacyName } = useAuth();
  
  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);
  const [isPharmacyDrawerOpen, setIsPharmacyDrawerOpen] = useState(false);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);

  if (!isLoading && !isAuthenticated) {
    redirect('/login');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 relative overflow-hidden">
        {/* Background animé même pendant loading */}
        <AnimatedBackground />
        
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 sm:py-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="w-48 sm:w-64 h-6 sm:h-8 bg-white/80 rounded animate-pulse" />
            <div className="h-12 bg-white/80 rounded animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} variant="elevated" padding="lg">
                  <div className="space-y-3">
                    <div className="w-20 sm:w-24 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-24 sm:w-32 h-6 sm:h-8 bg-gray-200 rounded animate-pulse" />
                    <div className="w-16 sm:w-20 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 relative overflow-hidden">
        {/* Background animé identique homepage */}
        <AnimatedBackground />
        
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 sm:py-8">
          
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  Dashboard ApoData
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                  Bienvenue {user?.name}
                  {pharmacyName && (
                    <span className="block sm:inline">
                      <span className="hidden sm:inline"> • </span>
                      <span className="text-blue-600 font-medium">{pharmacyName}</span>
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Badge variant="success" size="md" className="whitespace-nowrap">
                  En ligne
                </Badge>
                {role === 'admin' && (
                  <Badge variant="gradient-purple" size="md" className="whitespace-nowrap">
                    Administrateur
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>

          {/* Active Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="mb-6 sm:mb-8"
          >
            <ActiveFiltersBar
              onDateFilterClick={() => setIsDateDrawerOpen(true)}
              onPharmacyFilterClick={() => setIsPharmacyDrawerOpen(true)}
              onProductFilterClick={() => setIsProductDrawerOpen(true)}
            />
          </motion.div>

          {/* KPIs Section - 6 KPIs */}
          <KPISection />

          {/* Chart Section - Evolution CA */}
          <ChartSection />

          {/* Top 100 Section - Produits/Labs/Catégories */}
          <Top100Section />

          {/* Coming Soon Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="mt-8"
          >
            <Card variant="gradient" padding="xl">
              <div className="text-center space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  🚀 Dashboard en construction
                </h2>
                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Les filtres sont opérationnels ! Graphiques et fonctionnalités avancées arrivent bientôt.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:space-x-2">
                  <Badge variant="gradient-blue" size="md">
                    Filtres ✓
                  </Badge>
                  <Badge variant="gradient-green" size="md">
                    Graphiques
                  </Badge>
                  <Badge variant="gradient-purple" size="md">
                    Exports
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>

      {/* Filter Drawers */}
      <DateFilterDrawer
        isOpen={isDateDrawerOpen}
        onClose={() => setIsDateDrawerOpen(false)}
      />

      <PharmacyFilterDrawer
        isOpen={isPharmacyDrawerOpen}
        onClose={() => setIsPharmacyDrawerOpen(false)}
      />

      <ProductFilterDrawer
        isOpen={isProductDrawerOpen}
        onClose={() => setIsProductDrawerOpen(false)}
      />
    </>
  );
}
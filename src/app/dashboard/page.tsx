// src/app/dashboard/page.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/shared/useAuth';
import { Card } from '@/components/atoms/Card/Card';
import { Badge } from '@/components/atoms/Badge/Badge';
import { redirect } from 'next/navigation';

/**
 * Dashboard Page - Page principale responsive
 * 
 * Mobile-first avec adaptation progressive desktop
 * Grid KPIs : 1 col mobile, 2 cols tablet, 3 cols desktop
 * Spacing et typography adaptés par breakpoint
 */
export default function DashboardPage(): JSX.Element {
  const { user, isAuthenticated, isLoading, role, pharmacyName } = useAuth();

  // Redirection si non authentifié
  if (!isLoading && !isAuthenticated) {
    redirect('/login');
  }

  // Loading state responsive
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 sm:py-8">
          <div className="space-y-4 sm:space-y-6">
            {/* Title skeleton */}
            <div className="w-48 sm:w-64 h-6 sm:h-8 bg-gray-200 rounded animate-pulse" />
            
            {/* KPIs skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
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
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 sm:py-8">
        
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

        {/* Quick Stats Preview - Responsive Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          
          {/* KPI Sell-Out */}
          <Card variant="elevated" padding="lg" className="order-1">
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
                  <span className="text-gray-500 ml-1">vs mois dernier</span>
                </div>
              </div>
            </div>
          </Card>

          {/* KPI Sell-In */}
          <Card variant="elevated" padding="lg" className="order-2">
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
                  <span className="text-orange-600 font-medium">-2.1%</span>
                  <span className="text-gray-500 ml-1">vs mois dernier</span>
                </div>
              </div>
            </div>
          </Card>

          {/* KPI Stock */}
          <Card variant="elevated" padding="lg" className="order-3 sm:col-span-2 lg:col-span-1">
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

        </motion.div>

        {/* Coming Soon Section - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        >
          <Card variant="gradient" padding="xl">
            <div className="text-center space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                🚀 Dashboard en construction
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Nous construisons votre dashboard étape par étape. 
                Les filtres, graphiques et fonctionnalités avancées arrivent bientôt !
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:space-x-2">
                <Badge variant="gradient-blue" size="md">
                  Filtres
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

        {/* Mobile info footer */}
        <div className="mt-8 sm:mt-12 text-center sm:hidden">
          <p className="text-xs text-gray-500">
            Interface optimisée • Desktop recommandé pour plus de fonctionnalités
          </p>
        </div>

      </div>
    </div>
  );
}
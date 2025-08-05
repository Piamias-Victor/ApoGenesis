// src/app/dashboard/page.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/shared/useAuth';
import { Card } from '@/components/atoms/Card/Card';
import { Badge } from '@/components/atoms/Badge/Badge';
import { redirect } from 'next/navigation';

/**
 * Dashboard Page - Page principale du dashboard
 * 
 * Affiche les KPIs essentiels et les fonctionnalités principales
 * Protégée par authentication (redirection si non connecté)
 */
export default function DashboardPage(): JSX.Element {
  const { user, isAuthenticated, isLoading, role, pharmacyName } = useAuth();

  // Redirection si non authentifié
  if (!isLoading && !isAuthenticated) {
    redirect('/login');
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-apodata py-8">
          <div className="space-y-6">
            <div className="w-64 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} variant="elevated" padding="lg">
                  <div className="space-y-3">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
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
      <div className="container-apodata py-8">
        
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard ApoData
              </h1>
              <p className="text-gray-600 mt-2">
                Bienvenue {user?.name} {pharmacyName && `• ${pharmacyName}`}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="md">
                En ligne
              </Badge>
              {role === 'admin' && (
                <Badge variant="gradient-purple" size="md">
                  Administrateur
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          
          {/* KPI Sell-Out */}
          <Card variant="elevated" padding="lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  CA Sell-Out
                </h3>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">
                  245 850 €
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-green-600 font-medium">+12.5%</span>
                  <span className="text-gray-500 ml-1">vs mois dernier</span>
                </div>
              </div>
            </div>
          </Card>

          {/* KPI Sell-In */}
          <Card variant="elevated" padding="lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  CA Sell-In
                </h3>
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">
                  189 420 €
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-orange-600 font-medium">-2.1%</span>
                  <span className="text-gray-500 ml-1">vs mois dernier</span>
                </div>
              </div>
            </div>
          </Card>

          {/* KPI Stock */}
          <Card variant="elevated" padding="lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Stock Valorisé
                </h3>
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">
                  89 640 €
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-green-600 font-medium">+8.3%</span>
                  <span className="text-gray-500 ml-1">optimal</span>
                </div>
              </div>
            </div>
          </Card>

        </motion.div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        >
          <Card variant="gradient" padding="xl">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                🚀 Dashboard en construction
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Nous construisons votre dashboard étape par étape. 
                Les filtres, graphiques et fonctionnalités avancées arrivent bientôt !
              </p>
              <div className="flex items-center justify-center space-x-2">
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

      </div>
    </div>
  );
}
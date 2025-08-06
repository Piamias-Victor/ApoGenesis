// src/app/dashboard/produits/page.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/shared/useAuth';
import { Card } from '@/components/atoms/Card/Card';
import { AnimatedBackground } from '@/components/atoms/AnimatedBackground/AnimatedBackground';
import { ActiveFiltersBar } from '@/components/molecules/ActiveFiltersBar/ActiveFiltersBar';
import { Package } from 'lucide-react';

/**
 * ProduitsPage - Gestion des produits pharmaceutiques
 */
export default function ProduitsPage(): JSX.Element {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Non autorisé</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <AnimatedBackground />
      
      <div className="relative z-10 pt-6 pb-12">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Gestion des Produits
                </h1>
                <p className="text-gray-600">
                  Analyse et suivi des performances produits
                </p>
              </div>
            </div>
            
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Page Produits
              </h3>
              <p className="text-gray-600">
                Fonctionnalité en développement - Navigation fonctionnelle ✅
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
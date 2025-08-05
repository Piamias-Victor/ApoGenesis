// src/components/organisms/DashboardHeader/DashboardHeader.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/shared/useAuth';
import { Button } from '@/components/atoms/Button/Button';
import { Badge } from '@/components/atoms/Badge/Badge';
import { DateFilterButton } from '@/components/molecules/DateFilterButton/DateFilterButton';
import { DateFilterDrawer } from '@/components/molecules/DateFilterDrawer/DateFilterDrawer';
import { DateFilterState, DateUtils } from '@/types/dateFilters';
import { Settings, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  readonly className?: string;
}

/**
 * DashboardHeader - Header spécialisé pour les pages dashboard
 * 
 * Design épuré avec logo ApoData à gauche, filtres au centre et user actions à droite
 * Gestion complète des périodes d'analyse et de comparaison
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className = '' }) => {
  const router = useRouter();
  const { user, isLoading, role, pharmacyName } = useAuth();

  // État initial des filtres
  const [dateFilterState, setDateFilterState] = useState<DateFilterState>(() => {
    const currentMonth = DateUtils.getCurrentMonth();
    const previousPeriod = DateUtils.getPreviousPeriod(currentMonth);
    
    return {
      analysisPeriod: {
        type: 'current_month',
        range: currentMonth,
        label: 'Mois en cours'
      },
      comparisonPeriod: {
        type: 'previous_period', 
        range: previousPeriod,
        label: 'Période précédente'
      }
    };
  });

  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);

  const handleLogoClick = (): void => {
    router.push('/dashboard');
  };

  const handleSettingsClick = (): void => {
    console.log('Paramètres dashboard');
  };

  const handleLogoutClick = async (): Promise<void> => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleDateFilterChange = (newState: DateFilterState): void => {
    setDateFilterState(newState);
    console.log('Nouvelles périodes:', newState);
  };

  if (isLoading) {
    return (
      <header className={`
        bg-white border-b border-gray-200 shadow-soft
        ${className}
      `}>
        <div className="container-apodata">
          <div className="flex items-center justify-between h-16">
            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="flex items-center space-x-3">
              <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <motion.header
        className={`
          bg-white border-b border-gray-200 shadow-soft
          ${className}
        `}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="container-apodata">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo ApoData - Gauche */}
            <motion.button
              onClick={handleLogoClick}
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ApoData
              </h1>
              <Badge variant="success" size="xs" className="ml-3">
                Dashboard
              </Badge>
            </motion.button>

            {/* Filtres - Centre */}
            <div className="flex items-center space-x-4">
              
              {/* Filtre Date */}
              <DateFilterButton
                filterState={dateFilterState}
                onClick={() => setIsDateDrawerOpen(true)}
              />

              {/* Placeholder pour futurs filtres */}
              <Button variant="secondary" size="md" disabled>
                Pharmacies
              </Button>

              <Button variant="secondary" size="md" disabled>
                Produits
              </Button>

            </div>

            {/* User Actions - Droite */}
            <div className="flex items-center space-x-4">
              
              {/* User Info */}
              {user?.name && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="hidden sm:block">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {user.name}
                      </span>
                      {role === 'admin' ? (
                        <Badge variant="gradient-purple" size="xs">
                          Admin
                        </Badge>
                      ) : (
                        pharmacyName && (
                          <Badge variant="gray" size="xs">
                            {pharmacyName}
                          </Badge>
                        )
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {role === 'admin' ? 'Accès multi-pharmacies' : 'Pharmacien'}
                    </div>
                  </div>
                </div>
              )}

              {/* Separator */}
              <div className="h-8 w-px bg-gray-200" />

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconLeft={<Settings className="w-4 h-4" />}
                    onClick={handleSettingsClick}
                  />
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconLeft={<LogOut className="w-4 h-4" />}
                    onClick={handleLogoutClick}
                  />
                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </motion.header>

      {/* Date Filter Drawer */}
      <DateFilterDrawer
        isOpen={isDateDrawerOpen}
        onClose={() => setIsDateDrawerOpen(false)}
        filterState={dateFilterState}
        onFilterChange={handleDateFilterChange}
      />
    </>
  );
};
// src/components/organisms/DashboardHeader/DashboardHeader.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/shared/useAuth';
import { useDateFilters } from '@/hooks/dashboard/useDateFilters';
import { Button } from '@/components/atoms/Button/Button';
import { ContextSwitcher } from '@/components/molecules/ContextSwitcher/ContextSwitcher';
import { DateFilterButton } from '@/components/molecules/DateFilterButton/DateFilterButton';
import { DateFilterDrawer } from '@/components/molecules/DateFilterDrawer/DateFilterDrawer';
import { PharmacyFilterButton } from '@/components/molecules/PharmacyFilterButton/PharmacyFilterButton';
import { PharmacyFilterDrawer } from '@/components/molecules/PharmacyFilterDrawer/PharmacyFilterDrawer';
import { ProductFilterButton } from '@/components/molecules/ProductFilterButton/ProductFilterButton';
import { ProductFilterDrawer } from '@/components/molecules/ProductFilterDrawer/ProductFilterDrawer';
import { 
  Settings, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';

interface DashboardHeaderProps {
  readonly className?: string;
}

/**
 * DashboardHeader - Header responsive pour dashboard avec ContextSwitcher
 * 
 * Desktop: Logo + ContextSwitcher gauche, filtres centre, user actions droite
 * Mobile: Logo + ContextSwitcher + hamburger, filtres dans menu mobile
 * ContextSwitcher remplace l'ancien logo+badge par navigation contextuelle
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className = '' }) => {
  const router = useRouter();
  const { user, isLoading, role, pharmacyName } = useAuth();
  const { dateFilters, isLoading: dateLoading } = useDateFilters();

  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);
  const [isPharmacyDrawerOpen, setIsPharmacyDrawerOpen] = useState(false);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSettingsClick = (): void => {
    console.log('Paramètres dashboard');
  };

  const handleLogoutClick = async (): Promise<void> => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(prev => !prev);
  };

  if (isLoading) {
    return (
      <header className={`
        bg-white border-b border-gray-200 shadow-soft
        ${className}
      `}>
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-4">
              <div className="w-20 sm:w-24 h-6 sm:h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-32 sm:w-40 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              <div className="w-28 lg:w-32 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-24 lg:w-28 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-20 lg:w-24 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <motion.header
        className={`
          fixed top-0 left-0 right-0 z-50 
          bg-white/95 backdrop-blur-sm border-b border-gray-200
          shadow-soft transition-all duration-300
          ${className}
        `}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Section gauche : Logo + Badge avec dropdown */}
            <div className="flex items-center">
              <motion.button
                className="flex items-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ApoData
                </h1>
                <ContextSwitcher className="ml-2 sm:ml-3 hidden sm:block" />
              </motion.button>
            </div>

            {/* Section centre : Filtres Desktop */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              <DateFilterButton
                filterState={dateFilters}
                onClick={() => setIsDateDrawerOpen(true)}
                loading={dateLoading}
              />
              
              {role === 'admin' && (
                <PharmacyFilterButton
                  onClick={() => setIsPharmacyDrawerOpen(true)}
                />
              )}
              
              <ProductFilterButton
                onClick={() => setIsProductDrawerOpen(true)}
              />
            </div>

            {/* Section droite : User + Mobile Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* User Info Desktop */}
              {user?.name && (
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">
                      {role === 'admin' ? 'Administrateur' : pharmacyName}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions Desktop */}
              <div className="hidden md:flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSettingsClick}
                  className="p-2"
                  aria-label="Paramètres"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogoutClick}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>

              {/* Menu Mobile Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={toggleMobileMenu}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Supprimé - ContextSwitcher maintenant dans le logo et burger menu */}
        </div>

        {/* Menu Mobile */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-gray-200 bg-white"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="px-4 py-4 space-y-3">
                {/* User Info Mobile */}
                {user?.name && (
                  <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">
                        {role === 'admin' ? 'Administrateur' : pharmacyName}
                      </div>
                    </div>
                  </div>
                )}

                {/* ContextSwitcher Mobile */}
                <div className="pb-3 border-b border-gray-100">
                  <ContextSwitcher />
                </div>

                {/* Filtres Mobile */}
                <div className="space-y-2">
                  <DateFilterButton
                    filterState={dateFilters}
                    onClick={() => {
                      setIsDateDrawerOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    loading={dateLoading}
                    className="w-full justify-start"
                  />
                  
                  {role === 'admin' && (
                    <PharmacyFilterButton
                      onClick={() => {
                        setIsPharmacyDrawerOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    />
                  )}
                  
                  <ProductFilterButton
                    onClick={() => {
                      setIsProductDrawerOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  />
                </div>

                {/* Actions Mobile */}
                <div className="pt-3 border-t border-gray-100 flex space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSettingsClick}
                    className="flex-1 justify-start space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Paramètres</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogoutClick}
                    className="flex-1 justify-start space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Drawers */}
      <DateFilterDrawer
        isOpen={isDateDrawerOpen}
        onClose={() => setIsDateDrawerOpen(false)}
      />
      
      {role === 'admin' && (
        <PharmacyFilterDrawer
          isOpen={isPharmacyDrawerOpen}
          onClose={() => setIsPharmacyDrawerOpen(false)}
        />
      )}
      
      <ProductFilterDrawer
        isOpen={isProductDrawerOpen}
        onClose={() => setIsProductDrawerOpen(false)}
      />
    </>
  );
};
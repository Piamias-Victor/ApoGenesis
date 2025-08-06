// src/components/organisms/DashboardHeader/DashboardHeader.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/shared/useAuth';
import { useDateFilters } from '@/hooks/dashboard/useDateFilters';
import { Button } from '@/components/atoms/Button/Button';
import { Badge } from '@/components/atoms/Badge/Badge';
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
  X, 
  Calendar,
  Building2,
  Package
} from 'lucide-react';

interface DashboardHeaderProps {
  readonly className?: string;
}

/**
 * DashboardHeader - Header responsive pour dashboard
 * 
 * Desktop: Logo gauche, filtres centre, user actions droite
 * Mobile: Logo + hamburger, filtres dans menu mobile
 * Utilise Tailwind responsive classes pour adaptation automatique
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className = '' }) => {
  const router = useRouter();
  const { user, isLoading, role, pharmacyName } = useAuth();
  const { dateFilters, isLoading: dateLoading } = useDateFilters();

  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);
  const [isPharmacyDrawerOpen, setIsPharmacyDrawerOpen] = useState(false);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <div className="w-20 sm:w-24 h-6 sm:h-8 bg-gray-200 rounded animate-pulse" />
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              <div className="w-28 lg:w-32 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-28 lg:w-32 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-28 lg:w-32 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="hidden sm:block w-16 lg:w-20 h-4 bg-gray-200 rounded animate-pulse" />
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
          fixed top-0 left-0 right-0 z-50 
          bg-white border-b border-gray-200 shadow-soft
          ${className}
        `}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Logo ApoData - Gauche */}
            <div className="flex items-center">
              <motion.button
                onClick={handleLogoClick}
                className="flex items-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ApoData
                </h1>
                <Badge variant="success" size="xs" className="ml-2 sm:ml-3 hidden sm:block">
                  Dashboard
                </Badge>
              </motion.button>
            </div>

            {/* Filtres - Centre Desktop seulement */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
              
              {/* Filtre Date */}
              <DateFilterButton
                filterState={dateFilters}
                onClick={() => setIsDateDrawerOpen(true)}
                loading={dateLoading}
              />

              {/* Filtre Pharmacies - Visible uniquement pour admins */}
              {role === 'admin' && (
                <PharmacyFilterButton
                  onClick={() => setIsPharmacyDrawerOpen(true)}
                  selectedCount={0}
                />
              )}

              {/* Filtre Produits + Laboratoires */}
              <ProductFilterButton
                onClick={() => setIsProductDrawerOpen(true)}
              />

            </div>

            {/* Actions Droite */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              
              {/* Filtres Mobile - Medium screens */}
              <div className="flex md:hidden lg:hidden items-center space-x-1">
                <motion.button
                  onClick={() => setIsDateDrawerOpen(true)}
                  className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Filtres de date"
                >
                  <Calendar className="w-5 h-5" />
                </motion.button>
                
                {role === 'admin' && (
                  <motion.button
                    onClick={() => setIsPharmacyDrawerOpen(true)}
                    className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Filtres pharmacies"
                  >
                    <Building2 className="w-5 h-5" />
                  </motion.button>
                )}
                
                <motion.button
                  onClick={() => setIsProductDrawerOpen(true)}
                  className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Filtres produits"
                >
                  <Package className="w-5 h-5" />
                </motion.button>
              </div>

              {/* User Avatar */}
              {user?.name && (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* User Info - Desktop only */}
                  <div className="hidden md:block lg:block">
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
                          <Badge variant="gray" size="xs" className="max-w-[120px] truncate">
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

              {/* Desktop Actions */}
              <div className="hidden sm:flex items-center space-x-1">
                <div className="h-6 w-px bg-gray-200 mx-1" />
                
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

              {/* Menu Hamburger Mobile */}
              <div className="sm:hidden">
                <motion.button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>

          </div>

          {/* Menu Mobile */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="sm:hidden border-t border-gray-200 bg-white"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="py-4 space-y-2">
                  
                  {/* User Info Mobile */}
                  {user?.name && (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg mx-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                          <div className="text-xs text-gray-500">
                            {role === 'admin' ? 'Administrateur' : pharmacyName}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions Mobile */}
                  <div className="px-4 space-y-2">
                    <Button
                      variant="ghost"
                      size="md"
                      fullWidth
                      iconLeft={<Settings className="w-4 h-4" />}
                      onClick={() => {
                        handleSettingsClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      Paramètres
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      iconLeft={<LogOut className="w-4 h-4" />}
                      onClick={() => {
                        handleLogoutClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      Déconnexion
                    </Button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.header>

      {/* Date Filter Drawer */}
      <DateFilterDrawer
        isOpen={isDateDrawerOpen}
        onClose={() => setIsDateDrawerOpen(false)}
      />

      {/* Pharmacy Filter Drawer - Seulement pour admins */}
      {role === 'admin' && (
        <PharmacyFilterDrawer
          isOpen={isPharmacyDrawerOpen}
          onClose={() => setIsPharmacyDrawerOpen(false)}
        />
      )}

      {/* Product Filter Drawer */}
      <ProductFilterDrawer
        isOpen={isProductDrawerOpen}
        onClose={() => setIsProductDrawerOpen(false)}
      />
    </>
  );
};
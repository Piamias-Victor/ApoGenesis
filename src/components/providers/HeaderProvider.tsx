// src/components/providers/HeaderProvider.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { HomeHeader } from '@/components/organisms/HomeHeader/HomeHeader';
import { DashboardHeader } from '@/components/organisms/DashboardHeader/DashboardHeader';

interface HeaderProviderProps {
  readonly children: React.ReactNode;
}

/**
 * HeaderProvider - Gère l'affichage conditionnel des headers avec responsive
 * 
 * Affiche HomeHeader pour la homepage et login
 * Affiche DashboardHeader pour toutes les routes dashboard
 * Padding adaptatif selon header : mobile h-14, desktop h-16
 */
export const HeaderProvider: React.FC<HeaderProviderProps> = ({ children }) => {
  const pathname = usePathname();

  // Détermine quel header afficher selon la route
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isLoginRoute = pathname === '/login';
  const isHomePage = pathname === '/';

  const shouldShowHeader = isHomePage || isLoginRoute || isDashboardRoute;

  const renderHeader = () => {
    if (!shouldShowHeader) return null;

    if (isDashboardRoute) {
      return <DashboardHeader />;
    }

    // Pour homepage et login
    return <HomeHeader />;
  };

  return (
    <>
      {renderHeader()}
      {/* Padding top responsive : h-14 mobile, h-16 desktop */}
      <div className={shouldShowHeader ? 'pt-14 sm:pt-16' : ''}>
        {children}
      </div>
    </>
  );
};
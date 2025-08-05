// src/components/organisms/Header/Header.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/shared/useAuth';
import { Button } from '@/components/atoms/Button/Button';
import { Badge } from '@/components/atoms/Badge/Badge';
import { 
  Menu, 
  X, 
  Settings, 
  LogOut, 
  Home, 
  BarChart3, 
  Info 
} from 'lucide-react';

interface NavigationItem {
  readonly name: string;
  readonly href: string;
  readonly icon: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  { name: 'Accueil', href: '#home', icon: <Home className="w-4 h-4" /> },
  { name: 'Dashboard', href: '#dashboard', icon: <BarChart3 className="w-4 h-4" /> },
  { name: 'À propos', href: '#about', icon: <Info className="w-4 h-4" /> },
];

interface HeaderProps {
  readonly className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, isLoading, role, pharmacyName } = useAuth();

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const handleLoginClick = (): void => {
    router.push('/login');
  };

  const handleLogoutClick = async (): Promise<void> => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleHomeClick = (): void => {
    router.push('/');
  };

  const scrollToSection = (href: string): void => {
    if (window.location.pathname !== '/') {
      router.push(`/${href}`);
      return;
    }
    
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      className={`
        fixed top-0 left-0 right-0 z-50 
        bg-white/80 backdrop-blur-xl border-b border-white/20
        shadow-soft transition-all duration-300
        ${className}
      `}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container-apodata">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.button
            onClick={handleHomeClick}
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ApoData
            </h1>
          </motion.button>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <motion.button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="
                  flex items-center space-x-2 px-3 py-2 rounded-lg
                  text-gray-700 hover:text-blue-600
                  transition-colors duration-200
                "
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </motion.button>
            ))}
          </nav>

          {/* User Section Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : isAuthenticated && user?.name ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 text-sm">{user.name}</span>
                    {role === 'admin' ? (
                      <Badge variant="gradient-purple" size="xs">Admin</Badge>
                    ) : (
                      pharmacyName && (
                        <span className="text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                          {pharmacyName}
                        </span>
                      )
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  iconLeft={<Settings className="w-4 h-4" />}
                  onClick={() => console.log('Paramètres')}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  iconLeft={<LogOut className="w-4 h-4" />}
                  onClick={handleLogoutClick}
                />
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleLoginClick}
              >
                Connexion
              </Button>
            )}
          </div>

          {/* Menu Burger Mobile */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && user?.name && (
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              iconLeft={isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              onClick={toggleMobileMenu}
            />
          </div>
        </div>

        {/* Menu Mobile */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-white/20"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="py-4 space-y-2">
                {/* User Info Mobile */}
                {isAuthenticated && user?.name && (
                  <div className="px-4 py-3 bg-white/50 rounded-lg mb-4">
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

                {/* Navigation Mobile */}
                {navigationItems.map((item) => (
                  <motion.button
                    key={item.name}
                    onClick={() => scrollToSection(item.href)}
                    className="
                      w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                      text-gray-700 hover:bg-white/50 hover:text-blue-600
                      transition-colors duration-200 text-left
                    "
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </motion.button>
                ))}

                {/* Actions Mobile */}
                <div className="pt-4 border-t border-white/20 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Button
                        variant="ghost"
                        size="md"
                        fullWidth
                        iconLeft={<Settings className="w-4 h-4" />}
                        onClick={() => console.log('Paramètres')}
                      >
                        Paramètres
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        fullWidth
                        iconLeft={<LogOut className="w-4 h-4" />}
                        onClick={handleLogoutClick}
                      >
                        Déconnexion
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={handleLoginClick}
                    >
                      Connexion
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};
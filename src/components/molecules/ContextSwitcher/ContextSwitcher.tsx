// src/components/molecules/ContextSwitcher/ContextSwitcher.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Badge } from '@/components/atoms/Badge/Badge';
import { 
  ChevronDown,
  Home,
  Package,
  Building2,
  Tags
} from 'lucide-react';

interface ContextItem {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly icon: React.ReactNode;
  readonly description: string;
}

const contextItems: ContextItem[] = [
  {
    id: 'dashboard',
    name: 'Tableau de Bord',
    path: '/dashboard',
    icon: <Home className="w-4 h-4" />,
    description: 'Vue d\'ensemble des KPIs'
  },
  {
    id: 'products',
    name: 'Produits',
    path: '/produits',
    icon: <Package className="w-4 h-4" />,
    description: 'Gestion des produits'
  },
  {
    id: 'laboratories',
    name: 'Laboratoires',
    path: '/laboratoires',
    icon: <Building2 className="w-4 h-4" />,
    description: 'Gestion des laboratoires'
  },
  {
    id: 'categories',
    name: 'Catégories',
    path: '/categories',
    icon: <Tags className="w-4 h-4" />,
    description: 'Organisation par catégories'
  }
];

interface ContextSwitcherProps {
  readonly className?: string;
}

/**
 * ContextSwitcher - Badge/Dropdown de navigation contextuelle
 * 
 * Desktop: Badge cliquable avec dropdown
 * Mobile: Dropdown complet dans le burger menu
 * Responsive avec style adaptatif selon l'usage
 */
export const ContextSwitcher: React.FC<ContextSwitcherProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Déterminer le contexte actuel basé sur l'URL avec assertion de type
  const currentContext: ContextItem = contextItems.find(item => item.path === pathname) ?? contextItems[0]!;

  const handleContextChange = (item: ContextItem): void => {
    setIsOpen(false);
    if (item.path !== pathname) {
      router.push(item.path);
    }
  };

  const toggleDropdown = (): void => {
    setIsOpen(prev => !prev);
  };

  // Déterminer si on est en mode compact (badge style)
  const isCompactMode = className.includes('hidden sm:block');

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button - Style adaptatif */}
      <motion.button
        onClick={toggleDropdown}
        className={
          isCompactMode 
            ? `
                inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
                bg-green-100 text-green-800 hover:bg-green-200
                transition-colors duration-200 cursor-pointer
                border border-green-200
              `
            : `
                flex items-center space-x-2 px-3 py-2 rounded-lg
                bg-gray-50 hover:bg-gray-100 border border-gray-200
                transition-colors duration-200 min-w-[180px] sm:min-w-[200px]
              `
        }
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isCompactMode ? (
          // Mode Badge compact
          <>
            <span className="truncate">
              {currentContext.name}
            </span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </>
        ) : (
          // Mode Full dropdown
          <>
            <div className="flex items-center space-x-2 flex-1">
              <div className="text-blue-600">
                {currentContext.icon}
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {currentContext.name}
                </div>
                <div className="text-xs text-gray-500 hidden sm:block truncate">
                  {currentContext.description}
                </div>
              </div>
            </div>
            
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.div>
          </>
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay pour fermer */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            
            {/* Menu */}
            <motion.div
              className="
                absolute top-full left-0 mt-2 w-full min-w-[280px] z-20
                bg-white rounded-lg shadow-lg border border-gray-200
                py-2 overflow-hidden
              "
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {contextItems.map((item, index) => {
                const isActive = item.path === pathname;
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleContextChange(item)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3
                      text-left transition-colors duration-150
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className={`
                      p-1.5 rounded-md transition-colors duration-150
                      ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                    `}>
                      {item.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className={`
                        font-medium text-sm
                        ${isActive ? 'text-blue-700' : 'text-gray-900'}
                      `}>
                        {item.name}
                      </div>
                      <div className={`
                        text-xs
                        ${isActive ? 'text-blue-600' : 'text-gray-500'}
                      `}>
                        {item.description}
                      </div>
                    </div>
                    
                    {isActive && (
                      <Badge variant="success" size="xs">
                        Actuel
                      </Badge>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
// src/components/atoms/Notification/Notification.tsx
'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  readonly type: NotificationType;
  readonly title?: string;
  readonly message: string;
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly autoClose?: boolean;
  readonly duration?: number;
  readonly className?: string;
}

/**
 * Notification Component - Messages système en haut à droite
 * 
 * @example
 * <Notification 
 *   type="error" 
 *   title="Erreur de connexion"
 *   message="Email ou mot de passe incorrect" 
 *   visible={showNotif}
 *   onClose={() => setShowNotif(false)}
 * />
 * 
 * @example
 * <Notification 
 *   type="success" 
 *   message="Connexion réussie !" 
 *   visible={true}
 *   onClose={handleClose}
 *   autoClose
 * />
 */
export const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  visible,
  onClose,
  autoClose = true,
  duration = 5000,
  className = '',
}) => {
  useEffect(() => {
    if (visible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, duration, onClose]);

  const typeConfig = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      textColor: 'text-green-700',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600',
      titleColor: 'text-orange-800',
      textColor: 'text-orange-700',
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700',
    },
  };

  const config = typeConfig[type];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`
            fixed top-6 right-6 z-50 max-w-sm w-full
            ${config.bgColor} ${config.borderColor} border-l-4
            rounded-lg shadow-lg p-4
            ${className}
          `}
        >
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className={`flex-shrink-0 ${config.iconColor}`}>
              {config.icon}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
                  {title}
                </h4>
              )}
              <p className={`text-sm ${config.textColor} leading-relaxed`}>
                {message}
              </p>
            </div>
            
            {/* Close Button */}
            <motion.button
              type="button"
              onClick={onClose}
              className={`
                flex-shrink-0 p-1 rounded-md transition-colors duration-200
                ${config.iconColor} hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-1
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
          
          {/* Progress Bar (si autoClose) */}
          {autoClose && (
            <motion.div
              className={`absolute bottom-0 left-0 h-1 ${config.iconColor.replace('text-', 'bg-')} rounded-bl-lg`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
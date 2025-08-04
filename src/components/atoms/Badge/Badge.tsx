import React from 'react';

interface BadgeProps {
  readonly variant: 'primary' | 'success' | 'warning' | 'danger' | 'gray' | 'beta';
  readonly size?: 'sm' | 'md';
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  size = 'sm',
  children,
  className = '',
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-full
    ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
  `;

  const variants = {
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-danger-100 text-danger-800',
    gray: 'bg-gray-100 text-gray-800',
    beta: 'bg-gradient-to-r from-primary-500 to-purple-600 text-white',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
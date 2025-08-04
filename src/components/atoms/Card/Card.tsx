// src/components/atoms/Card/Card.tsx
import React from 'react';

interface CardProps {
  readonly variant?: 'default' | 'elevated' | 'outlined' | 'interactive';
  readonly padding?: 'none' | 'sm' | 'md' | 'lg';
  readonly className?: string;
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  onClick,
}) => {
  const baseStyles = `
    bg-white rounded-lg transition-all duration-200
    ${onClick ? 'cursor-pointer' : ''}
  `;

  const variants = {
    default: 'border border-gray-200',
    elevated: 'shadow-soft border border-gray-100',
    outlined: 'border-2 border-gray-300',
    interactive: `
      border border-gray-200 hover:border-gray-300
      hover:shadow-md active:scale-[0.99] interactive-hover
    `,
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const CardElement = onClick ? 'button' : 'div';

  return (
    <CardElement
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
    >
      {children}
    </CardElement>
  );
};
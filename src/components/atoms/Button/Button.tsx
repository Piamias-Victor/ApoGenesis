// src/components/atoms/Button/Button.tsx
import React from 'react';

interface ButtonProps {
  readonly variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  readonly size: 'sm' | 'md' | 'lg';
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly fullWidth?: boolean;
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
  readonly type?: 'button' | 'submit' | 'reset';
  readonly className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  onClick,
  type = 'button',
  className = '',
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-md
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    primary: `
      bg-primary-600 text-white border border-transparent
      hover:bg-primary-700 active:bg-primary-800
      focus:ring-primary-500 shadow-sm
    `,
    secondary: `
      bg-white text-gray-700 border border-gray-300
      hover:bg-gray-50 active:bg-gray-100
      focus:ring-primary-500 shadow-sm
    `,
    ghost: `
      bg-transparent text-gray-700 border border-transparent
      hover:bg-gray-100 active:bg-gray-200
      focus:ring-gray-500
    `,
    danger: `
      bg-danger-600 text-white border border-transparent
      hover:bg-danger-700 active:bg-danger-800
      focus:ring-danger-500 shadow-sm
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Chargement...
        </>
      ) : (
        children
      )}
    </button>
  );
};
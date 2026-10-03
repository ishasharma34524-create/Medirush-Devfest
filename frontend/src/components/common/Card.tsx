import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padded?: boolean;
  variant?: 'default' | 'muted' | 'accent' | 'highlight';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  padded = true,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border-slate-200/80 shadow-sm',
    muted: 'bg-slate-50/70 border-slate-200/60',
    accent: 'bg-emerald-50/50 border-emerald-100',
    highlight: 'bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border-emerald-100 shadow-sm'
  };

  const hoverStyles = hoverable
    ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300'
    : '';

  return (
    <div
      className={`rounded-2xl border ${variantStyles[variant]} ${padded ? 'p-5 sm:p-6' : ''} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

import React from 'react';
import { cn } from '@/lib/utils';

interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradient?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'pink';
  animated?: boolean;
  glow?: boolean;
}

const gradientVariants = {
  blue: 'from-blue-500/10 via-indigo-500/10 to-blue-600/10',
  purple: 'from-purple-500/10 via-pink-500/10 to-purple-600/10',
  green: 'from-green-500/10 via-emerald-500/10 to-green-600/10',
  red: 'from-red-500/10 via-pink-500/10 to-red-600/10',
  orange: 'from-orange-500/10 via-amber-500/10 to-orange-600/10',
  pink: 'from-pink-500/10 via-rose-500/10 to-pink-600/10',
};

const glowVariants = {
  blue: 'shadow-blue-500/20',
  purple: 'shadow-purple-500/20',
  green: 'shadow-green-500/20',
  red: 'shadow-red-500/20',
  orange: 'shadow-orange-500/20',
  pink: 'shadow-pink-500/20',
};

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  gradient = 'blue',
  animated = false,
  glow = false,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-slate-200/50 dark:border-slate-700/50',
        'backdrop-blur-sm bg-white/70 dark:bg-slate-800/70',
        'shadow-lg hover:shadow-xl transition-all duration-300',
        glow && glowVariants[gradient],
        className
      )}
      {...props}
    >
      {/* Animated gradient background */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r',
          gradientVariants[gradient],
          animated && 'animate-pulse'
        )}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Subtle border glow */}
      {glow && (
        <div
          className={cn(
            'absolute inset-0 rounded-xl border border-transparent',
            'bg-gradient-to-r from-transparent via-white/20 to-transparent',
            'opacity-0 hover:opacity-100 transition-opacity duration-300'
          )}
        />
      )}
    </div>
  );
};

export default GradientCard; 
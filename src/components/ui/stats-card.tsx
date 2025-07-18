import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'pink';
  className?: string;
}

const gradientVariants = {
  blue: 'from-blue-500 to-indigo-500',
  purple: 'from-purple-500 to-pink-500',
  green: 'from-green-500 to-emerald-500',
  red: 'from-red-500 to-pink-500',
  orange: 'from-orange-500 to-red-500',
  pink: 'from-pink-500 to-rose-500',
};

const bgGradientVariants = {
  blue: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
  purple: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
  green: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
  red: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
  orange: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
  pink: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
};

const borderVariants = {
  blue: 'border-blue-200 dark:border-blue-800',
  purple: 'border-purple-200 dark:border-purple-800',
  green: 'border-green-200 dark:border-green-800',
  red: 'border-red-200 dark:border-red-800',
  orange: 'border-orange-200 dark:border-orange-800',
  pink: 'border-pink-200 dark:border-pink-800',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  gradient = 'blue',
  className,
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:shadow-lg',
        'bg-gradient-to-br',
        bgGradientVariants[gradient],
        borderVariants[gradient],
        className
      )}
    >
      {/* Background gradient overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r opacity-5',
          gradientVariants[gradient]
        )}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {value}
              </p>
              {trend && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {description}
              </p>
            )}
          </div>
          
          {Icon && (
            <div
              className={cn(
                'w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center',
                gradientVariants[gradient]
              )}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </div>
      
      {/* Subtle glow effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300',
          'bg-gradient-to-r',
          gradientVariants[gradient]
        )}
      />
    </div>
  );
};

export default StatsCard; 
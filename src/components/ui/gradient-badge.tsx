import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const gradientBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg',
        secondary: 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 dark:from-slate-800 dark:to-gray-800 dark:text-slate-300',
        success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg',
        danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg',
        purple: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg',
        blue: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg',
        green: 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg',
        orange: 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg',
        pink: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
      animated: {
        true: 'animate-pulse',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      animated: false,
    },
  }
);

export interface GradientBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gradientBadgeVariants> {
  icon?: React.ReactNode;
}

const GradientBadge = React.forwardRef<HTMLDivElement, GradientBadgeProps>(
  ({ className, variant, size, animated, icon, children, ...props }, ref) => {
    return (
      <div
        className={cn(gradientBadgeVariants({ variant, size, animated, className }))}
        ref={ref}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </div>
    );
  }
);

GradientBadge.displayName = 'GradientBadge';

export { GradientBadge, gradientBadgeVariants }; 
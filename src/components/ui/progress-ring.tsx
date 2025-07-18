import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  gradient?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'pink';
  animated?: boolean;
  showValue?: boolean;
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

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  gradient = 'blue',
  animated = true,
  showValue = true,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-200 dark:text-slate-700"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-1000 ease-out',
            animated && 'animate-pulse'
          )}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={cn('text-transparent', gradientVariants[gradient])}>
              <animate
                attributeName="stop-color"
                values={`${gradientVariants[gradient].split(' ')[1]};${gradientVariants[gradient].split(' ')[3]};${gradientVariants[gradient].split(' ')[1]}`}
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" className={cn('text-transparent', gradientVariants[gradient])}>
              <animate
                attributeName="stop-color"
                values={`${gradientVariants[gradient].split(' ')[3]};${gradientVariants[gradient].split(' ')[1]};${gradientVariants[gradient].split(' ')[3]}`}
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={cn(
              'text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
              gradientVariants[gradient]
            )}>
              {Math.round(progress)}%
            </div>
          </div>
        </div>
      )}
      
      {/* Glow effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-full opacity-20 blur-md',
          'bg-gradient-to-r',
          gradientVariants[gradient]
        )}
      />
    </div>
  );
};

export default ProgressRing; 
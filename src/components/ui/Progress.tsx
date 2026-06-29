import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

// Define progress variants using class-variance-authority for better type safety and maintainability
const progressVariants = cva(
  // Base styles that apply to all progress bars
  [
    'relative overflow-hidden rounded-full bg-neutral-200',
    'dark:bg-neutral-800',
  ],
  {
    variants: {
      variant: {
        default: ['bg-neutral-200', 'dark:bg-neutral-800'],
        primary: ['bg-neutral-200', 'dark:bg-neutral-800'],
        success: ['bg-green-100', 'dark:bg-green-900/20'],
        warning: ['bg-yellow-100', 'dark:bg-yellow-900/20'],
        error: ['bg-red-100', 'dark:bg-red-900/20'],
      },
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
        xl: 'h-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const progressFillVariants = cva(
  // Base styles for the progress fill
  ['h-full transition-all duration-300 ease-in-out rounded-full'],
  {
    variants: {
      variant: {
        default: ['bg-neutral-900', 'dark:bg-neutral-50'],
        primary: ['bg-neutral-900', 'dark:bg-neutral-50'],
        success: ['bg-green-600', 'dark:bg-green-400'],
        warning: ['bg-yellow-600', 'dark:bg-yellow-400'],
        error: ['bg-red-600', 'dark:bg-red-400'],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ProgressProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  /**
   * The progress value (0-100)
   */
  value: number;
  /**
   * The maximum value (default: 100)
   */
  max?: number;
  /**
   * Whether to show the percentage text
   */
  showPercentage?: boolean;
  /**
   * Position of the percentage text
   */
  percentagePosition?: 'inside' | 'outside' | 'none';
  /**
   * Custom label to show instead of percentage
   */
  label?: string;
  /**
   * Whether to animate the progress bar
   */
  animated?: boolean;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      showPercentage = false,
      percentagePosition = 'outside',
      label,
      animated = true,
      variant = 'default',
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    // Ensure value is within bounds
    const clampedValue = Math.max(0, Math.min(value, max));
    const percentage = Math.round((clampedValue / max) * 100);

    // Determine if we should show text
    const shouldShowText = showPercentage || label;
    const displayText = label || `${percentage}%`;

    return (
      <div className='w-full'>
        {/* Outside percentage (above) */}
        {shouldShowText && percentagePosition === 'outside' && (
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              {displayText}
            </span>
          </div>
        )}

        {/* Progress bar container */}
        <div
          ref={ref}
          role='progressbar'
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || `${percentage}% complete`}
          className={cn(
            progressVariants({ variant, size }),
            'relative',
            className
          )}
          {...props}
        >
          {/* Progress fill */}
          <div
            className={cn(
              progressFillVariants({ variant }),
              animated && 'transition-all duration-300 ease-in-out',
              'relative'
            )}
            style={{ width: `${percentage}%` }}
          >
            {/* Inside percentage */}
            {shouldShowText && percentagePosition === 'inside' && (
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  'text-xs font-medium text-white dark:text-neutral-900',
                  size === 'sm' && 'text-[10px]',
                  size === 'md' && 'text-xs',
                  size === 'lg' && 'text-sm',
                  size === 'xl' && 'text-sm'
                )}
              >
                {percentage > 15 && displayText}
              </div>
            )}
          </div>

          {/* Overlay text for better readability when percentage is low */}
          {shouldShowText &&
            percentagePosition === 'inside' &&
            percentage <= 15 && (
              <div
                className={cn(
                  'absolute inset-0 flex items-center pl-2',
                  'text-xs font-medium text-neutral-700 dark:text-neutral-300',
                  size === 'sm' && 'text-[10px] pl-1',
                  size === 'md' && 'text-xs pl-2',
                  size === 'lg' && 'text-sm pl-3',
                  size === 'xl' && 'text-sm pl-4'
                )}
              >
                {displayText}
              </div>
            )}
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress, progressVariants, progressFillVariants };
export default Progress;

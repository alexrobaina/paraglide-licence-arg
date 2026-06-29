import { InputHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { Check, Minus } from 'lucide-react';

const checkboxVariants = cva(
  [
    'peer shrink-0 border border-neutral-300 shadow-sm',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-all duration-200 ease-in-out',
    'dark:border-neutral-700',
  ],
  {
    variants: {
      variant: {
        default: [
          'data-[state=checked]:bg-neutral-900 data-[state=checked]:border-neutral-900',
          'data-[state=indeterminate]:bg-neutral-900 data-[state=indeterminate]:border-neutral-900',
          'focus:ring-neutral-900',
          'dark:data-[state=checked]:bg-neutral-50 dark:data-[state=checked]:border-neutral-50',
          'dark:data-[state=indeterminate]:bg-neutral-50 dark:data-[state=indeterminate]:border-neutral-50',
          'dark:focus:ring-neutral-50',
        ],
        primary: [
          'data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600',
          'data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:border-blue-600',
          'focus:ring-blue-600',
          'dark:data-[state=checked]:bg-blue-600 dark:data-[state=checked]:border-blue-600',
          'dark:data-[state=indeterminate]:bg-blue-600 dark:data-[state=indeterminate]:border-blue-600',
          'dark:focus:ring-blue-600',
        ],
        success: [
          'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600',
          'data-[state=indeterminate]:bg-green-600 data-[state=indeterminate]:border-green-600',
          'focus:ring-green-600',
          'dark:data-[state=checked]:bg-green-600 dark:data-[state=checked]:border-green-600',
          'dark:data-[state=indeterminate]:bg-green-600 dark:data-[state=indeterminate]:border-green-600',
          'dark:focus:ring-green-600',
        ],
        warning: [
          'data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600',
          'data-[state=indeterminate]:bg-yellow-600 data-[state=indeterminate]:border-yellow-600',
          'focus:ring-yellow-600',
          'dark:data-[state=checked]:bg-yellow-600 dark:data-[state=checked]:border-yellow-600',
          'dark:data-[state=indeterminate]:bg-yellow-600 dark:data-[state=indeterminate]:border-yellow-600',
          'dark:focus:ring-yellow-600',
        ],
        error: [
          'data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600',
          'data-[state=indeterminate]:bg-red-600 data-[state=indeterminate]:border-red-600',
          'focus:ring-red-600',
          'dark:data-[state=checked]:bg-red-600 dark:data-[state=checked]:border-red-600',
          'dark:data-[state=indeterminate]:bg-red-600 dark:data-[state=indeterminate]:border-red-600',
          'dark:focus:ring-red-600',
        ],
      },
      size: {
        sm: 'h-3 w-3 rounded-sm',
        md: 'h-4 w-4 rounded-md',
        lg: 'h-5 w-5 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  /**
   * The label text for the checkbox
   */
  label?: string;
  /**
   * Description text that appears below the label
   */
  description?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Whether the checkbox is in an indeterminate state
   */
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      label,
      description,
      error,
      indeterminate = false,
      checked,
      disabled,
      ...props
    },
    ref
  ) => {
    const checkboxState = indeterminate
      ? 'indeterminate'
      : checked
        ? 'checked'
        : 'unchecked';

    const iconSize =
      size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-3 w-3' : 'h-2.5 w-2.5';

    return (
      <div className='flex items-start space-x-2'>
        <div className='relative flex items-center'>
          <input
            type='checkbox'
            className={cn(
              checkboxVariants({ variant, size }),
              'appearance-none cursor-pointer',
              disabled && 'cursor-not-allowed',
              className
            )}
            ref={ref}
            checked={checked}
            disabled={disabled}
            data-state={checkboxState}
            {...props}
          />
          {(checked || indeterminate) && (
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
              {indeterminate ? (
                <Minus
                  className={cn(
                    iconSize,
                    variant === 'default'
                      ? 'text-white dark:text-neutral-900'
                      : 'text-white'
                  )}
                />
              ) : (
                <Check
                  className={cn(
                    iconSize,
                    variant === 'default'
                      ? 'text-white dark:text-neutral-900'
                      : 'text-white'
                  )}
                />
              )}
            </div>
          )}
        </div>
        {(label || description || error) && (
          <div className='flex flex-col'>
            {label && (
              <label
                className={cn(
                  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                  'text-neutral-900 dark:text-neutral-100',
                  error && 'text-red-600 dark:text-red-400'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                className={cn(
                  'text-xs text-neutral-600 dark:text-neutral-400 mt-1',
                  error && 'text-red-600 dark:text-red-400'
                )}
              >
                {description}
              </p>
            )}
            {error && (
              <p className='text-xs text-red-600 dark:text-red-400 mt-1'>
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };
export default Checkbox;

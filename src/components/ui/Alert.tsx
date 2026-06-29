import { HTMLAttributes, ReactNode, ComponentType } from 'react';
import { cn } from '@/lib/cn';
import {
  X,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  LucideIcon,
} from 'lucide-react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
  title?: string;
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: ComponentType<any> | ReactNode;
}

const variantStyles = {
  default:
    'bg-neutral-100 border-neutral-300 text-neutral-800 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200',
  info: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700/30 dark:text-blue-400',
  success:
    'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700/30 dark:text-green-400',
  warning:
    'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700/30 dark:text-yellow-400',
  error:
    'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700/30 dark:text-red-400',
};

const variantIcons = {
  default: AlertCircle,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export default function Alert({
  variant = 'default',
  title,
  showIcon = true,
  dismissible = false,
  onDismiss,
  icon,
  children,
  className,
  ...props
}: AlertProps) {
  const IconComponent = icon
    ? typeof icon === 'function'
      ? icon
      : () => icon
    : showIcon
      ? variantIcons[variant]
      : null;

  return (
    <div
      role='alert'
      className={cn(
        'relative rounded-lg border p-4',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className='flex'>
        {IconComponent && (
          <div className='flex-shrink-0'>
            <IconComponent className='w-5 h-5' />
          </div>
        )}
        <div className={cn('flex-1', IconComponent && 'ml-3')}>
          {title && (
            <h3 className={cn('text-sm font-medium', children && 'mb-1')}>
              {title}
            </h3>
          )}
          {children && (
            <div className={cn('text-sm', title && 'mt-2')}>{children}</div>
          )}
        </div>
        {dismissible && (
          <div className='flex-shrink-0 ml-auto pl-3'>
            <button
              type='button'
              onClick={onDismiss}
              className={cn(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                variant === 'default' &&
                  'text-neutral-500 hover:bg-neutral-200 focus:ring-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:focus:ring-neutral-400',
                variant === 'info' &&
                  'text-blue-500 hover:bg-blue-200 focus:ring-blue-600 dark:text-blue-400 dark:hover:bg-blue-800/30 dark:focus:ring-blue-400',
                variant === 'success' &&
                  'text-green-500 hover:bg-green-200 focus:ring-green-600 dark:text-green-400 dark:hover:bg-green-800/30 dark:focus:ring-green-400',
                variant === 'warning' &&
                  'text-yellow-500 hover:bg-yellow-200 focus:ring-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-800/30 dark:focus:ring-yellow-400',
                variant === 'error' &&
                  'text-red-500 hover:bg-red-200 focus:ring-red-600 dark:text-red-400 dark:hover:bg-red-800/30 dark:focus:ring-red-400'
              )}
              aria-label='Dismiss alert'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

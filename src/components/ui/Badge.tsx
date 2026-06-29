import { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
}

export default function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default:
      'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    success:
      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    warning:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    outline:
      'border border-purple-500 text-purple-700 whitespace-nowrap dark:border-purple-400 dark:text-purple-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

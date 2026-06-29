'use client';
import React, { useState } from 'react';
import { cn } from '@/lib/cn';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabProps {
  items: TabItem[];
  defaultTab?: string;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

const Tab: React.FC<TabProps> = ({
  items,
  defaultTab,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  onTabChange,
  className,
}) => {
  const [activeTab, setActiveTab] = useState(
    defaultTab || items.find(item => !item.disabled)?.id || items[0]?.id
  );

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    default: {
      container: 'border-b border-neutral-200 dark:border-neutral-700',
      tab: cn(
        'border-b-2 border-transparent',
        'hover:text-neutral-700 hover:border-neutral-300',
        'dark:hover:text-neutral-300 dark:hover:border-neutral-600',
        'focus:outline-none focus:text-neutral-700 focus:border-neutral-300',
        'dark:focus:text-neutral-300 dark:focus:border-neutral-600'
      ),
      active:
        'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400',
      inactive: 'text-neutral-500 dark:text-neutral-400',
    },
    pills: {
      container: 'bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1',
      tab: cn(
        'rounded-md transition-all duration-150',
        'hover:bg-white hover:text-neutral-700 hover:shadow-sm',
        'dark:hover:bg-neutral-700 dark:hover:text-neutral-300',
        'focus:outline-none focus:bg-white focus:text-neutral-700 focus:shadow-sm',
        'dark:focus:bg-neutral-700 dark:focus:text-neutral-300'
      ),
      active:
        'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100',
      inactive: 'text-neutral-600 dark:text-neutral-400',
    },
    underline: {
      container: '',
      tab: cn(
        'border-b-2 border-transparent rounded-t-lg',
        'hover:bg-neutral-50 hover:text-neutral-700',
        'dark:hover:bg-neutral-800 dark:hover:text-neutral-300',
        'focus:outline-none focus:bg-neutral-50 focus:text-neutral-700',
        'dark:focus:bg-neutral-800 dark:focus:text-neutral-300'
      ),
      active:
        'bg-neutral-50 text-blue-600 border-blue-600 dark:bg-neutral-800 dark:text-blue-400 dark:border-blue-400',
      inactive: 'text-neutral-500 dark:text-neutral-400',
    },
  };

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const activeTabContent = items.find(item => item.id === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Headers */}
      <div
        className={cn(
          'flex',
          fullWidth ? 'w-full' : 'w-fit',
          variantClasses[variant].container
        )}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id, item.disabled)}
            disabled={item.disabled}
            className={cn(
              'flex items-center gap-2 font-medium transition-colors duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              sizeClasses[size],
              variantClasses[variant].tab,
              activeTab === item.id
                ? variantClasses[variant].active
                : variantClasses[variant].inactive,
              fullWidth && 'flex-1 justify-center',
              variant === 'pills' && index > 0 && 'ml-1'
            )}
          >
            {item.icon && (
              <span className='w-4 h-4 flex-shrink-0'>{item.icon}</span>
            )}
            <span className={cn(fullWidth ? 'text-center' : '')}>
              {item.label}
            </span>
            {item.badge && (
              <span
                className={cn(
                  'inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full',
                  activeTab === item.id
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className='mt-4'>{activeTabContent}</div>
    </div>
  );
};

export default Tab;

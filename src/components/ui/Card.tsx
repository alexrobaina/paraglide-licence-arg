import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const cardVariants = cva(
  [
    'rounded-xl border transition-all duration-200 ease-out',
    'bg-white text-neutral-900',
    'dark:bg-neutral-900 dark:text-neutral-100',
    'group',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-neutral-200/60 dark:border-neutral-800/60',
          'shadow-sm hover:shadow-md',
          'hover:border-neutral-300/80 dark:hover:border-neutral-700/80',
        ],
        elevated: [
          'border-neutral-200/50 dark:border-neutral-800/50',
          'shadow-lg hover:shadow-xl',
          'shadow-neutral-200/20 dark:shadow-neutral-900/40',
          'hover:shadow-neutral-200/30 dark:hover:shadow-neutral-900/60',
        ],
        modern: [
          'border-neutral-200/40 dark:border-neutral-800/40',
          'shadow-[0_2px_8px_0px_rgba(0,0,0,0.04)]',
          'hover:shadow-[0_8px_25px_0px_rgba(0,0,0,0.06)]',
          'dark:shadow-[0_2px_8px_0px_rgba(0,0,0,0.15)]',
          'dark:hover:shadow-[0_8px_25px_0px_rgba(0,0,0,0.25)]',
          'hover:border-neutral-300/60 dark:hover:border-neutral-700/60',
        ],
        minimal: [
          'border-transparent',
          'bg-neutral-50/50 dark:bg-neutral-800/30',
          'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
          'shadow-none',
        ],
        outline: [
          'border-neutral-300 dark:border-neutral-700',
          'shadow-none hover:shadow-sm',
          'hover:border-neutral-400 dark:hover:border-neutral-600',
          'bg-transparent hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20',
        ],
        glass: [
          'border-neutral-200/30 dark:border-neutral-700/30',
          'bg-white/80 dark:bg-neutral-900/80',
          'backdrop-blur-xl',
          'shadow-lg shadow-neutral-200/10 dark:shadow-neutral-900/20',
          'hover:bg-white/90 dark:hover:bg-neutral-900/90',
        ],
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      interactive: {
        true: [
          'cursor-pointer',
          'hover:-translate-y-0.5 hover:scale-[1.02]',
          'active:translate-y-0 active:scale-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-2',
          'focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900',
        ],
        false: '',
      },
      spacing: {
        none: 'p-0',
        tight: 'space-y-2',
        normal: 'space-y-4',
        relaxed: 'space-y-6',
        loose: 'space-y-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
      spacing: 'normal',
    },
    compoundVariants: [
      {
        interactive: true,
        variant: 'elevated',
        className:
          'hover:shadow-2xl hover:shadow-neutral-200/30 dark:hover:shadow-neutral-900/60',
      },
      {
        interactive: true,
        variant: 'modern',
        className:
          'hover:shadow-[0_12px_40px_0px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_0px_rgba(0,0,0,0.3)]',
      },
    ],
  }
);

const cardHeaderVariants = cva(['flex flex-col space-y-2'], {
  variants: {
    alignment: {
      left: 'items-start text-left',
      center: 'items-center text-center',
      right: 'items-end text-right',
    },
  },
  defaultVariants: {
    alignment: 'left',
  },
});

const cardTitleVariants = cva(
  [
    'font-semibold leading-tight tracking-tight',
    'text-neutral-900 dark:text-neutral-100',
  ],
  {
    variants: {
      size: {
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-xl',
        xl: 'text-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const cardDescriptionVariants = cva(
  ['leading-relaxed', 'text-neutral-600 dark:text-neutral-400'],
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  }
);

const cardContentVariants = cva(
  ['text-neutral-700 dark:text-neutral-300', 'leading-relaxed'],
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const cardFooterVariants = cva(['flex items-center'], {
  variants: {
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    },
    gap: {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
    },
  },
  defaultVariants: {
    justify: 'start',
    gap: 'md',
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Card content
   */
  children?: ReactNode;
  /**
   * Whether the card should be rendered as a different element
   */
  asChild?: boolean;
}

export interface CardHeaderProps
  extends VariantProps<typeof cardHeaderVariants> {
  children?: ReactNode;
  className?: string;
}

export interface CardTitleProps extends VariantProps<typeof cardTitleVariants> {
  children?: ReactNode;
  className?: string;
  /**
   * HTML heading level (h1, h2, h3, etc.)
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export interface CardDescriptionProps
  extends VariantProps<typeof cardDescriptionVariants> {
  children?: ReactNode;
  className?: string;
}

export interface CardContentProps
  extends VariantProps<typeof cardContentVariants> {
  children?: ReactNode;
  className?: string;
}

export interface CardFooterProps
  extends VariantProps<typeof cardFooterVariants> {
  children?: ReactNode;
  className?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      interactive = false,
      spacing = 'normal',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, interactive, spacing }),
          spacing !== 'none' && 'space-y-4',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, alignment = 'left', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardHeaderVariants({ alignment }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  (
    { className, size = 'md', children, as: Component = 'h3', ...props },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(cardTitleVariants({ size }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, size = 'sm', children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(cardDescriptionVariants({ size }), className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, size = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardContentVariants({ size }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, justify = 'start', gap = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardFooterVariants({ justify, gap }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
  cardHeaderVariants,
  cardTitleVariants,
  cardDescriptionVariants,
  cardContentVariants,
  cardFooterVariants,
};
export default Card;

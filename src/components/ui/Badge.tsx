'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        accent: 'border-transparent bg-accent-500 text-white hover:bg-accent-500/80',
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        gradient: 'border-transparent bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-sm',
        ghost: 'border-transparent bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
        info: 'border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100/80',
        success: 'border-transparent bg-green-100 text-green-700 hover:bg-green-100/80',
        warning: 'border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-white hover:bg-destructive/80',
        outline: 'text-foreground',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[11px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
export default Badge;


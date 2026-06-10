import type {ButtonHTMLAttributes} from 'react';
import {cn} from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

const variants = {
  primary: 'bg-primary text-primaryForeground hover:bg-primary/90',
  secondary: 'border border-border bg-panel text-foreground hover:bg-white/10',
  ghost: 'text-muted hover:bg-white/10 hover:text-foreground'
};

export function Button({className, variant = 'primary', ...props}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

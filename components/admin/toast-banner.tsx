'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastBannerProps {
  variant?: ToastVariant;
  title?: string;
  message: string;
  actions?: ReactNode;
}

const variantClasses: Record<ToastVariant, string> = {
  success:
    'border-[var(--color-primary)] bg-[color-mix(in_oklab,var(--color-primary)_12%,transparent)] text-[var(--color-primary-foreground)]',
  error:
    'border-[var(--color-destructive)] bg-[color-mix(in_oklab,var(--color-destructive)_12%,transparent)] text-[var(--color-destructive-foreground)]',
  info:
    'border-[var(--color-accent)] bg-[color-mix(in_oklab,var(--color-accent)_10%,transparent)] text-[var(--color-foreground)]',
};

export function ToastBanner({ variant = 'info', title, message, actions }: ToastBannerProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md border px-3 py-2 text-sm shadow-sm',
        variantClasses[variant],
      )}
   >
      <div className="flex-1">
        {title ? <div className="mb-0.5 text-xs font-semibold sm:text-sm">{title}</div> : null}
        <div className="text-xs sm:text-sm">{message}</div>
      </div>
      {actions ? <div className="flex items-center gap-2 text-xs sm:text-sm">{actions}</div> : null}
    </div>
  );
}

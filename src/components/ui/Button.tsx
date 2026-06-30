import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const styles: Record<Variant, string> = {
  primary: 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm hover:brightness-95',
  secondary: 'border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)] hover:bg-[var(--surface-hover)]',
  ghost: 'text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]',
  danger: 'bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-95'
};

export function Button({
  children,
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-60',
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

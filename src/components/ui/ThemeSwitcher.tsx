import { Check, Moon, Palette, SunMedium } from 'lucide-react';
import { themes, ThemeId, useTheme } from '../../app/ThemeProvider';
import { cn } from '../../lib/format';

const themeIcons = {
  modern: SunMedium,
  dark: Moon,
  pastel: Palette
};

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className={cn('grid gap-2', compact && 'grid-cols-3')} aria-label="Theme selection">
      {!compact && <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Theme</legend>}
      {(Object.entries(themes) as Array<[ThemeId, (typeof themes)[ThemeId]]>).map(([id, item]) => (
        <ThemeButton key={id} id={id} item={item} active={theme === id} compact={compact} onClick={() => setTheme(id)} />
      ))}
    </fieldset>
  );
}

function ThemeButton({ id, item, active, compact, onClick }: { id: ThemeId; item: (typeof themes)[ThemeId]; active: boolean; compact: boolean; onClick: () => void }) {
  const Icon = themeIcons[id];

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'grid size-10 place-items-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
          active ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]' : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--text)]'
        )}
        aria-label={item.label}
        aria-pressed={active}
        title={item.label}
      >
        <Icon size={17} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
        active ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--surface-muted)]'
      )}
      aria-pressed={active}
    >
      <span className="grid size-8 place-items-center rounded-lg bg-[var(--card)] text-[var(--accent)]">
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[var(--text)]">{item.label}</span>
        <span className="block truncate text-xs text-[var(--muted)]">{item.description}</span>
      </span>
      <span className="grid size-5 place-items-center rounded-full border border-[var(--accent)] text-[var(--accent)]">
        {active && <Check size={13} strokeWidth={3} />}
      </span>
    </button>
  );
}

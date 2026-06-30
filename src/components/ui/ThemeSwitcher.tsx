import { Check, LayoutDashboard, Leaf, Moon, Palette, SunMedium } from 'lucide-react';
import { themes, ThemeId, ThemeMode, useTheme } from '../../app/ThemeProvider';
import { cn } from '../../lib/format';

const themeIcons = {
  modern: LayoutDashboard,
  dark: Leaf,
  pastel: Palette
};

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, themeModes, setTheme, setThemeMode, toggleThemeMode } = useTheme();

  return (
    <fieldset className={cn('grid gap-2', compact && 'grid-cols-3')} aria-label="Theme selection">
      {!compact && <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Theme</legend>}
      {(Object.entries(themes) as Array<[ThemeId, (typeof themes)[ThemeId]]>).map(([id, item]) => (
        <ThemeButton
          key={id}
          id={id}
          item={item}
          active={theme === id}
          compact={compact}
          mode={themeModes[id]}
          onClick={() => {
            if (theme === id) {
              toggleThemeMode(id);
              return;
            }
            setTheme(id);
          }}
          onModeChange={(mode) => setThemeMode(id, mode)}
        />
      ))}
    </fieldset>
  );
}

function ThemeButton({
  id,
  item,
  active,
  compact,
  mode,
  onClick,
  onModeChange
}: {
  id: ThemeId;
  item: (typeof themes)[ThemeId];
  active: boolean;
  compact: boolean;
  mode: ThemeMode;
  onClick: () => void;
  onModeChange: (mode: ThemeMode) => void;
}) {
  const Icon = themeIcons[id];

  if (compact) {
    const CompactIcon = active && mode === 'night' ? Moon : Icon;

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
        title={`${item.label}: ${mode === 'day' ? 'Day' : 'Night'}`}
      >
        <CompactIcon size={17} />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border transition',
        active ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--surface-muted)]'
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
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
      {active && (
        <div className="mx-3 mb-3 grid grid-cols-2 rounded-lg bg-[var(--card)] p-1">
          <button
            type="button"
            onClick={() => onModeChange('day')}
            className={cn(
              'flex min-h-9 items-center justify-center gap-2 rounded-md text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
              mode === 'day' ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'text-[var(--muted)] hover:bg-[var(--surface-muted)]'
            )}
            aria-pressed={mode === 'day'}
          >
            <SunMedium size={14} />
            Day
          </button>
          <button
            type="button"
            onClick={() => onModeChange('night')}
            className={cn(
              'flex min-h-9 items-center justify-center gap-2 rounded-md text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
              mode === 'night' ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'text-[var(--muted)] hover:bg-[var(--surface-muted)]'
            )}
            aria-pressed={mode === 'night'}
          >
            <Moon size={14} />
            Night
          </button>
        </div>
      )}
    </div>
  );
}

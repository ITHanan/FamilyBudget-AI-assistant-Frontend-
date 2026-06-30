import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeId = 'modern' | 'dark' | 'pastel';
export type ThemeMode = 'day' | 'night';

export const themes: Record<ThemeId, { label: string; description: string }> = {
  modern: { label: 'Modern Minimal', description: 'Clear and focused everyday view' },
  dark: { label: 'Emerald Focus', description: 'Fresh green finance view' },
  pastel: { label: 'Soft Pastel', description: 'Purple day and night' }
};

interface ThemeContextValue {
  theme: ThemeId;
  themeModes: Record<ThemeId, ThemeMode>;
  setTheme: (theme: ThemeId) => void;
  setThemeMode: (theme: ThemeId, mode: ThemeMode) => void;
  toggleThemeMode: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const storageKey = 'familybudgetai_theme';
const themeModesStorageKey = 'familybudgetai_theme_modes';

function readTheme(): ThemeId {
  const value = localStorage.getItem(storageKey);
  return value === 'dark' || value === 'pastel' || value === 'modern' ? value : 'modern';
}

function readThemeModes(): Record<ThemeId, ThemeMode> {
  const fallback: Record<ThemeId, ThemeMode> = {
    modern: 'day',
    dark: 'night',
    pastel: 'day'
  };

  try {
    const value = localStorage.getItem(themeModesStorageKey);
    if (!value) {
      return fallback;
    }

    const parsed = JSON.parse(value) as Partial<Record<ThemeId, ThemeMode>>;
    return {
      modern: parsed.modern === 'night' || parsed.modern === 'day' ? parsed.modern : fallback.modern,
      dark: parsed.dark === 'night' || parsed.dark === 'day' ? parsed.dark : fallback.dark,
      pastel: parsed.pastel === 'night' || parsed.pastel === 'day' ? parsed.pastel : fallback.pastel
    };
  } catch {
    return fallback;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(readTheme);
  const [themeModes, setThemeModes] = useState<Record<ThemeId, ThemeMode>>(readThemeModes);

  useEffect(() => {
    document.documentElement.dataset.theme = `${theme}-${themeModes[theme]}`;
    localStorage.setItem(storageKey, theme);
    localStorage.setItem(themeModesStorageKey, JSON.stringify(themeModes));
  }, [theme, themeModes]);

  const value = useMemo(
    () => ({
      theme,
      themeModes,
      setTheme: setThemeState,
      setThemeMode: (themeId: ThemeId, mode: ThemeMode) =>
        setThemeModes((current) => ({
          ...current,
          [themeId]: mode
        })),
      toggleThemeMode: (themeId: ThemeId) =>
        setThemeModes((current) => ({
          ...current,
          [themeId]: current[themeId] === 'day' ? 'night' : 'day'
        }))
    }),
    [theme, themeModes]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}

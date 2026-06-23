import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeId = 'modern' | 'dark' | 'pastel';

export const themes: Record<ThemeId, { label: string; description: string }> = {
  modern: { label: 'Modern Minimal', description: 'Clean fintech workspace' },
  dark: { label: 'Dark Mode', description: 'Premium AI dashboard' },
  pastel: { label: 'Soft Pastel', description: 'Calm family planning' }
};

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const storageKey = 'familybudgetai_theme';

function readTheme(): ThemeId {
  const value = localStorage.getItem(storageKey);
  return value === 'dark' || value === 'pastel' || value === 'modern' ? value : 'modern';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(storageKey, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeState
    }),
    [theme]
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

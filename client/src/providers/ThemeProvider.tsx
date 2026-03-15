import { useLayoutEffect, useMemo, type ReactNode } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { getUIThemeOption } from '../constants/themes';

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { uiTheme, themeMode, setUITheme } = useThemeStore((state) => ({
    uiTheme: state.uiTheme,
    themeMode: state.themeMode,
    setUITheme: state.setUITheme
  }));

  const safeThemeOption = useMemo(() => getUIThemeOption(uiTheme), [uiTheme]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const desiredThemeId = safeThemeOption.id;

    if (desiredThemeId !== uiTheme) {
      setUITheme(desiredThemeId);
    }

    root.dataset.theme = desiredThemeId;
    root.dataset.themeMode = themeMode;

    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [safeThemeOption, setUITheme, themeMode, uiTheme]);

  return <>{children}</>;
};

export default ThemeProvider;

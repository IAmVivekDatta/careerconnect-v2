import { useLayoutEffect, useMemo, type ReactNode } from "react";
import { useThemeStore } from "../store/useThemeStore";
import { getUIThemeOption } from "../constants/themes";

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { uiTheme, setUITheme } = useThemeStore((state) => ({
    uiTheme: state.uiTheme,
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

    if (safeThemeOption.mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [safeThemeOption, setUITheme, uiTheme]);

  return <>{children}</>;
};

export default ThemeProvider;

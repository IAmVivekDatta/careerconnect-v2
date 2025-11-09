import { useLayoutEffect, useMemo, type ReactNode } from "react";
import { useThemeStore } from "../store/useThemeStore";
import { getCodeThemeOption, getUIThemeOption } from "../constants/themes";

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { uiTheme, setUITheme, codeTheme, setCodeTheme } = useThemeStore((state) => ({
    uiTheme: state.uiTheme,
    setUITheme: state.setUITheme,
    codeTheme: state.codeTheme,
    setCodeTheme: state.setCodeTheme
  }));

  const safeThemeOption = useMemo(() => getUIThemeOption(uiTheme), [uiTheme]);
  const safeCodeThemeOption = useMemo(() => getCodeThemeOption(codeTheme), [codeTheme]);

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

  useLayoutEffect(() => {
    if (safeCodeThemeOption.id !== codeTheme) {
      setCodeTheme(safeCodeThemeOption.id);
    }
  }, [codeTheme, safeCodeThemeOption, setCodeTheme]);

  return <>{children}</>;
};

export default ThemeProvider;

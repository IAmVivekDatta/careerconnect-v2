import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UITheme = "cyber" | "midnight" | "ocean" | "light";
export type CodeTheme = "atomDark" | "dracula" | "duotoneSea" | "oneLight";

interface ThemeState {
  uiTheme: UITheme;
  codeTheme: CodeTheme;
  setUITheme: (theme: UITheme) => void;
  setCodeTheme: (theme: CodeTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      uiTheme: "cyber",
      codeTheme: "atomDark",
      setUITheme: (uiTheme) => set({ uiTheme }),
      setCodeTheme: (codeTheme) => set({ codeTheme })
    }),
    { name: "careerconnect-theme" }
  )
);

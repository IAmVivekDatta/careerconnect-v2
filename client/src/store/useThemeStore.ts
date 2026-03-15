import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UITheme = 'whatsapp' | 'mono' | 'deepdark' | 'vvit';
export type ThemeMode = 'light' | 'dark';
export type CodeTheme = 'atomDark' | 'dracula' | 'duotoneSea' | 'oneLight';

interface ThemeState {
  uiTheme: UITheme;
  themeMode: ThemeMode;
  codeTheme: CodeTheme;
  setUITheme: (theme: UITheme) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setCodeTheme: (theme: CodeTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      uiTheme: 'whatsapp',
      themeMode: 'light',
      codeTheme: 'atomDark',
      setUITheme: (uiTheme) => set({ uiTheme }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setCodeTheme: (codeTheme) => set({ codeTheme })
    }),
    { name: 'careerconnect-theme' }
  )
);

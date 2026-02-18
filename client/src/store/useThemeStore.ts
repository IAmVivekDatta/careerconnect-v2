import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UITheme =
  | "whatsapp"
  | "whatsappDark"
  | "telegram"
  | "linkedinLight"
  | "linkedinDark"
  | "vvitu"
  | "light";

interface ThemeState {
  uiTheme: UITheme;
  setUITheme: (theme: UITheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      uiTheme: "whatsapp",
      setUITheme: (uiTheme) => set({ uiTheme })
    }),
    { name: "careerconnect-theme" }
  )
);

import type { CodeTheme, UITheme } from "../store/useThemeStore";

export interface UIThemeOption {
  id: UITheme;
  label: string;
  description: string;
  mode: "dark" | "light";
  preview: {
    background: string;
    surface: string;
    accent: string;
  };
}

export interface CodeThemeOption {
  id: CodeTheme;
  label: string;
  description: string;
  previewCode: string;
}

export const UI_THEME_OPTIONS: UIThemeOption[] = [
  {
    id: "cyber",
    label: "Cyber Dark",
    description: "Neon gradients on charcoal — the original CareerConnect vibe.",
    mode: "dark",
    preview: {
      background: "linear-gradient(135deg, #050505, #0f172a)",
      surface: "linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(17, 24, 39, 0.6))",
      accent: "linear-gradient(135deg, #00f5ff, #ff00d6)"
    }
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "Deep navy panels with glassy cyan highlights.",
    mode: "dark",
    preview: {
      background: "linear-gradient(135deg, #040a1a, #0f172a)",
      surface: "linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 64, 175, 0.65))",
      accent: "linear-gradient(135deg, #38bdf8, #6366f1)"
    }
  },
  {
    id: "ocean",
    label: "Ocean Mist",
    description: "Teal waves with soft aqua glows and gentle contrast.",
    mode: "dark",
    preview: {
      background: "linear-gradient(135deg, #031520, #0f3b46)",
      surface: "linear-gradient(135deg, rgba(12, 32, 40, 0.92), rgba(14, 116, 144, 0.55))",
      accent: "linear-gradient(135deg, #34d399, #22d3ee)"
    }
  },
  {
    id: "light",
    label: "Daylight",
    description: "Crisp whites, soft shadows, and slate typography.",
    mode: "light",
    preview: {
      background: "linear-gradient(135deg, #f8fafc, #eef2ff)",
      surface: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(226, 232, 240, 0.6))",
      accent: "linear-gradient(135deg, #38bdf8, #f472b6)"
    }
  }
];

export const CODE_THEME_OPTIONS: CodeThemeOption[] = [
  {
    id: "atomDark",
    label: "Atom Dark",
    description: "High-contrast dark syntax with teal accents.",
    previewCode: "const status = 'online';"
  },
  {
    id: "dracula",
    label: "Dracula",
    description: "Vibrant purples and greens on a deep background.",
    previewCode: "function ping() { return 'pong'; }"
  },
  {
    id: "duotoneSea",
    label: "Duotone Sea",
    description: "Seafoam blue keywords with warm string tones.",
    previewCode: "const waves = [1, 2, 3].map(Math.sqrt);"
  },
  {
    id: "oneLight",
    label: "One Light",
    description: "Lightweight theme ideal for bright environments.",
    previewCode: "export const theme = 'one-light';"
  }
];

export const getUIThemeOption = (id: UITheme) =>
  UI_THEME_OPTIONS.find((option) => option.id === id) ?? UI_THEME_OPTIONS[0];

export const getCodeThemeOption = (id: CodeTheme) =>
  CODE_THEME_OPTIONS.find((option) => option.id === id) ?? CODE_THEME_OPTIONS[0];

import type { UITheme } from "../store/useThemeStore";

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

export const UI_THEME_OPTIONS: UIThemeOption[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Clean light interface with green accents inspired by WhatsApp.",
    mode: "light",
    preview: {
      background: "linear-gradient(135deg, #f0faf4, #dff5e7)",
      surface: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(214, 242, 227, 0.65))",
      accent: "linear-gradient(135deg, #25d366, #0bb07b)"
    }
  },
  {
    id: "whatsappDark",
    label: "WhatsApp Dark",
    description: "Dark interface with deep greens, charcoal panels, and subtle bubble contrast inspired by WhatsApp.",
    mode: "dark",
    preview: {
      background: "linear-gradient(135deg, #0b141a, #182b21)",
      surface: "linear-gradient(135deg, rgba(15, 27, 22, 0.95), rgba(25, 40, 33, 0.75))",
      accent: "linear-gradient(135deg, #25d366, #128c7e)"
    }
  },
  {
    id: "telegram",
    label: "Telegram",
    description: "Minimal blue-and-white theme inspired by Telegram’s modern UI.",
    mode: "light",
    preview: {
      background: "linear-gradient(135deg, #f3f7fb, #e4ecf7)",
      surface: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(224, 234, 248, 0.65))",
      accent: "linear-gradient(135deg, #2a9df4, #6fb4ff)"
    }
  },
  {
    id: "linkedinLight",
    label: "LinkedIn (White)",
    description: "Clean professional white interface with LinkedIn blue accents and calm grays.",
    mode: "light",
    preview: {
      background: "linear-gradient(135deg, #f5f7fa, #e9edf2)",
      surface: "linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(235, 240, 248, 0.7))",
      accent: "linear-gradient(135deg, #0a66c2, #0b74d4)"
    }
  },
  {
    id: "linkedinDark",
    label: "LinkedIn (Dark)",
    description: "Professional dark mode with charcoal backgrounds, muted blues, and high-contrast typography inspired by LinkedIn.",
    mode: "dark",
    preview: {
      background: "linear-gradient(135deg, #0f1720, #1b2430)",
      surface: "linear-gradient(135deg, rgba(20, 28, 40, 0.95), rgba(26, 38, 52, 0.8))",
      accent: "linear-gradient(135deg, #3f8fdc, #78b7ff)"
    }
  },
  {
    id: "vvitu",
    label: "VVITU Guntur",
    description: "College palette pairing VVITU’s coral primary with bright panels for an academic feel.",
    mode: "light",
    preview: {
      background: "linear-gradient(135deg, #fff8f6, #ffe9e3)",
      surface: "linear-gradient(135deg, rgba(255, 255, 255, 0.97), rgba(255, 237, 232, 0.7))",
      accent: "linear-gradient(135deg, #f0806c, #ffb39f)"
    }
  },
  {
    id: "light",
    label: "Daybreak",
    description: "Soft grayscale daylight counterpart to the night palette.",
    mode: "light",
    preview: {
      background: "linear-gradient(135deg, #f2f4f8, #e3e9f5)",
      surface: "linear-gradient(135deg, rgba(250, 252, 255, 0.95), rgba(224, 232, 245, 0.65))",
      accent: "linear-gradient(135deg, #315ecc, #7ea0f5)"
    }
  }
];

export const getUIThemeOption = (id: UITheme) =>
  UI_THEME_OPTIONS.find((option) => option.id === id) ?? UI_THEME_OPTIONS[0];

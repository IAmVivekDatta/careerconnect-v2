import type { UITheme } from '../store/useThemeStore';

export interface UIThemeOption {
  id: UITheme;
  label: string;
  description: string;
  mode: 'dark' | 'light';
  preview: {
    background: string;
    surface: string;
    accent: string;
  };
}

export const UI_THEME_OPTIONS: UIThemeOption[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Friendly green messaging surfaces with soft contrast.',
    mode: 'light',
    preview: {
      background: 'linear-gradient(135deg, #ece5dd, #f5f2ee)',
      surface:
        'linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(241, 247, 244, 0.82))',
      accent: 'linear-gradient(135deg, #25d366, #128c7e)'
    }
  },
  {
    id: 'mono',
    label: 'Mono',
    description: 'Monochrome minimal theme with sharp readability.',
    mode: 'light',
    preview: {
      background: 'linear-gradient(135deg, #ffffff, #f7f7f7)',
      surface:
        'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 245, 245, 0.82))',
      accent: 'linear-gradient(135deg, #111111, #5f5f5f)'
    }
  },
  {
    id: 'deepdark',
    label: 'DeepDark',
    description: 'Modern developer dark UI with emerald and teal accents.',
    mode: 'dark',
    preview: {
      background: 'linear-gradient(135deg, #0f0f0f, #151515)',
      surface:
        'linear-gradient(135deg, rgba(32, 32, 32, 0.95), rgba(20, 20, 20, 0.82))',
      accent: 'linear-gradient(135deg, #4caf50, #00adb5)'
    }
  },
  {
    id: 'vvit',
    label: 'VVIT',
    description:
      'Signature academic palette inspired by VVIT branding with modern SaaS polish.',
    mode: 'light',
    preview: {
      background: 'linear-gradient(135deg, #f3f6fb, #e9f0f8)',
      surface:
        'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(236, 242, 248, 0.84))',
      accent: 'linear-gradient(135deg, #0c5cad, #c4912f)'
    }
  }
];

export const getUIThemeOption = (id: UITheme) =>
  UI_THEME_OPTIONS.find((option) => option.id === id) ?? UI_THEME_OPTIONS[0];

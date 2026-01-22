type ComponentType<T = unknown> = import('react').ComponentType<T>;
type CSSProperties = import('react').CSSProperties;
type ReactNode = import('react').ReactNode;

interface PrismLanguageDefinition {
  [key: string]: unknown;
}

interface PrismHighlighterProps {
  language?: string;
  style?: Record<string, unknown>;
  wrapLines?: boolean;
  customStyle?: CSSProperties;
  className?: string;
  children?: ReactNode;
}

type PrismLightComponent = ComponentType<PrismHighlighterProps> & {
  registerLanguage: (name: string, definition: PrismLanguageDefinition) => void;
};

declare module 'react-syntax-highlighter' {
  const Highlighter: ComponentType<PrismHighlighterProps>;
  export type { PrismHighlighterProps };
  export default Highlighter;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/*' {
  const language: PrismLanguageDefinition;
  export default language;
}

declare module 'react-syntax-highlighter/dist/esm/prism-light' {
  const PrismLight: PrismLightComponent;
  export default PrismLight;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism/*' {
  const theme: Record<string, unknown>;
  export default theme;
}

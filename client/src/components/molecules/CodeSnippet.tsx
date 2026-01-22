import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ComponentType, ReactNode } from 'react';
import { useThemeStore } from '../../store/useThemeStore';

interface CodeSnippetProps {
  code: string;
  language?: string;
  className?: string;
}

const supportedLanguages = [
  'javascript',
  'typescript',
  'tsx',
  'jsx',
  'json',
  'bash',
  'css',
  'markup',
  'markdown',
  'python',
  'java',
  'c',
  'cpp'
] as const;

type SupportedLanguage = (typeof supportedLanguages)[number];

type CodeStyle = Record<string, unknown>;
type PrismLanguageDefinition = Record<string, unknown>;
type LanguageModule = { default: PrismLanguageDefinition };

interface HighlighterProps {
  language?: SupportedLanguage;
  style: CodeStyle;
  wrapLines?: boolean;
  customStyle?: CSSProperties;
  className?: string;
  children: ReactNode;
}

type PrismLightComponent = ComponentType<HighlighterProps> & {
  registerLanguage: (
    language: string,
    definition: PrismLanguageDefinition
  ) => void;
};

const registeredLanguages = new Set<SupportedLanguage>();
let prismLightPromise: Promise<PrismLightComponent> | null = null;

const languageImports: Record<
  SupportedLanguage,
  () => Promise<LanguageModule>
> = {
  javascript: () =>
    import('react-syntax-highlighter/dist/esm/languages/prism/javascript'),
  typescript: () =>
    import('react-syntax-highlighter/dist/esm/languages/prism/typescript'),
  tsx: () => import('react-syntax-highlighter/dist/esm/languages/prism/tsx'),
  jsx: () => import('react-syntax-highlighter/dist/esm/languages/prism/jsx'),
  json: () => import('react-syntax-highlighter/dist/esm/languages/prism/json'),
  bash: () => import('react-syntax-highlighter/dist/esm/languages/prism/bash'),
  css: () => import('react-syntax-highlighter/dist/esm/languages/prism/css'),
  markup: () =>
    import('react-syntax-highlighter/dist/esm/languages/prism/markup'),
  markdown: () =>
    import('react-syntax-highlighter/dist/esm/languages/prism/markdown'),
  python: () =>
    import('react-syntax-highlighter/dist/esm/languages/prism/python'),
  java: () => import('react-syntax-highlighter/dist/esm/languages/prism/java'),
  c: () => import('react-syntax-highlighter/dist/esm/languages/prism/c'),
  cpp: () => import('react-syntax-highlighter/dist/esm/languages/prism/cpp')
};

const aliasMap: Record<string, SupportedLanguage> = {
  js: 'javascript',
  ts: 'typescript',
  html: 'markup',
  xml: 'markup',
  md: 'markdown',
  sh: 'bash',
  shell: 'bash',
  py: 'python',
  cplusplus: 'cpp',
  'c++': 'cpp'
};

const codeThemeImports: Record<string, () => Promise<{ default: CodeStyle }>> =
  {
    atomDark: () =>
      import('react-syntax-highlighter/dist/esm/styles/prism/atom-dark'),
    dracula: () =>
      import('react-syntax-highlighter/dist/esm/styles/prism/dracula'),
    duotoneSea: () =>
      import('react-syntax-highlighter/dist/esm/styles/prism/duotone-sea'),
    oneLight: () =>
      import('react-syntax-highlighter/dist/esm/styles/prism/one-light')
  } as const;

const loadPrismLight = async (): Promise<PrismLightComponent> => {
  if (!prismLightPromise) {
    prismLightPromise =
      import('react-syntax-highlighter/dist/esm/prism-light').then(
        async (module) => {
          const PrismLight = module.default as PrismLightComponent;

          const languageModules = await Promise.all(
            supportedLanguages.map(async (language) => {
              const mod = await languageImports[language]();
              return { language, definition: mod.default };
            })
          );

          languageModules.forEach(({ language, definition }) => {
            if (!registeredLanguages.has(language)) {
              PrismLight.registerLanguage(language, definition);
              registeredLanguages.add(language);
            }
          });

          return PrismLight;
        }
      );
  }

  return prismLightPromise;
};

const mapLanguage = (value?: string) => {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (aliasMap[normalized]) {
    return aliasMap[normalized];
  }

  if (supportedLanguages.includes(normalized as SupportedLanguage)) {
    return normalized as SupportedLanguage;
  }

  return undefined;
};

const CodeSnippet = ({ code, language, className }: CodeSnippetProps) => {
  const codeTheme = useThemeStore((state) => state.codeTheme);
  const [Highlighter, setHighlighter] = useState<PrismLightComponent | null>(
    null
  );
  const [style, setStyle] = useState<CodeStyle | null>(null);

  useEffect(() => {
    let isMounted = true;

    loadPrismLight().then((PrismLight) => {
      if (isMounted) {
        setHighlighter(() => PrismLight);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadStyle = codeThemeImports[codeTheme] ?? codeThemeImports.atomDark;
    loadStyle().then((module) => {
      if (isMounted) {
        setStyle(module.default);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [codeTheme]);

  const resolvedLanguage = useMemo<SupportedLanguage | undefined>(
    () => mapLanguage(language),
    [language]
  );

  if (!Highlighter || !style) {
    return (
      <div className="rounded-lg border border-white/10 bg-surface/80 p-4 text-xs text-white/60">
        Loading code snippet…
      </div>
    );
  }

  return (
    <Highlighter
      language={resolvedLanguage}
      style={style}
      wrapLines
      customStyle={{ margin: 0, padding: '1rem', fontSize: '0.85rem' }}
      className={className}
    >
      {code}
    </Highlighter>
  );
};

export default CodeSnippet;

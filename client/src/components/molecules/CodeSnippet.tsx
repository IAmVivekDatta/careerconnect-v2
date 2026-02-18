import { useEffect, useMemo, useState } from "react";
import { useThemeStore } from "../../store/useThemeStore";

interface CodeSnippetProps {
  code: string;
  language?: string;
  className?: string;
}

const registeredLanguages = new Set<string>();
let prismLightPromise: Promise<any> | null = null;

const supportedLanguages = [
  "javascript",
  "typescript",
  "tsx",
  "jsx",
  "json",
  "bash",
  "css",
  "markup",
  "markdown",
  "python",
  "java",
  "c",
  "cpp"
] as const;

const languageImports: Record<(typeof supportedLanguages)[number], () => Promise<{ default: unknown }>> = {
  javascript: () => import("react-syntax-highlighter/dist/esm/languages/prism/javascript"),
  typescript: () => import("react-syntax-highlighter/dist/esm/languages/prism/typescript"),
  tsx: () => import("react-syntax-highlighter/dist/esm/languages/prism/tsx"),
  jsx: () => import("react-syntax-highlighter/dist/esm/languages/prism/jsx"),
  json: () => import("react-syntax-highlighter/dist/esm/languages/prism/json"),
  bash: () => import("react-syntax-highlighter/dist/esm/languages/prism/bash"),
  css: () => import("react-syntax-highlighter/dist/esm/languages/prism/css"),
  markup: () => import("react-syntax-highlighter/dist/esm/languages/prism/markup"),
  markdown: () => import("react-syntax-highlighter/dist/esm/languages/prism/markdown"),
  python: () => import("react-syntax-highlighter/dist/esm/languages/prism/python"),
  java: () => import("react-syntax-highlighter/dist/esm/languages/prism/java"),
  c: () => import("react-syntax-highlighter/dist/esm/languages/prism/c"),
  cpp: () => import("react-syntax-highlighter/dist/esm/languages/prism/cpp")
};

const aliasMap: Record<string, (typeof supportedLanguages)[number]> = {
  js: "javascript",
  ts: "typescript",
  html: "markup",
  xml: "markup",
  md: "markdown",
  sh: "bash",
  shell: "bash",
  py: "python",
  cplusplus: "cpp",
  "c++": "cpp"
};

const codeThemeImports = {
  light: () => import("react-syntax-highlighter/dist/esm/styles/prism/material-light"),
  dark: () => import("react-syntax-highlighter/dist/esm/styles/prism/material-dark")
} as const;

type CodeStyleKey = keyof typeof codeThemeImports;
const UI_THEME_TO_CODE_STYLE: Record<string, CodeStyleKey> = {
  whatsapp: "light",
  telegram: "light",
  light: "light"
};

const loadPrismLight = async () => {
  if (!prismLightPromise) {
    prismLightPromise = import("react-syntax-highlighter/dist/esm/prism-light").then(async (module) => {
      const PrismLight = module.default;

      const languageModules = await Promise.all(
        supportedLanguages.map(async (language) => {
          const mod = await languageImports[language]();
          return { language, definition: mod.default as Parameters<typeof PrismLight.registerLanguage>[1] };
        })
      );

      languageModules.forEach(({ language, definition }) => {
        if (!registeredLanguages.has(language)) {
          PrismLight.registerLanguage(language, definition);
          registeredLanguages.add(language);
        }
      });

      return PrismLight;
    });
  }

  return prismLightPromise;
};

const mapLanguage = (value?: string) => {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (aliasMap[normalized]) {
    return aliasMap[normalized];
  }

  if (supportedLanguages.includes(normalized as (typeof supportedLanguages)[number])) {
    return normalized as (typeof supportedLanguages)[number];
  }

  return undefined;
};

const CodeSnippet = ({ code, language, className }: CodeSnippetProps) => {
  const uiTheme = useThemeStore((state) => state.uiTheme);
  const [Highlighter, setHighlighter] = useState<any | null>(null);
  const [style, setStyle] = useState<Record<string, unknown> | null>(null);

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

    const codeTheme = UI_THEME_TO_CODE_STYLE[uiTheme] ?? "light";
    const loadStyle = codeThemeImports[codeTheme];
    loadStyle().then((module) => {
      if (isMounted) {
        setStyle(module.default as Record<string, unknown>);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [uiTheme]);

  const resolvedLanguage = useMemo(() => mapLanguage(language), [language]);

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
      customStyle={{ margin: 0, padding: "1rem", fontSize: "0.85rem" }}
      className={className}
    >
      {code}
    </Highlighter>
  );
};

export default CodeSnippet;

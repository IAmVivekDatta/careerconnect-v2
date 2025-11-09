import { useEffect, useRef, useState } from "react";
import { ChevronDown, Palette } from "lucide-react";
import { useThemeStore } from "../../store/useThemeStore";
import {
  CODE_THEME_OPTIONS,
  UI_THEME_OPTIONS,
  getCodeThemeOption,
  getUIThemeOption
} from "../../constants/themes";

const ThemeSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { uiTheme, codeTheme, setUITheme, setCodeTheme } = useThemeStore((state) => ({
    uiTheme: state.uiTheme,
    codeTheme: state.codeTheme,
    setUITheme: state.setUITheme,
    setCodeTheme: state.setCodeTheme
  }));

  useEffect(() => {
    if (!isOpen) return;

    const handleClickAway = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickAway);
    return () => window.removeEventListener("mousedown", handleClickAway);
  }, [isOpen]);

  const currentUITheme = getUIThemeOption(uiTheme);
  const currentCodeTheme = getCodeThemeOption(codeTheme);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:border-neonCyan/40 hover:text-white"
        aria-expanded={isOpen}
      >
        <Palette className="h-4 w-4" />
        Appearance
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-40 w-[360px] rounded-2xl border border-white/10 bg-surface/90 p-4 shadow-xl shadow-black/40 backdrop-blur">
          <header className="mb-3 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Interface</p>
            <p className="text-sm text-white/70">{currentUITheme.label} · {currentUITheme.mode === "dark" ? "Dark" : "Light"}</p>
          </header>

          <div className="grid gap-3">
            {UI_THEME_OPTIONS.map((option) => {
              const isActive = option.id === uiTheme;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setUITheme(option.id);
                  }}
                  className={`group flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                    isActive
                      ? "border-neonCyan/70 bg-neonCyan/10"
                      : "border-white/10 bg-white/5 hover:border-neonCyan/40"
                  }`}
                >
                  <div className="relative h-12 w-16 overflow-hidden rounded-lg">
                    <div className="absolute inset-0" style={{ background: option.preview.background }} />
                    <div
                      className="absolute inset-x-2 top-2 h-4 rounded-md opacity-90"
                      style={{ background: option.preview.surface }}
                    />
                    <div
                      className="absolute inset-x-3 bottom-2 h-1.5 rounded-full"
                      style={{ background: option.preview.accent }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-white/80"}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-white/60">{option.description}</p>
                  </div>
                  {isActive && (
                    <span className="rounded-full bg-neonCyan px-2 py-0.5 text-[10px] font-semibold text-black">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Code blocks</p>
            <p className="text-xs text-white/60">{currentCodeTheme.label}</p>
          </div>

          <div className="mt-2 grid gap-2">
            {CODE_THEME_OPTIONS.map((option) => {
              const isActive = option.id === codeTheme;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setCodeTheme(option.id)}
                  className={`rounded-lg border px-3 py-2 text-left transition ${
                    isActive ? "border-neonMagenta/70 bg-neonMagenta/10" : "border-white/10 bg-white/5 hover:border-neonMagenta/40"
                  }`}
                >
                  <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-white/80"}`}>
                    {option.label}
                  </p>
                  <p className="text-xs text-white/60">{option.description}</p>
                  <pre className="mt-2 rounded-md bg-surface/80 p-2 text-[11px] font-mono text-white/70">
                    {option.previewCode}
                  </pre>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;

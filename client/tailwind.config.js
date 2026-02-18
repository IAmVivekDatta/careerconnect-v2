const withOpacityValue = (variable) => ({ opacityValue }) => {
  if (opacityValue !== undefined) {
    return `rgba(var(${variable}) / ${opacityValue})`;
  }
  return `rgb(var(${variable}))`;
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: withOpacityValue("--cc-background"),
        surface: withOpacityValue("--cc-surface"),
        surfaceMuted: withOpacityValue("--cc-surface-muted"),
        surfaceAlt: withOpacityValue("--cc-surface-alt"),
        muted: withOpacityValue("--cc-muted"),
        border: withOpacityValue("--cc-border"),
        textPrimary: withOpacityValue("--cc-text-primary"),
        textSecondary: withOpacityValue("--cc-text-secondary"),
        accent: withOpacityValue("--cc-accent"),
        accentSoft: withOpacityValue("--cc-accent-soft"),
        accentMuted: withOpacityValue("--cc-accent-muted")
      },
      boxShadow: {
        depth: "0 18px 45px rgba(4,7,19,0.55)",
        outline: "0 0 0 1px rgba(46,65,102,0.45)"
      },
      fontFamily: {
        sans: ["Sora", "Inter", "sans-serif"],
        display: ["Sora", "Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};

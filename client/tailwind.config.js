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
        neonCyan: withOpacityValue("--cc-neon-cyan"),
        neonMagenta: withOpacityValue("--cc-neon-magenta"),
        bgDark: withOpacityValue("--cc-background"),
        surface: withOpacityValue("--cc-surface"),
        muted: withOpacityValue("--cc-muted"),
        textPrimary: withOpacityValue("--cc-text-primary"),
        textSecondary: withOpacityValue("--cc-text-secondary")
      },
      boxShadow: {
        neon: "0 0 18px rgba(0,245,255,0.2)"
      },
      fontFamily: {
        display: ["Orbitron", "Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};

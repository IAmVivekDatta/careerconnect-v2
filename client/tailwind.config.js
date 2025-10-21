/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neonCyan: "#00F5FF",
        neonMagenta: "#FF00D6",
        bgDark: "#0a0a0a",
        surface: "#111111",
        muted: "#9a9a9a"
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

// apps/client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#1241a1",
        "primary-hover": "#0e3385", // 补充 hover 态
        "background-light": "#f6f6f8",
        "background-dark": "#111621",
        "card-light": "#ffffff",
        "card-dark": "#1a2231",
        "text-main-light": "#0e121b",
        "text-main-dark": "#ffffff",
        "text-secondary-light": "#4e6797",
        "text-secondary-dark": "#9ca3af",
        "border-light": "#e5e7eb",
        "border-dark": "#374151",
        "emerald": "#07883b",
        "muted-red": "#d32f2f"
      },
      fontFamily: {
        "display": ["Inter", "Noto Sans SC", "sans-serif"],
        "sans": ["Inter", "Noto Sans SC", "sans-serif"] // 确保正文也使用该字体
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // 启用手动类名控制暗黑模式
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#1241a1",
        "primary-hover": "#0e3385",
        "primary-dark": "#1e3a8a",
        "background-light": "#f8fafc",
        "background-dark": "#0f172a",
        "card-light": "#ffffff",
        "card-dark": "#1e293b",
        "text-main-light": "#0f172a",
        "text-main-dark": "#f8fafc",
        "text-secondary-light": "#64748b",
        "text-secondary-dark": "#94a3b8",
        "border-light": "#e2e8f0",
        "border-dark": "#334155",
        "emerald-custom": "#10b981",
        "red-custom": "#ef4444"
      },
      fontFamily: {
        "display": ["Inter", "Noto Sans SC", "sans-serif"],
        "sans": ["Inter", "Noto Sans SC", "sans-serif"]
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        "card-hover": "rgb(var(--card-hover) / <alpha-value>)",
        border: "rgb(var(--border))",
        muted: "rgb(var(--muted))",
        "muted-foreground": "rgb(var(--muted-foreground))",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-foreground": "rgb(var(--accent-foreground) / <alpha-value>)",
        overlay: "rgb(var(--overlay) / <alpha-value>)",
        "overlay-border": "rgb(var(--overlay-border))",
        input: "rgb(var(--input) / <alpha-value>)",
        "input-border": "rgb(var(--input-border))",
        "nav-bg": "rgb(var(--nav-bg) / <alpha-value>)",
        "sidebar-bg": "rgb(var(--sidebar-bg) / <alpha-value>)",
        "badge-bg": "rgb(var(--badge-bg))",
        danger: "rgb(var(--danger) / <alpha-value>)",
      },
    },
  },
  plugins: [],
}
export default config

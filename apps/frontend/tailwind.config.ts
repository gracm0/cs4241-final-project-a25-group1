import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-ink": "#0b1020",
        "brand-sky": "#38bdf8",
      },
      fontFamily: {
        body: ["Roboto", "system-ui", "sans-serif"],
      },
    },
  },
  safelist: [
    "bg-hero",
    "brand-text",
    "highlight-pill",
    "highlight-sheen",
    "logo-badge",
    "hero-logo",
    "photo-card",
    "glow",
    "animate-fadeUp",
    "btn",
    "btn-sky",
    "btn-outline",
    { pattern: /(float)-(slow|med|fast)/ },
    "top-12",
    "left-12",
    "top-32",
    "left-28",
    "top-16",
    "right-16",
    "bottom-16",
    "right-28",
    "bottom-28",
    "right-12",
    "bottom-12",
    "left-16",
    "-rotate-6",
    "-rotate-3",
    "rotate-6",
    "rotate-3",
    "rotate-2",
    "max-md:hidden",
  ],
} satisfies Config;

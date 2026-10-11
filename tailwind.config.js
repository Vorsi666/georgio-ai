/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sumi: "#1C1C1E",
        washi: "#F7F3EC",
        akane: "#B54036",
        take: "#6B7B5F",
        kigami: "#E8DDD0",
        kinari: "#D4B896",
      },
      fontFamily: {
        display: ['"Shippori Mincho"', '"Noto Serif JP"', "serif"],
        body: ['"Zen Kaku Gothic New"', '"Noto Sans JP"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        jp: ['"Shippori Mincho"', '"Noto Serif JP"', "serif"],
      },
    },
  },
  plugins: [],
};

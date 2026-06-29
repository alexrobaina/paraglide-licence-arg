import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Satisface las utilidades `*-background` que usan los componentes UIPulse
        background: 'rgb(var(--background) / <alpha-value>)',
      },
    },
  },
  plugins: [],
} satisfies Config;

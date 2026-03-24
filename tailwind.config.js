/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
        body: ['Barlow', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ink scale uses CSS variables so any theme can override the accent color.
        // Values are defined as "R G B" (no commas) to support Tailwind opacity
        // modifiers like text-ink-500/30.
        ink: {
          50:  'rgb(var(--ink-50)  / <alpha-value>)',
          100: 'rgb(var(--ink-100) / <alpha-value>)',
          200: 'rgb(var(--ink-200) / <alpha-value>)',
          300: 'rgb(var(--ink-300) / <alpha-value>)',
          400: 'rgb(var(--ink-400) / <alpha-value>)',
          500: 'rgb(var(--ink-500) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
          800: 'rgb(var(--ink-800) / <alpha-value>)',
          900: 'rgb(var(--ink-900) / <alpha-value>)',
        },
        ink2: {
          50:  'rgb(var(--ink2-50)  / <alpha-value>)',
          100: 'rgb(var(--ink2-100) / <alpha-value>)',
          200: 'rgb(var(--ink2-200) / <alpha-value>)',
          300: 'rgb(var(--ink2-300) / <alpha-value>)',
          400: 'rgb(var(--ink2-400) / <alpha-value>)',
          500: 'rgb(var(--ink2-500) / <alpha-value>)',
          600: 'rgb(var(--ink2-600) / <alpha-value>)',
          700: 'rgb(var(--ink2-700) / <alpha-value>)',
          800: 'rgb(var(--ink2-800) / <alpha-value>)',
          900: 'rgb(var(--ink2-900) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}

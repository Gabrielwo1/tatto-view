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
        ink: {
          50:  '#fff5f0',
          100: '#ffe3d5',
          200: '#ffc4a8',
          300: '#ff9b70',
          400: '#ff6733',
          500: '#ff4500',
          600: '#e03300',
          700: '#b82500',
          800: '#8a1c00',
          900: '#5c1100',
        },
      },
    },
  },
  plugins: [],
}

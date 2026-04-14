/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0faf6',
          100: '#d0f1e3',
          200: '#a0e3c7',
          300: '#5fcba3',
          400: '#28a87c',
          500: '#1a8c65',
          600: '#14704f',
          700: '#0f5540',
          800: '#0b3d2e',
          900: '#07261d',
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        stage: {
          dark: '#0a0d14',
          card: '#111827',
          border: '#1f2937',
          text: '#f3f4f6',
          highlight: '#38bdf8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      },
      keyframes: {
        pulseBorder: {
          '0%, 100%': { borderColor: 'rgba(239, 68, 68, 0.8)', boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)' },
          '50%': { borderColor: 'rgba(239, 68, 68, 0.2)', boxShadow: '0 0 5px rgba(239, 68, 68, 0.1)' },
        }
      },
      animation: {
        'pulse-border': 'pulseBorder 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

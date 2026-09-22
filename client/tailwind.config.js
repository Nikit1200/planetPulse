/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        sage: {
          50: '#f6f7f6',
          100: '#e2e7e3',
          200: '#c5d0c7',
          500: '#52796f',
          700: '#2f3e46',
          900: '#1a2421',
        },
        mint: {
          50: '#f2fbf7',
          100: '#e1f7ec',
          200: '#bdf0d7',
          500: '#10b981',
          600: '#059669',
        },
        earth: {
          50: '#fbfbfb',
          100: '#f5f7f5',
          200: '#e8ece8',
          800: '#26312a',
          900: '#17211b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(16, 42, 33, 0.04)',
        'card': '0 1px 3px 0 rgba(16, 42, 33, 0.05), 0 1px 2px -1px rgba(16, 42, 33, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(16, 42, 33, 0.08), 0 8px 10px -6px rgba(16, 42, 33, 0.04)',
        'glow': '0 0 20px -5px rgba(22, 163, 74, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
}

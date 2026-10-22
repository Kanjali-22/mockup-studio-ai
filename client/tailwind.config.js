/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#fdfcfb',
          100: '#faf8f5',
          200: '#f5f0ea',
        },
        charcoal: {
          900: '#1a1a1a',
          800: '#2a2a2a',
          700: '#3a3a3a',
          600: '#555555',
          500: '#6b6b6b',
          400: '#888888',
          300: '#aaaaaa',
          200: '#cccccc',
          100: '#eeeeee',
        },
        accent: {
          50: '#f0f4ff',
          100: '#dde6ff',
          200: '#b8caff',
          300: '#7ea5ff',
          400: '#4c7ef7',
          500: '#3b6ef0',
          600: '#2c5ce0',
          700: '#2348c5',
          800: '#1e3ba0',
          900: '#1a3280',
        },
        warm: {
          50: '#fef9f0',
          100: '#fef3e0',
          200: '#fce5b8',
          300: '#f9cf80',
          400: '#f5b340',
          500: '#e89a1a',
          600: '#c8800f',
          700: '#a4650c',
          800: '#844f0e',
          900: '#6d410f',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        skeleton: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      },
      boxShadow: {
        'card': '0 1px 4px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        'panel': '0 1px 8px 0 rgba(0,0,0,0.08)',
        'button': '0 1px 3px 0 rgba(0,0,0,0.12)',
      }
    },
  },
  plugins: [],
}

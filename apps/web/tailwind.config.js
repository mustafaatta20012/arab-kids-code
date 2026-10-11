import tailwindRtl from 'tailwindcss-rtl';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        },
        accent: {
          500: '#f59e0b',
          600: '#d97706',
        },
        kids: {
          purple: '#8b5cf6',
          pink: '#ec4899',
          green: '#10b981',
          yellow: '#f59e0b',
        },
        theme: {
          canvas: 'rgb(var(--bg-canvas) / <alpha-value>)',
          surface: 'rgb(var(--bg-surface) / <alpha-value>)',
          elevated: 'rgb(var(--bg-surface-elevated) / <alpha-value>)',
          muted: 'rgb(var(--bg-surface-muted) / <alpha-value>)',
          border: 'rgb(var(--border-subtle) / <alpha-value>)',
          'border-strong': 'rgb(var(--border-strong) / <alpha-value>)',
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          subtle: 'rgb(var(--text-muted) / <alpha-value>)',
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [
    tailwindRtl,
  ],
};


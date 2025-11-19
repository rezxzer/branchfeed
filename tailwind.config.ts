import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Primary Blue - Base tokens (keeping for compatibility)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Secondary Purple - Base tokens (keeping for compatibility)
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Brand Core Colors
        brand: {
          iris: '#4f46e5',
          plum: '#a855f7',
          cyan: '#22d3ee',
        },
        // Branch Specific Colors
        branch: {
          a: '#4f46e5',
          b: '#ec4899',
        },
        // VIP & Premium Colors
        vip: {
          gold: '#fbbf24',
        },
        pro: {
          amber: '#f97316',
        },
        // Semantic Colors
        success: {
          DEFAULT: '#10b981',
          light: '#d1fae5',
          dark: '#059669',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
          dark: '#dc2626',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
          dark: '#d97706',
        },
        info: {
          DEFAULT: '#3b82f6',
          light: '#dbeafe',
          dark: '#2563eb',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #4f46e5, #a855f7)',
        'gradient-branch': 'linear-gradient(135deg, #4f46e5, #22d3ee)',
        'gradient-danger': 'linear-gradient(135deg, #f97316, #ef4444)',
        'gradient-vip': 'linear-gradient(135deg, #fbbf24, #a855f7)',
        'gradient-pro': 'linear-gradient(135deg, #22d3ee, #4f46e5)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'level-1': '0 10px 25px rgba(15, 23, 42, 0.3)',
        'level-2': '0 20px 40px rgba(15, 23, 42, 0.45)',
        'level-3': '0 30px 60px rgba(15, 23, 42, 0.6)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.23, 1, 0.32, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
export default config


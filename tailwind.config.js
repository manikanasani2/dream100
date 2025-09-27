/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0B0B0F',
        panels: '#0F0F14',
        elevated: '#121218',
        accent: {
          red: '#E11D48',
          'red-hover': '#BE185D',
          'red-focus': '#9F1239',
        },
        muted: '#9CA3AF',
        text: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 150ms ease-out',
        'lift': 'lift 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        lift: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
          '100%': { transform: 'translateY(-2px)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-elevated': '0 12px 40px rgba(0, 0, 0, 0.4)',
        'neon': '0 0 20px rgba(225, 29, 72, 0.3), 0 0 40px rgba(225, 29, 72, 0.1)',
        'neon-hover': '0 0 25px rgba(225, 29, 72, 0.4), 0 0 50px rgba(225, 29, 72, 0.2)',
        'lift': '0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(225, 29, 72, 0.1)',
      },
    },
  },
  plugins: [],
};
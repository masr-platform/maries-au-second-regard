/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf9e7',
          100: '#faf0c0',
          200: '#f5e07a',
          300: '#eecb3d',
          400: '#e6b820',
          500: '#B8960C',
          600: '#9a7a09',
          700: '#7a5f07',
          800: '#5c4705',
          900: '#3d2f03',
        },
        dark: {
          50:  '#f5f5f5',
          100: '#e0e0e0',
          200: '#b0b0b0',
          300: '#808080',
          400: '#4a4a4a',
          500: '#2c2c2c',
          600: '#1a1a1a',
          700: '#111111',
          800: '#0a0a0a',
          900: '#050505',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans:  ['Inter', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #B8960C 0%, #e6b820 50%, #B8960C 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseGold: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(184, 150, 12, 0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(184, 150, 12, 0)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'gold': '0 0 20px rgba(184, 150, 12, 0.3)',
        'gold-lg': '0 0 40px rgba(184, 150, 12, 0.4)',
      },
    },
  },
  plugins: [],
}

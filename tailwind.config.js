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
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        dark: {
          50:  '#f5f5f5',
          100: '#e0e0e0',
          200: '#b0b0b0',
          300: '#9ca3af',
          400: '#6b7280',
          500: '#2c2c3e',
          600: '#1e1b2e',
          700: '#13111f',
          800: '#0d0b17',
          900: '#060412',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans:  ['Inter', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 50%, #7c3aed 100%)',
        'dark-gradient': 'linear-gradient(135deg, #060412 0%, #0f0a1e 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-gold': 'pulseViolet 2s infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'orb':        'orb 8s ease-in-out infinite',
        'orb-slow':   'orb 12s ease-in-out infinite reverse',
      },
      keyframes: {
        fadeIn:      { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:     { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseViolet: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(139,92,246,0.4)' }, '50%': { boxShadow: '0 0 0 10px rgba(139,92,246,0)' } },
        shimmer:     { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:       { '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' }, '50%': { transform: 'translateY(-22px) rotate(3deg)' } },
        orb:         { '0%, 100%': { transform: 'translate(0,0) scale(1)' }, '33%': { transform: 'translate(40px,-40px) scale(1.1)' }, '66%': { transform: 'translate(-30px,25px) scale(0.9)' } },
      },
      boxShadow: {
        'gold':    '0 0 20px rgba(139,92,246,0.35)',
        'gold-lg': '0 0 50px rgba(139,92,246,0.5)',
        'violet':  '0 0 80px rgba(124,58,237,0.45)',
      },
    },
  },
  plugins: [],
}

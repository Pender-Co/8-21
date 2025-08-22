/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#2E7D32',
        'soft-sky': '#E0F2F1',
        'dark-slate': '#263238',
        'neutral-stone': '#FAFAF9',
        'accent-lime': '#AEEA00',
      },
      fontFamily: {
        'dm-sans': ['DM Sans', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
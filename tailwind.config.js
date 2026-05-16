/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#0f0f11',
          1: '#1a1a1f',
          2: '#222228',
          3: '#2a2a32',
        },
        accent: {
          DEFAULT: '#4ade80',
          dim: '#22c55e',
          muted: 'rgba(74,222,128,0.12)',
        },
        gold: {
          DEFAULT: '#fbbf24',
          muted: 'rgba(251,191,36,0.12)',
        },
        blue: {
          accent: '#60a5fa',
          muted: 'rgba(96,165,250,0.12)',
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wow-warrior': '#C79C6E',
        'wow-paladin': '#F58CBA',
        'wow-hunter': '#ABD473',
        'wow-rogue': '#FFF569',
        'wow-priest': '#FFFFFF',
        'wow-deathknight': '#C41E3A',
        'wow-shaman': '#0070DD',
        'wow-mage': '#69CCF0',
        'wow-warlock': '#9482CA',
        'wow-monk': '#00FF96',
        'wow-druid': '#FF7D0A',
        'wow-demonhunter': '#A335EE',
        'wow-evoker': '#33937F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'lift': 'lift 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-in-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'lift': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

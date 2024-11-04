/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['0.5rem', '.75rem'],
      },
      animation: {
        'zoom-in': 'zoom-in .3s linear 1',
        'zoom-out': 'zoom-out .3s linear 1',
        'slide-down': 'slide-down .5s linear 1',
        'slide-up': 'slide-up .5s linear 1',
      },
      keyframes: {
        'zoom-in': {
          '0%': { opacity: '0', transform: 'scale(.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'zoom-out': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(.8)' },
        },
        'slide-down': {
          '0%': { opacity: '0', top: '20%' },
          '100%': { opacity: '1', top: '33.3%' },
        },
        'slide-up': {
          '0%': { opacity: '1', top: '33.33%' },
          '100%': { opacity: '0', top: '20%' },
        }
      },
      backgroundColor: {
        'darkblue-1': '#363062',
        'darkblue-2': '#435585',
        'darkblue-3': '#818FB4',
        'darkblue-4': '#F5E8C7',
        'primary': '#3b82f6',
        'success': '#22c55e',
      },
      borderWidth: {
        '8bit-text': {},
        '8bit-modal': {},
        '8bit-success': {},
        '8bit-primary': {}
      }
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        dark: '#121212',      // Slightly lighter black for cards
        gray: '#A6A6A6',      // Text gray
        input: '#262626',     // Dark gray for inputs
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Clean, standard font
      }
    },
  },
  plugins: [],
}
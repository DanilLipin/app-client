/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'light-blue': '#cafafe',
        'dark-blue': '#55bcc9',
        'corall-red': '#fc4445',
        'submarine-green': '#5cdb95'
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}


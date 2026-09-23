/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f6f1',
          100: '#e0ede2',
          200: '#c9dfcd',
          300: '#aecab4',
          400: '#8caf96',
          500: '#71977d',
          600: '#5c8168',
          700: '#496954',
          800: '#3b5544',
          900: '#2e4336',
        }
      }
    },
  },
  plugins: [],
}

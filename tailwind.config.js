/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#9E7FFF',
        'secondary': '#38bdf8',
        'accent': '#f472b6',
        'background': '#171717',
        'surface': '#262626',
        'text': '#FFFFFF',
        'text-secondary': '#A3A3A3',
        'border-color': '#2F2F2F',
      },
      borderRadius: {
        'xl': '16px',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(158, 127, 255, 0.3)',
      }
    },
  },
  plugins: [],
}

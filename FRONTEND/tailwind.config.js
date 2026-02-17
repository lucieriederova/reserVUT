/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'vut-red': '#e11d48',
          'esbd-purple': '#8b5cf6',
        }
      },
    },
    plugins: [],
  }
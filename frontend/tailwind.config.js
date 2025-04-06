/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {}, // Asegúrate de que no estás redefiniendo los grises aquí
    },
    plugins: [],
  }
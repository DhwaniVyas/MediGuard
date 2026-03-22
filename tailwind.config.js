/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:    '#1D2D50',
        skyblue: '#3A7BD5',
        teal:    '#2AAE8A',
        surface: '#F7F9FB',
      },
      boxShadow: {
        card: '0 4px 24px rgba(29,45,80,0.08)',
        'card-hover': '0 8px 40px rgba(29,45,80,0.16)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}

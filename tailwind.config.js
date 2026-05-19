/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        /* Google for Education palette */
        primary: '#1a73e8',
        'primary-hover': '#1557b0',
        secondary: '#188038',
        interactive: '#1967d2',
        'sky-tint': '#e8f0fe',
        'mint-glaze': '#ceead6',
        'amber-glaze': '#fef7cd',
        'page-white': '#f8f9fa',
        'text-dark': '#202124',
        'text-medium': '#3c4043',
        'text-subtle': '#5f6368',
        'border-light': '#dadce0',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'pill': '200px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.05)',
        'card-hover': '0 2px 6px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
        'elevated': '0 8px 16px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}

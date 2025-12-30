/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./index.html"
  ],
  darkMode: 'class', // Default dark mode
  theme: {
    extend: {
      colors: {
        // Custom Palette from input.css
        'custom-dark-bg': '#0B0B0F',
        'custom-dark-border': '#1e293b',
        'custom-input-hover': '#334155',
        'custom-placeholder': '#64748b',
        'custom-purple': '#8b5cf6',
        'custom-pink': '#ec4899',
        'custom-cyan': '#0891b2',
        'custom-card-bg': '#3b3b50',
        'custom-card-border': '#5c7678',
        'custom-card-hover-border': '#7f7f7f',
        'custom-filter-bg': '#6B57FF',
        'custom-filter-border': '#beb6ff',
        'custom-filter-hover': '#577eff',
        'custom-stat-blue': '#3B82F6',
        'custom-stat-cyan': '#06B6D4',
        'custom-scrollbar-thumb-hover': '#e0e0e0',
      },
      backgroundImage: {
        'body-gradient': 'linear-gradient(135deg, #04003d 0%, #2c21a8 25%, #276cdb 50%, #006cbf 100%)',
        'primary-btn-gradient': 'linear-gradient(135deg, #0800ff 0%, #487cec 100%)',
        'primary-btn-hover-gradient': 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
        'section-title': 'linear-gradient(135deg, #8b5cf6, #ec4899, #0891b2)',
        'section-title-lg': 'linear-gradient(135deg, #a78bfa, #f472b6, #06b6d4)',
        'title-underline': 'linear-gradient(to right, #8b5cf6, #ec4899)',
        'stat-gradient': 'linear-gradient(to right, #3B82F6, #06B6D4)',
        'gradient-hero': 'linear-gradient(135deg, #6b21a8 0%, #8b5cf6 25%, #ec4899 50%, #0891b2 100%)',
        'gradient-card-blue': 'linear-gradient(to bottom right, #000000, #00aaff)',
        'gradient-card-purple': 'linear-gradient(to bottom right, #000000, #8c00ff)',
        'gradient-card-green': 'linear-gradient(to bottom right, #000000, #00ffaa)',
        'gradient-card-orange': 'linear-gradient(to bottom right, #000000, #ff4800)',
        'gradient-card-red': 'linear-gradient(to bottom right, #000000, #ff0000)',
        'gradient-card-indigo': 'linear-gradient(to bottom right, #000000, #1500ff)',
        'gradient-card-pink': 'linear-gradient(to bottom right, #000000, #ff006a)',
        'gradient-card-teal': 'linear-gradient(to bottom right, #000000, #0099ff)',
        'text-gradient-blue': 'linear-gradient(to right, #000000, #001aff, rgb(0, 85, 255))',
        'text-gradient-primary': 'linear-gradient(to right, #000000, #1e00ff)',
      },
      boxShadow: {
        'smooth': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'smooth-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'primary-btn': '0 4px 14px rgba(139, 92, 246, 0.4)',
        'primary-btn-hover': '0 6px 20px rgba(139, 92, 246, 0.6)',
        'card-hover': '0 8px 24px #2596be',
        'doc-card-hover': '0 12px 32px rgba(139, 92, 246, 0.3)',
        'featured-card-hover': '0 12px 32px rgba(236, 72, 153, 0.3)',
        'input-focus': '0 0 0 3px rgba(139, 92, 246, 0.1)',
        'focus-blue': '0 0 0 2px #000000, 0 0 0 4px #006aff',
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'system-ui', 'sans-serif'],
        math: ['Be Vietnam Pro', 'system-ui', 'sans-serif'],
        script: ['Imperial Script', 'cursive'],
        mono: ['Fira Code', 'monospace']
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      letterSpacing: {
        'widest': '.3em',
      },
    },
  },
  plugins: [],
}

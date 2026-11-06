/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js}",
    "./index.html",
    "./about.html",
    "./contact.html",
    "./how-to-use.html",
    "./admin.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          primary:        '#1A659E',
          secondary:      '#86B8DE',
          light:          '#EAF2F8',
          'dark-bg':      '#071A2C',
          'dark-surface': '#0A233A',
          'dark-border':  '#173B5C',
          'light-bg':     '#EAF2F8',
          'light-surface':'#FFFFFF',
          'light-border': '#C5D9EA',
          'light-text':   '#0A233A',
          hover:          '#15568A',
          'dark-hover':   '#0F2D4A',
          deep:           '#0E3D60',
        },
        /* Legacy aliases for compatibility */
        oceanPrimary:      '#1A659E',
        oceanSecondary:    '#86B8DE',
        oceanLight:        '#EAF2F8',
        oceanDarkBg:       '#071A2C',
        oceanDarkSurface:  '#0A233A',
        oceanDarkBorder:   '#173B5C',
        oceanLightBg:      '#EAF2F8',
        oceanLightSurface: '#FFFFFF',
        oceanLightBorder:  '#C5D9EA',
        oceanLightText:    '#0A233A',
        oceanAccent:       '#5B92C2',
        oceanDeep:         '#0E3D60',
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm:   '2px',
      },
      boxShadow: {
        'ocean-glow':  '0 0 20px rgba(26, 101, 158, 0.3)',
        'ocean-panel': '4px 0 16px rgba(7, 26, 44, 0.5)',
        none:          'none',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%':      { transform: 'translateY(-8px) rotate(1deg)' },
          '66%':      { transform: 'translateY(4px) rotate(-1deg)' },
        },
      },
      animation: {
        'fade-in':        'fade-in 0.4s ease-out',
        'slide-in-left':  'slide-in-left 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        wave:             'wave 3s ease-in-out infinite',
        shimmer:          'shimmer 2s linear infinite',
        'pulse-ring':     'pulse-ring 1.5s ease-out infinite',
        float:            'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

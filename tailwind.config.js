/** @type {import('tailwindcss').Config} */
module.exports = {
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
        /* Ocean Design System — ui-ocean-design.md */
        oceanPrimary:      '#0D5C75',
        oceanSecondary:    '#3B7383',
        oceanLight:        '#D6E8ED',
        oceanDarkBg:       '#051014',
        oceanDarkSurface:  '#0A1C23',
        oceanDarkBorder:   '#16323D',
        oceanLightBg:      '#F0F5F7',
        oceanLightSurface: '#FFFFFF',
        oceanLightBorder:  '#C9D8DD',
        oceanLightText:    '#081E26',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

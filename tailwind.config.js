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
        oceanPrimary:      '#1A659E',
        oceanSecondary:    '#346FA3',
        oceanLight:        '#EAF2F8',
        oceanDarkBg:       '#071A2C',
        oceanDarkSurface:  '#0A233A',
        oceanDarkBorder:   '#173B5C',
        oceanLightBg:      '#EAF2F8',
        oceanLightSurface: '#FFFFFF',
        oceanLightBorder:  '#C5D9EA',
        oceanLightText:    '#0A233A',
        /* Bảng màu xanh dương hàn lâm (đồng bộ LaTeX) */
        oceanAccent:       '#5B92C2', /* OceanBlueSecondary */
        oceanDeep:         '#0E3D60', /* OceanBlueDark */
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

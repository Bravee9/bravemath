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
        // Discord Color Palette
        'discord-darkest': '#202225',  // Background
        'discord-dark': '#292b2f',     // Dark background
        'discord-darker': '#2f3136',   // Card/Panel
        'discord-gray': '#40444b',     // Border/Hover
        'discord-text': '#dcddde',     // Text
        'discord-muted': '#72767d',    // Muted text
        'discord-blurple': '#5865F2',  // Brand blue
        'discord-green': '#3BA55D',    // Success
        'discord-yellow': '#FAA81A',   // Warning
        'discord-red': '#ED4245',      // Danger
        'discord-pink': '#EB459E',     // Accent
      },
      fontFamily: {
        sans: ['Cambria', 'system-ui', 'sans-serif'],
        math: ['Cambria Math', 'Cambria', 'serif'],
        script: ['Imperial Script', 'cursive'],
        mono: ['Fira Code', 'monospace']
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}

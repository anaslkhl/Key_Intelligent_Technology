export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a1628',
          card: '#0f1f3a',
          border: '#1a2d4a',
          text: '#e8f0fe',
        },
      },
    },
  },
  plugins: [],
}
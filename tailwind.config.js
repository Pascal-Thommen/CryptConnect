/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A1628',
        'bg-card': '#0F2040',
        'bg-elevated': '#162B50',
        'navy': '#1B3A5C',
        'teal': '#2EC4A9',
        'teal-dim': '#1A7A6E',
        'text-primary': '#E8F4F8',
        'text-secondary': '#7A9BB5',
        'text-muted': '#3D6080',
        'green': '#00D395',
        'red': '#FF4757',
        'gold': '#F0B429',
        'border-color': '#1E3A5A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

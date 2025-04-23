/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      borderRadius: {
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      fontFamily: {
        sans: ['Inter'],
        body: ['Inter'],
      },
    },
  },
  plugins: [],
  purge: ['./index.html', './src/**/*.{vue,js,ts}'],
}

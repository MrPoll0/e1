const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: {
    content: ['./components/**/*.js', './pages/**/*.js'],
    safelist: [
      'w-0',
      'w-1/6',
      'w-2/6',
      'w-3/6',
      'w-4/6',
      'w-5/6',
      'w-6/6',
    ],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      'mobile': '360px',
      'tablet': '600px',
      'laptop': '1024px',
      'desktop': '1280px',
      'video': '960px',
      ...defaultTheme.screens,
    },
    minHeight: {
      'video': '540px',
      ...defaultTheme.minHeight,
    },
    extend: {
      width: {
        'mobile': '360px',
      },
      colors: {
        'gray-smooth': '#292929',
        'black-smooth': '#181818',
      },
    },
    boxShadow: {
      'highlight': '0 0 0 4px #60A5FA',
    },
  },
  variants: {
    extend: {
      cursor: ['hover', 'responsive'],
      fontWeight: ['hover', 'focus'],
    },
    outline: ["focus"],
    opacity: ["disabled"],
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

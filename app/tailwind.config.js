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
      'mobile2': '500px',
      'tablet': '600px',
      'tablet2': '800px',
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
      margin: {
        'desktop2': '28rem',
      },
    },
    boxShadow: {
      'highlight': '0 0 0 4px #60A5FA',
      'purple': '0 2px 35px 5px rgba(158, 91, 245, 1)',
      ...defaultTheme.boxShadow,
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

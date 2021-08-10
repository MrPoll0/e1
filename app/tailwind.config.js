const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: [],
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
    },
    boxShadow: {
      'highlight': '0 0 0 4px #60A5FA',
    },
  },
  variants: {
    extend: {
      cursor: ['hover', 'responsive'],
    },
    outline: ["focus"],
    opacity: ["disabled"],
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

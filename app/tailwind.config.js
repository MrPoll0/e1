module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      cursor: ['hover', 'responsive'],
    },
    outline: ["focus"],
  },
  plugins: [require('@tailwindcss/forms'),],
}

module.exports = {
  purge: '{,!(node_modules|_site)/**/}*.{html,md}',
  darkMode: 'media',
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [require("@tailwindcss/typography")],
};

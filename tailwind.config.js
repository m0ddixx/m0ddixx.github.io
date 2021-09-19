module.exports = {
  purge: '{,!(node_modules|_site)/**/}*.{html,md}',
  darkMode: false,
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [require("@tailwindcss/typography")],
};

module.exports = {
  purge: ["./src/**/*.html", "./src/**/*.js", "./docs/**/*.html"],
  darkMode: false, // or 'media' or 'class'
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

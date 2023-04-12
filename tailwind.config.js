module.exports = {
  purge: [
    `**/*.html`,
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_posts/*.md',
    './*.html',
    '**/*.markdown'],
  darkMode: "media",
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            ".highlight": {
              color: theme("colors.gray.100"),
            },
          },
        },
        dark: {
          css: {
            color: theme("colors.gray.100"),

            a: {
              color: theme("colors.white"),
              "&:hover": {
                color: theme("colors.blue.100"),
              },
            },
            h1: {
              color: theme("colors.gray.400"),
            },
            h2: {
              color: theme("colors.gray.400"),
            },
            h3: {
              color: theme("colors.gray.400"),
            },
            h4: {
              color: theme("colors.gray.400"),
            },
            h5: {
              color: theme("colors.gray.400"),
            },
            h6: {
              color: theme("colors.gray.400"),
            },

            strong: {
              color: theme("colors.gray.300"),
            },

            code: {
              color: theme("colors.gray.300"),
            },
            p: {
              color: theme("colors.gray.200"),
            },

            figcaption: {
              color: theme("colors.gray.500"),
            },
            pre: {
              backgroundColor: theme("colors.gray.900"),
            },
          },
        },
      }),
    },
  },
  variants: {
    extend: {
      typography: ["dark"],
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

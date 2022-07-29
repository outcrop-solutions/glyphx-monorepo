const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./partials/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    gradientColorStops: (theme) => ({
      ...theme("colors"),
      primary: "#0D1321",
      secondary: "#151C2D",
    }),
    extend: {
      boxShadow: {
        DEFAULT:
          "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.01)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.01)",
      },
      colors: {
        current: 'currentColor',
        "primary-yellow": "#FFC00",
        "primary-dark-blue": "#0D1321",
        "secondary-dark-blue": "#151C2D",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.5715" }],
        base: ["1rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        lg: ["1.125rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        xl: ["1.25rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        "2xl": ["1.5rem", { lineHeight: "1.33", letterSpacing: "-0.01em" }],
        "3xl": ["1.88rem", { lineHeight: "1.33", letterSpacing: "-0.01em" }],
        "4xl": ["2.25rem", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
        "5xl": ["3rem", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
        "6xl": ["3.75rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
      },
      screens: {
        xs: "480px",
      },
      borderWidth: {
        3: "3px",
      },
      backgroundImage: {
        "split-yellow-gray":
          "linear-gradient(to right, #111827 50%, transparent 50%)",
        "split-slate-yellow":
          "linear-gradient(to right, transparent 50%, #111827 50%)",
      },
      minWidth: {
        36: "9rem",
        44: "11rem",
        56: "14rem",
        60: "15rem",
        72: "18rem",
        80: "20rem",
      },
      width: {
        56: "14rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      zIndex: {
        60: "60",
      },
    },
  },
  plugins: [
    // eslint-disable-next-line global-require
    require("@tailwindcss/forms"),
    // require("tailwind-scrollbar"),
    require("@tailwindcss/aspect-ratio"),
    require('./utils/scrollbar.js'),
    // add custom variant for expanding sidebar
    plugin(({ addVariant, e }) => {
      addVariant("main-sidebar-expanded", ({ modifySelectors, separator }) => {
        modifySelectors(
          ({ className }) =>
            `.main-sidebar-expanded .${e(
              `main-sidebar-expanded${separator}${className}`
            )}`
        );
      });
      addVariant(
        "project-sidebar-expanded",
        ({ modifySelectors, separator }) => {
          modifySelectors(
            ({ className }) =>
              `.project-sidebar-expanded .${e(
                `project-sidebar-expanded${separator}${className}`
              )}`
          );
        }
      );
      addVariant(
        "comments-sidebar-expanded",
        ({ modifySelectors, separator }) => {
          modifySelectors(
            ({ className }) =>
              `.comments-sidebar-expanded .${e(
                `comments-sidebar-expanded${separator}${className}`
              )}`
          );
        }
      );
    }),
  ],
};

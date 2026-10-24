/** @type {import('tailwindcss').Config} */
const tokens = require("./tokens");

module.exports = {
  darkMode: "class",
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: tokens.tailwindColors,
    },
  },
  plugins: [require("tailwindcss/plugin")(({ addBase }) => addBase({ ":root": tokens.variables.light, ".dark:root": tokens.variables.dark }))],
};

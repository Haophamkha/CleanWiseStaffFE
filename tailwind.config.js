/** @type {import('tailwindcss').Config} */
const tokens = require("./tokens");

module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: tokens.colors,
    },
  },
  plugins: [],
};

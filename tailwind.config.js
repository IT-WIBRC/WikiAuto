/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        "dm-sans": ["DM sans", "sans-serif", "system-ui"],
      },
      colors: {
        primary: "#3A36DB",
        "primary-text": "#06152B",
      },
    },
  },
  plugins: [],
};

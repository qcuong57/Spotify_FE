module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderWidth: {
        thin: "0.5px",
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar"),
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-spotify": {
          "scrollbar-width": "thin",
          "scrollbar-color": "#282828 #121212",
          "&::-webkit-scrollbar": {
            width: "12px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#121212",
            "border-radius": "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#282828",
            "border-radius": "6px",
            border: "2px solid #121212",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#404040",
          },
        },
      });
    },
  ],
};

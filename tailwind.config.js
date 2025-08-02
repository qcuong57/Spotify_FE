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
          "scrollbar-color": "rgba(17, 94, 89, 0.8) rgba(17, 94, 89, 0.3)", // teal-900 colors
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(17, 94, 89, 0.3)", // teal-900/30 - lighter track
            "border-radius": "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(17, 94, 89, 0.8)", // teal-900/80 - darker thumb
            "border-radius": "4px",
            border: "1px solid rgba(17, 94, 89, 0.5)", // teal-900/50 border
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(13, 148, 136, 0.9)", // teal-600/90 - hover state
          },
        },
        ".scrollbar-teal": {
          "scrollbar-width": "thin",
          "scrollbar-color": "rgba(45, 212, 191, 0.7) rgba(17, 94, 89, 0.3)", // teal-400 & teal-900
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(17, 94, 89, 0.3)", // teal-900/30
            "border-radius": "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(45, 212, 191, 0.7)", // teal-400/70
            "border-radius": "4px",
            border: "1px solid rgba(17, 94, 89, 0.5)",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(45, 212, 191, 0.9)", // teal-400/90
          },
        },
      });
    },
  ],
};
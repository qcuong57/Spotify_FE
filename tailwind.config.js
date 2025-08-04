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
  safelist: [
    // Theme colors - Ocean
    'text-teal-300',
    'text-emerald-300',
    'text-teal-200',
    'text-emerald-400',
    'bg-teal-900/30',
    'bg-teal-800/50',
    'bg-teal-300/70',
    'bg-emerald-400/70',
    'border-teal-700/30',
    'border-teal-400/30',
    'hover:bg-teal-800/50',
    'hover:text-emerald-300',
    'from-teal-900',
    'via-teal-800',
    'to-teal-700',
    'from-teal-900/50',
    'via-teal-800/50',
    'to-teal-700/50',
    'bg-teal-600/50',
    'bg-teal-300',
    'hover:bg-emerald-400',
    
    // Theme colors - Forest  
    'text-green-300',
    'text-amber-300',
    'text-green-200',
    'bg-green-900/30',
    'bg-green-800/50',
    'bg-green-800/40',
    'bg-amber-400/80',
    'bg-amber-300/90',
    'border-amber-600/40',
    'border-amber-500/50',
    'border-amber-400/60',
    'hover:bg-green-800/50',
    'hover:text-amber-300',
    'from-green-900',
    'via-green-800',
    'to-emerald-700',
    'from-green-900/50',
    'via-green-800/50',
    'to-emerald-700/50',
    'bg-green-600/50',
    'bg-amber-400',
    'hover:bg-amber-300',
    'gradient-to-r',
    'from-green-600',
    'to-lime-500',
    'from-green-500',
    'to-lime-400',
    
    // Theme colors - Space
    'text-purple-300',
    'text-pink-300',
    'text-purple-200',
    'text-pink-400',
    'bg-purple-900/30',
    'bg-purple-800/50',
    'bg-purple-300/70',
    'bg-pink-400/70',
    'border-purple-700/30',
    'border-purple-400/20',
    'hover:bg-purple-800/50',
    'hover:text-pink-300',
    'from-purple-900',
    'via-purple-800',
    'to-indigo-700',
    'from-purple-900/50',
    'via-purple-800/50',
    'to-indigo-700/50',
    'bg-purple-600/50',
    'bg-purple-300',
    'hover:bg-pink-400',
    'from-purple-600',
    'to-violet-500',
    'from-indigo-600',
    'to-purple-500',
    
    // Theme colors - Sunset
    'text-orange-300',
    'text-amber-300',
    'text-orange-200',
    'text-amber-400',
    'bg-orange-900/30',
    'bg-orange-800/50',
    'bg-orange-300/70',
    'bg-amber-400/70',
    'border-orange-700/30',
    'border-orange-400/20',
    'hover:bg-orange-800/50',
    'hover:text-amber-300',
    'from-orange-900',
    'via-red-800',
    'to-yellow-700',
    'from-orange-900/50',
    'via-red-800/50',
    'to-yellow-700/50',
    'bg-orange-600/50',
    'bg-orange-300',
    'hover:bg-amber-400',
    'from-orange-600',
    'to-amber-500',
    'from-red-500',
    'to-orange-400',
    
    // Common colors
    'text-white',
    'bg-white/10',
    'text-black',
    'text-gray-600',
    'bg-gray-100',
    'bg-gray-100/30',
    'hover:bg-gray-100',
    
    // Shadows and effects
    'shadow-teal-500/25',
    'shadow-teal-500/40',
    'shadow-green-500/30',
    'shadow-green-400/50',
    'shadow-purple-500/25',
    'shadow-purple-500/40',
    'shadow-orange-500/25',
    'shadow-orange-500/40',
    
    // Ring effects
    'ring-teal-400/30',
    'ring-amber-400/40',
    'ring-purple-400/30',
    'ring-orange-400/30',
    
    // Overlay effects
    'from-teal-500/15',
    'to-teal-900/15',
    'from-amber-500/10',
    'to-green-900/10',
    'from-purple-500/15',
    'to-purple-900/15',
    'from-orange-500/15',
    'to-orange-900/15',
    
    // Dynamic gradients
    {
      pattern: /^(bg-gradient-to-[a-z]+|from-[a-z]+-[0-9]+|to-[a-z]+-[0-9]+|via-[a-z]+-[0-9]+)/,
    },
    {
      pattern: /^(text-[a-z]+-[0-9]+|bg-[a-z]+-[0-9]+\/[0-9]+|border-[a-z]+-[0-9]+\/[0-9]+)/,
    },
    {
      pattern: /^(hover:bg-[a-z]+-[0-9]+|hover:text-[a-z]+-[0-9]+|hover:border-[a-z]+-[0-9]+)/,
    }
  ],
};
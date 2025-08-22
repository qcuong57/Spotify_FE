import { useContext } from "react";

// Import ThemeContext từ ThemeProvider
import { ThemeContext } from "./ThemeProvider";

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Định nghĩa các theme với complete color system
export const themes = {
  pixelCyberpunk: {
    id: "pixelCyberpunk",
    name: "Pixel Cyberpunk 🌃💫",
    emoji: "🌃",
    description:
      "Thế giới pixel cyberpunk với màu xanh lá mystical và ánh đèn neon",
    colors: {
      primary: "emerald",
      secondary: "teal",
      accent: "violet",
      background: "from-slate-800 via-emerald-900 to-teal-800",
      backgroundOverlay: "from-slate-800/70 via-emerald-900/70 to-teal-800/70",
      card: "emerald-900/40",
      cardHover: "teal-800/60",
      text: "emerald-200",
      textHover: "teal-200",
      button: "emerald-400/80",
      buttonHover: "violet-400/80",
      border: "emerald-600/40",
      gradient: "from-emerald-400 via-teal-400 to-violet-400",

      // Song component colors
      songCard: "emerald-900/40",
      songCardHover: "teal-800/60",
      songBorder: "emerald-600/50",
      songBorderHover: "violet-500/60",
      songText: "white",
      songTextHover: "emerald-100",
      songTextCurrent: "violet-300",
      songArtist: "emerald-200",
      songArtistHover: "teal-200",
      songPlayCount: "emerald-300",
      songPlayCountHover: "violet-300",
      songButton: "gradient-to-r from-emerald-500 to-teal-500",
      songButtonHover: "gradient-to-r from-teal-400 to-violet-400",
      songButtonText: "white",
      songShadow: "emerald-500/30",
      songShadowHover: "violet-500/40",
      songRing: "emerald-400/40",
      songOverlay: "from-emerald-600/20 via-teal-700/15 to-violet-600/20",
      songIndicator: "violet-300",

      // Dynamic card backgrounds
      cardBg: "from-slate-900/80 via-emerald-900/80 to-teal-900/80",
      cardBgHover: "from-slate-800/90 via-emerald-800/90 to-teal-800/90",
      cardBgActive: "from-emerald-800/90 via-teal-800/90 to-violet-800/90",

      // Album art overlays
      albumOverlay: "from-emerald-600/20 via-teal-700/15 to-violet-600/20",
      albumOverlayHover: "from-emerald-500/15 via-violet-400/10 to-teal-500/15",

      // Rank badges
      rankGold: "from-yellow-400 to-orange-400",
      rankSilver: "from-slate-300 to-slate-400",
      rankBronze: "from-orange-400 to-red-400",
      rankDefault: "from-emerald-400 to-violet-400",

      // RGB values for dynamic styling
      rgb: {
        cardGradient: {
          normal:
            "rgba(15, 23, 42, 0.8), rgba(6, 78, 59, 0.8), rgba(17, 94, 89, 0.8)",
          hover:
            "rgba(30, 41, 59, 0.9), rgba(6, 95, 70, 0.9), rgba(15, 118, 110, 0.9)",
        },
        buttonGradient: {
          normal: "rgb(16, 185, 129), rgb(20, 184, 166)", // emerald-500, teal-500
          hover: "rgb(45, 212, 191), rgb(139, 92, 246)", // teal-400, violet-400
        },
        overlayGradient:
          "rgba(5, 150, 105, 0.2), rgba(15, 118, 110, 0.15), rgba(124, 58, 237, 0.2)",
        albumOverlayGradient: {
          normal:
            "rgba(5, 150, 105, 0.2), rgba(15, 118, 110, 0.15), rgba(124, 58, 237, 0.2)",
          hover:
            "rgba(16, 185, 129, 0.15), rgba(139, 92, 246, 0.1), rgba(45, 212, 191, 0.15)",
        },
      },
    },
    backgroundImage:
      "https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/W_d8+O.gif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9XX2Q4K08uZ2lmIiwiaWF0IjoxNzU1ODY5NTAxLCJleHAiOjE3ODc0MDU1MDF9.tfHSP9UXd_jM7dqi5d27ErqbR6fFABWjs7PVyuEUOVQ", // Pixel pattern overlay
    particles: ["💾", "🔮", "⚡", "🌐", "💫", "🎮", "🔹", "💎", "🌟"],
  },
  // Thêm vào file themeContext.js

  villagePixelArt: {
    id: "villagePixelArt",
    name: "Làng Cổ Tích Pixel 🏰✨",
    emoji: "🏰",
    description:
      "Thế giới làng cổ tích pixel art với background trầm và font chữ nổi bật",
    colors: {
      primary: "amber",
      secondary: "emerald",
      accent: "sky",
      background: "from-slate-700 via-slate-800 to-slate-900",
      backgroundOverlay: "from-slate-700/80 via-slate-800/80 to-slate-900/80",
      card: "slate-800/60",
      cardHover: "slate-700/80",
      text: "amber-200", // Font chữ nổi bật
      textHover: "amber-100",
      button: "amber-400/90",
      buttonHover: "emerald-400/90",
      border: "amber-500/40",
      gradient: "from-amber-400 via-emerald-400 to-sky-400",

      // Song component colors - font chữ nổi bật
      songCard: "slate-800/60",
      songCardHover: "slate-700/80",
      songBorder: "amber-500/50",
      songBorderHover: "emerald-400/60",
      songText: "amber-100", // Font chữ chính nổi bật
      songTextHover: "amber-50",
      songTextCurrent: "emerald-300", // Bài hát đang phát
      songArtist: "amber-200", // Tên nghệ sĩ nổi bật
      songArtistHover: "emerald-200",
      songPlayCount: "amber-300", // Lượt phát nổi bật
      songPlayCountHover: "emerald-300",
      songButton: "gradient-to-r from-amber-500 to-emerald-500",
      songButtonHover: "gradient-to-r from-amber-400 to-sky-400",
      songButtonText: "white",
      songShadow: "amber-500/30",
      songShadowHover: "emerald-500/40",
      songRing: "amber-400/40",
      songOverlay: "from-amber-600/20 via-emerald-700/15 to-sky-600/20",
      songIndicator: "emerald-300",

      // Dynamic card backgrounds - background trầm
      cardBg: "from-slate-800/90 via-slate-900/90 to-slate-800/90",
      cardBgHover: "from-slate-700/95 via-slate-800/95 to-slate-700/95",
      cardBgActive: "from-slate-700/95 via-slate-800/95 to-slate-700/95",

      // Album art overlays
      albumOverlay: "from-slate-800/60 via-slate-900/50 to-slate-800/60",
      albumOverlayHover: "from-amber-900/20 via-emerald-900/15 to-sky-900/20",

      // Rank badges
      rankGold: "from-yellow-400 to-amber-500",
      rankSilver: "from-slate-300 to-slate-400",
      rankBronze: "from-orange-400 to-red-400",
      rankDefault: "from-amber-400 to-emerald-400",

      // RGB values for dynamic styling
      rgb: {
        cardGradient: {
          normal:
            "rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9)",
          hover:
            "rgba(51, 65, 85, 0.95), rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95)",
        },
        buttonGradient: {
          normal: "rgb(245, 158, 11), rgb(16, 185, 129)", // amber-500, emerald-500
          hover: "rgb(251, 191, 36), rgb(56, 189, 248)", // amber-400, sky-400
        },
        overlayGradient:
          "rgba(180, 83, 9, 0.2), rgba(6, 95, 70, 0.15), rgba(7, 89, 133, 0.2)",
        albumOverlayGradient: {
          normal:
            "rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.6)",
          hover:
            "rgba(180, 83, 9, 0.2), rgba(6, 95, 70, 0.15), rgba(7, 89, 133, 0.2)",
        },
      },
    },
    backgroundImage:
      "https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/gif2.gif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9naWYyLmdpZiIsImlhdCI6MTc1NTg2OTc2NCwiZXhwIjoxNzg3NDA1NzY0fQ.P2VM2Lhh7yX3UM-sSeKGrP54jNN1ln9CrUzy21rlyiQ", // Link ảnh làng cổ tích pixel art
    particles: ["🏰", "🌟", "✨", "🦋", "🌿", "🏘️", "⛰️", "🏛️", "🎪"],
  }, // Thêm vào file themeContext.js trong object themes
  // Thêm vào file themeContext.js trong object themes
  cherryBlossom: {
    id: "cherryBlossom",
    name: "Hoa Anh Đào Nhẹ Nhàng 🌸",
    emoji: "🌸",
    description:
      "Thế giới hoa anh đào pixel art với tone màu pastel dịu dàng, thư giãn",
    colors: {
      primary: "rose",
      secondary: "pink",
      accent: "white",
      background: "from-rose-600 via-pink-600 to-rose-500",
      backgroundOverlay: "from-rose-600/40 via-pink-600/40 to-rose-500/40", // giảm mạnh opacity
      card: "rose-700/25",
      cardHover: "rose-600/40",
      text: "rose-50",
      textHover: "white",
      button: "rose-400/60",
      buttonHover: "rose-300/70",
      border: "rose-500/30",
      gradient: "from-rose-50 via-white to-rose-100",

      // Song component colors
      songCard: "rose-700/25",
      songCardHover: "rose-600/40",
      songBorder: "rose-500/25",
      songBorderHover: "rose-400/30",
      songText: "rose-50",
      songTextHover: "white",
      songTextCurrent: "white",
      songArtist: "rose-100",
      songArtistHover: "white",
      songPlayCount: "rose-200",
      songPlayCountHover: "rose-50",
      songButton: "gradient-to-r from-rose-400 to-pink-300",
      songButtonHover: "gradient-to-r from-rose-300 to-pink-200",
      songButtonText: "white",
      songShadow: "rose-800/15",
      songShadowHover: "rose-700/25",
      songRing: "rose-300/25",
      songOverlay: "from-rose-800/10 via-pink-700/8 to-rose-700/10",
      songIndicator: "white",

      // Dynamic card backgrounds
      cardBg: "from-rose-700/40 via-pink-700/40 to-rose-900/40",
      cardBgHover: "from-rose-600/55 via-pink-600/55 to-rose-500/55",
      cardBgActive: "from-rose-600/55 via-pink-600/55 to-rose-500/55",

      // Album art overlays
      albumOverlay: "from-rose-800/15 via-pink-700/10 to-rose-700/15",
      albumOverlayHover: "from-rose-700/20 via-pink-600/15 to-rose-600/20",

      // Rank badges
      rankGold: "from-yellow-300 to-amber-400",
      rankSilver: "from-gray-200 to-slate-300",
      rankBronze: "from-orange-300 to-red-400",
      rankDefault: "from-white to-rose-100",

      // RGB values for dynamic styling
      rgb: {
        cardGradient: {
          normal:
            "rgba(190, 18, 60, 0.4), rgba(219, 39, 119, 0.4), rgba(225, 29, 72, 0.4)",
          hover:
            "rgba(225, 29, 72, 0.55), rgba(219, 39, 119, 0.55), rgba(244, 63, 94, 0.55)",
        },
        buttonGradient: {
          normal: "rgb(251, 113, 133), rgb(249, 168, 212)",
          hover: "rgb(252, 165, 165), rgb(251, 207, 232)",
        },
        overlayGradient:
          "rgba(159, 18, 57, 0.1), rgba(190, 24, 93, 0.08), rgba(190, 18, 60, 0.1)",
        albumOverlayGradient: {
          normal:
            "rgba(159, 18, 57, 0.15), rgba(190, 24, 93, 0.1), rgba(190, 18, 60, 0.15)",
          hover:
            "rgba(190, 18, 60, 0.2), rgba(219, 39, 119, 0.15), rgba(225, 29, 72, 0.2)",
        },
      },
    },
    backgroundImage:
      "https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/gif5.gif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9naWY1LmdpZiIsImlhdCI6MTc1NTg3MTIwOCwiZXhwIjoxNzg3NDA3MjA4fQ.RT7wKR4jg4te7wm1oYb0I56_-Qe8EMq9M3MDILoe1Po",
    particles: ["🌸", "🌺", "🦋", "✨", "🌿", "💕", "🌙", "⭐", "🕊️"],
  },
  ocean: {
    id: "ocean",
    name: "Đại dương ngáo ngơ",
    emoji: "🐠",
    description: "Chủ đề biển cả với cá và san hô",
    colors: {
      primary: "teal",
      secondary: "emerald",
      accent: "cyan",
      background: "from-teal-900 via-teal-800 to-teal-700",
      backgroundOverlay: "from-teal-900/50 via-teal-800/50 to-teal-700/50",
      card: "teal-900/30",
      cardHover: "teal-800/50",
      text: "teal-300",
      textHover: "emerald-300",
      button: "teal-300/70",
      buttonHover: "emerald-400/70",
      border: "teal-700/30",
      gradient: "from-teal-400 to-emerald-400",

      // Song component colors
      songCard: "teal-900/30",
      songCardHover: "teal-800/50",
      songBorder: "teal-700/30",
      songBorderHover: "teal-400/20",
      songText: "white",
      songTextHover: "teal-200",
      songTextCurrent: "emerald-400",
      songArtist: "teal-300",
      songArtistHover: "emerald-400",
      songPlayCount: "teal-300",
      songPlayCountHover: "emerald-300",
      songButton: "teal-300/70",
      songButtonHover: "emerald-400/70",
      songButtonText: "teal-900",
      songShadow: "teal-500/25",
      songShadowHover: "teal-500/40",
      songRing: "teal-400/30",
      songOverlay: "from-teal-500/15 via-transparent to-teal-900/15",
      songIndicator: "teal-300",

      // Dynamic card backgrounds
      cardBg: "from-teal-900/60 via-teal-900/60 to-emerald-900/60",
      cardBgHover: "from-teal-900/80 via-teal-900/80 to-emerald-900/80",
      cardBgActive: "from-teal-900/80 via-teal-900/80 to-emerald-900/80",

      // Album art overlays
      albumOverlay: "from-teal-500/15 via-transparent to-teal-900/15",
      albumOverlayHover: "from-teal-400/10 via-emerald-300/5 to-teal-600/10",

      // Rank badges
      rankGold: "from-amber-400 to-yellow-500",
      rankSilver: "from-gray-300 to-gray-400",
      rankBronze: "from-amber-600 to-orange-500",
      rankDefault: "from-teal-400 to-emerald-500",

      // RGB values for dynamic styling
      rgb: {
        // Card gradients
        cardGradient: {
          normal:
            "rgba(15, 118, 110, 0.6), rgba(6, 95, 70, 0.6), rgba(6, 120, 95, 0.6)",
          hover:
            "rgba(15, 118, 110, 0.8), rgba(6, 95, 70, 0.8), rgba(6, 120, 95, 0.8)",
        },
        // Button gradients
        buttonGradient: {
          normal: "rgb(15, 118, 110), rgb(5, 150, 105)", // teal-600, emerald-600
          hover: "rgb(20, 184, 166), rgb(16, 185, 129)", // teal-500, emerald-500
        },
        // Overlay gradients
        overlayGradient:
          "rgba(20, 184, 166, 0.1), rgba(52, 211, 153, 0.05), rgba(15, 118, 110, 0.1)",
        // Album overlay
        albumOverlayGradient: {
          normal:
            "rgba(20, 184, 166, 0.15), transparent, rgba(15, 118, 110, 0.15)",
          hover:
            "rgba(20, 184, 166, 0.1), rgba(52, 211, 153, 0.05), rgba(15, 118, 110, 0.1)",
        },
      },
    },
    backgroundImage:
      "https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/abcccccc.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9hYmNjY2NjYy5wbmciLCJpYXQiOjE3NTQxNDcxMjIsImV4cCI6MjA2OTUwNzEyMn0.pYqd1AjFr3DqSxnf0CiQoq1eKpFiIPSPH_ooRlSpIyI",
    particles: ["🫧", "🫧", "🫧", "🫧", "🫧", "🫧", "🫧", "🫧"],
  },

  forest: {
    id: "forest",
    name: "Rừng bí ẩn mà hổng bí",
    emoji: "🌲",
    description: "Chủ đề rừng xanh với thiên nhiên",
    colors: {
      primary: "green",
      secondary: "amber",
      accent: "emerald",
      background: "from-green-900 via-green-800 to-emerald-700",
      backgroundOverlay: "from-green-900/50 via-green-800/50 to-emerald-700/50",
      card: "green-900/30",
      cardHover: "green-800/50",
      text: "green-300",
      textHover: "amber-300",
      button: "amber-400/80",
      buttonHover: "amber-300/90",
      border: "amber-600/40",
      gradient: "from-green-400 to-amber-400",

      // Song component colors
      songCard: "green-900/30",
      songCardHover: "green-800/40",
      songBorder: "amber-500/50",
      songBorderHover: "amber-400/60",
      songText: "white",
      songTextHover: "green-200",
      songTextCurrent: "amber-300",
      songArtist: "green-300",
      songArtistHover: "amber-300",
      songPlayCount: "green-300",
      songPlayCountHover: "amber-300",
      songButton: "gradient-to-r from-green-600 to-lime-500",
      songButtonHover: "gradient-to-r from-green-500 to-lime-400",
      songButtonText: "white",
      songShadow: "green-500/30",
      songShadowHover: "green-400/50",
      songRing: "amber-400/40",
      songOverlay: "from-amber-500/10 via-transparent to-green-900/10",
      songIndicator: "amber-400",

      // Dynamic card backgrounds
      cardBg: "from-green-900/60 via-green-900/60 to-emerald-900/60",
      cardBgHover: "from-green-900/80 via-green-900/80 to-emerald-900/80",
      cardBgActive: "from-green-900/80 via-green-900/80 to-emerald-900/80",

      // Album art overlays
      albumOverlay: "from-amber-500/15 via-transparent to-green-900/15",
      albumOverlayHover: "from-green-400/10 via-amber-300/5 to-green-600/10",

      // Rank badges
      rankGold: "from-amber-400 to-yellow-500",
      rankSilver: "from-gray-300 to-gray-400",
      rankBronze: "from-amber-600 to-orange-500",
      rankDefault: "from-green-400 to-amber-500",

      // RGB values for dynamic styling
      rgb: {
        cardGradient: {
          normal:
            "rgba(20, 83, 45, 0.6), rgba(22, 101, 52, 0.6), rgba(6, 120, 95, 0.6)",
          hover:
            "rgba(20, 83, 45, 0.8), rgba(22, 101, 52, 0.8), rgba(6, 120, 95, 0.8)",
        },
        buttonGradient: {
          normal: "rgb(22, 163, 74), rgb(101, 163, 13)", // green-600, lime-600
          hover: "rgb(34, 197, 94), rgb(132, 204, 22)", // green-500, lime-500
        },
        overlayGradient:
          "rgba(34, 197, 94, 0.1), rgba(245, 158, 11, 0.05), rgba(22, 163, 74, 0.1)",
        albumOverlayGradient: {
          normal:
            "rgba(245, 158, 11, 0.15), transparent, rgba(22, 163, 74, 0.15)",
          hover:
            "rgba(34, 197, 94, 0.1), rgba(245, 158, 11, 0.05), rgba(22, 163, 74, 0.1)",
        },
      },
    },
    backgroundImage:
      "https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/tree.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS90cmVlLnBuZyIsImlhdCI6MTc1NDIyMTk5MSwiZXhwIjoyMDY5NTgxOTkxfQ.k13CATHRnBrBYUMqG7MkJnssITIB-oVveoNxZ7-TLrA",
    particles: ["🌲", "🍃", "🦋", "🐛", "🌿"],
  },
  space: {
    id: "space",
    name: "Vũ trụ bao laaaaaa",
    emoji: "🌌",
    description: "Chủ đề vũ trụ với sao và hành tinh",
    colors: {
      primary: "purple",
      secondary: "pink",
      accent: "indigo",
      background: "from-purple-900 via-purple-800 to-indigo-700",
      backgroundOverlay:
        "from-purple-900/50 via-purple-800/50 to-indigo-700/50",
      card: "purple-900/30",
      cardHover: "purple-800/50",
      text: "purple-300",
      textHover: "pink-300",
      button: "purple-300/70",
      buttonHover: "pink-400/70",
      border: "purple-700/30",
      gradient: "from-purple-400 to-pink-400",

      // Song component colors
      songCard: "purple-900/30",
      songCardHover: "purple-800/50",
      songBorder: "purple-700/30",
      songBorderHover: "purple-400/20",
      songText: "white",
      songTextHover: "purple-200",
      songTextCurrent: "pink-400",
      songArtist: "purple-300",
      songArtistHover: "pink-400",
      songPlayCount: "purple-300",
      songPlayCountHover: "pink-300",
      songButton: "gradient-to-r from-purple-600 to-violet-500",
      songButtonHover: "gradient-to-r from-indigo-600 to-purple-500",
      songButtonText: "white",
      songShadow: "purple-500/25",
      songShadowHover: "purple-500/40",
      songRing: "purple-400/30",
      songOverlay: "from-purple-500/15 via-transparent to-purple-900/15",
      songIndicator: "purple-300",

      // Dynamic card backgrounds
      cardBg: "from-purple-900/60 via-purple-900/60 to-indigo-800/60",
      cardBgHover: "from-purple-900/80 via-purple-900/80 to-indigo-800/80",
      cardBgActive: "from-purple-900/80 via-purple-900/80 to-indigo-800/80",

      // Album art overlays
      albumOverlay: "from-purple-500/15 via-transparent to-purple-900/15",
      albumOverlayHover: "from-purple-400/10 via-pink-300/5 to-purple-600/10",

      // Rank badges
      rankGold: "from-amber-400 to-yellow-500",
      rankSilver: "from-gray-300 to-gray-400",
      rankBronze: "from-amber-600 to-orange-500",
      rankDefault: "from-purple-400 to-pink-500",

      // RGB values for dynamic styling
      rgb: {
        cardGradient: {
          normal:
            "rgba(88, 28, 135, 0.6), rgba(88, 28, 135, 0.6), rgba(55, 48, 163, 0.6)",
          hover:
            "rgba(88, 28, 135, 0.8), rgba(88, 28, 135, 0.8), rgba(55, 48, 163, 0.8)",
        },
        buttonGradient: {
          normal: "rgb(124, 58, 237), rgb(109, 40, 217)", // violet-600, violet-700
          hover: "rgb(139, 92, 246), rgb(124, 58, 237)", // violet-500, violet-600
        },
        overlayGradient:
          "rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.05), rgba(124, 58, 237, 0.1)",
        albumOverlayGradient: {
          normal:
            "rgba(168, 85, 247, 0.15), transparent, rgba(88, 28, 135, 0.15)",
          hover:
            "rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.05), rgba(124, 58, 237, 0.1)",
        },
      },
    },
    backgroundImage:
      "https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/purple.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9wdXJwbGUuanBlZyIsImlhdCI6MTc1NDIyMjM3NCwiZXhwIjoyMDY5NTgyMzc0fQ.ELBBsGxStjsfkU7a6sqUMVQNJVJde-Ft7m0nNjnv_ig",
    particles: ["⭐", "🌟", "✨", "🌙", "🪐"],
  },

  sunset: {
    id: "sunset",
    name: "Hoàng hôn siêu chillll =))",
    emoji: "🌅",
    description: "Chủ đề hoàng hôn ấm áp",
    colors: {
      primary: "orange",
      secondary: "amber",
      accent: "red",
      background: "from-orange-900 via-red-800 to-yellow-700",
      backgroundOverlay: "from-orange-900/50 via-red-800/50 to-yellow-700/50",
      card: "orange-900/30",
      cardHover: "orange-800/50",
      text: "orange-300",
      textHover: "amber-300",
      button: "orange-300/70",
      buttonHover: "amber-400/70",
      border: "orange-700/30",
      gradient: "from-orange-400 to-amber-400",

      // Song component colors
      songCard: "orange-900/30",
      songCardHover: "orange-800/50",
      songBorder: "orange-700/30",
      songBorderHover: "orange-400/20",
      songText: "white",
      songTextHover: "orange-200",
      songTextCurrent: "amber-400",
      songArtist: "orange-300",
      songArtistHover: "amber-400",
      songPlayCount: "orange-300",
      songPlayCountHover: "amber-300",
      songButton: "gradient-to-r from-orange-600 to-amber-500",
      songButtonHover: "gradient-to-r from-red-500 to-orange-400",
      songButtonText: "white",
      songShadow: "orange-500/25",
      songShadowHover: "orange-500/40",
      songRing: "orange-400/30",
      songOverlay: "from-orange-500/15 via-transparent to-orange-900/15",
      songIndicator: "orange-300",

      // Dynamic card backgrounds
      cardBg: "from-orange-900/60 via-red-900/60 to-yellow-900/60",
      cardBgHover: "from-orange-900/80 via-red-900/80 to-yellow-900/80",
      cardBgActive: "from-orange-900/80 via-red-900/80 to-yellow-900/80",

      // Album art overlays
      albumOverlay: "from-orange-500/15 via-transparent to-orange-900/15",
      albumOverlayHover: "from-orange-400/10 via-amber-300/5 to-orange-600/10",

      // Rank badges
      rankGold: "from-amber-400 to-yellow-500",
      rankSilver: "from-gray-300 to-gray-400",
      rankBronze: "from-amber-600 to-orange-500",
      rankDefault: "from-orange-400 to-amber-500",

      // RGB values for dynamic styling
      rgb: {
        cardGradient: {
          normal:
            "rgba(154, 52, 18, 0.6), rgba(153, 27, 27, 0.6), rgba(133, 77, 14, 0.6)",
          hover:
            "rgba(154, 52, 18, 0.8), rgba(153, 27, 27, 0.8), rgba(133, 77, 14, 0.8)",
        },
        buttonGradient: {
          normal: "rgb(234, 88, 12), rgb(217, 119, 6)", // orange-600, amber-600
          hover: "rgb(249, 115, 22), rgb(245, 158, 11)", // orange-500, amber-500
        },
        overlayGradient:
          "rgba(251, 146, 60, 0.1), rgba(245, 158, 11, 0.05), rgba(251, 146, 60, 0.1)",
        albumOverlayGradient: {
          normal:
            "rgba(251, 146, 60, 0.15), transparent, rgba(234, 88, 12, 0.15)",
          hover:
            "rgba(251, 146, 60, 0.1), rgba(245, 158, 11, 0.05), rgba(251, 146, 60, 0.1)",
        },
      },
    },
    backgroundImage:
      "https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/Sunset_1754223838308.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9TdW5zZXRfMTc1NDIyMzgzODMwOC5qcGVnIiwiaWF0IjoxNzU0MjIzOTY0LCJleHAiOjIwNjk1ODM5NjR9.vSAXjw3dhN3sbrlcfnBOV-MhGFM-VGuhvikNkTW5vHM",
    particles: ["🌅", "☀️", "🔥", "🍂", "🦋"],
  },
  kitten: {
    id: "kitten",
    name: "Mèo con siêu cute 🥰",
    emoji: "🐱",
    description: "Chủ đề mèo con đáng yêu với tông màu ấm áp",
    colors: {
      primary: "lime",
      secondary: "orange",
      accent: "yellow",
      background: "from-lime-800 via-green-700 to-orange-700",
      backgroundOverlay: "from-lime-800/50 via-green-700/50 to-orange-700/50",
      card: "lime-900/25",
      cardHover: "lime-800/40",
      text: "lime-200",
      textHover: "orange-200",
      button: "lime-300/70",
      buttonHover: "orange-300/70",
      border: "lime-600/30",
      gradient: "from-lime-300 to-orange-300",

      // Song component colors
      songCard: "lime-900/25",
      songCardHover: "lime-800/40",
      songBorder: "lime-600/40",
      songBorderHover: "orange-400/40",
      songText: "white",
      songTextHover: "lime-100",
      songTextCurrent: "orange-300",
      songArtist: "lime-200",
      songArtistHover: "orange-200",
      songPlayCount: "lime-200",
      songPlayCountHover: "orange-200",
      songButton: "gradient-to-r from-lime-500 to-orange-400",
      songButtonHover: "gradient-to-r from-lime-400 to-orange-300",
      songButtonText: "white",
      songShadow: "lime-400/20",
      songShadowHover: "orange-400/30",
      songRing: "lime-300/30",
      songOverlay: "from-lime-400/10 via-transparent to-orange-600/10",
      songIndicator: "orange-300",

      // Dynamic card backgrounds
      cardBg: "from-lime-900/50 via-green-900/50 to-orange-900/50",
      cardBgHover: "from-lime-900/70 via-green-900/70 to-orange-900/70",
      cardBgActive: "from-lime-900/70 via-green-900/70 to-orange-900/70",

      // Album art overlays
      albumOverlay: "from-lime-400/10 via-transparent to-orange-600/10",
      albumOverlayHover: "from-lime-300/8 via-yellow-200/5 to-orange-400/8",

      // Rank badges
      rankGold: "from-amber-400 to-yellow-500",
      rankSilver: "from-gray-300 to-gray-400",
      rankBronze: "from-amber-600 to-orange-500",
      rankDefault: "from-lime-400 to-orange-400",

      // RGB values for dynamic styling
      rgb: {
        cardGradient: {
          normal:
            "rgba(77, 124, 15, 0.5), rgba(20, 83, 45, 0.5), rgba(154, 52, 18, 0.5)",
          hover:
            "rgba(77, 124, 15, 0.7), rgba(20, 83, 45, 0.7), rgba(154, 52, 18, 0.7)",
        },
        buttonGradient: {
          normal: "rgb(101, 163, 13), rgb(249, 115, 22)", // lime-600, orange-500
          hover: "rgb(132, 204, 22), rgb(251, 146, 60)", // lime-500, orange-400
        },
        overlayGradient:
          "rgba(132, 204, 22, 0.1), rgba(251, 146, 60, 0.05), rgba(101, 163, 13, 0.1)",
        albumOverlayGradient: {
          normal:
            "rgba(132, 204, 22, 0.1), transparent, rgba(234, 88, 12, 0.1)",
          hover:
            "rgba(163, 230, 53, 0.08), rgba(254, 240, 138, 0.05), rgba(251, 146, 60, 0.08)",
        },
      },
    },
    backgroundImage:
      "https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/Cat2.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9DYXQyLmpwZWciLCJpYXQiOjE3NTQzOTAxMDgsImV4cCI6MjA2OTc1MDEwOH0.VKfIEeG4zLVWk93_VCDFH9HBhe-nSx3PJQneg9pMEMs", // Sẽ được cập nhật với URL ảnh mèo
    particles: ["🐱", "🐾", "🧶", "🥛", "🐈", "😸", "🎾", "🦋"],
  },
  darkmode: {
    id: "darkmode",
    name: "Màu đen bùn bã",
    emoji: "🖤",
    description: "Tone lào",
    colors: {
      primary: "gray",
      secondary: "zinc",
      accent: "lime",
      background: "from-neutral-900 via-zinc-900 to-gray-800",
      backgroundOverlay: "from-neutral-900/60 via-zinc-900/60 to-gray-800/60",
      card: "zinc-900/30",
      cardHover: "zinc-800/50",
      text: "zinc-300",
      textHover: "lime-300",
      button: "zinc-300/70",
      buttonHover: "lime-400/70",
      border: "zinc-700/30",
      gradient: "from-gray-500 to-lime-400",

      songCard: "zinc-900/30",
      songCardHover: "zinc-800/50",
      songBorder: "zinc-700/30",
      songBorderHover: "gray-400/20",
      songText: "white",
      songTextHover: "gray-200",
      songTextCurrent: "lime-400",
      songArtist: "zinc-300",
      songArtistHover: "lime-400",
      songPlayCount: "zinc-300",
      songPlayCountHover: "lime-300",
      songButton: "zinc-300/70",
      songButtonHover: "lime-400/70",
      songButtonText: "zinc-900",
      songShadow: "gray-500/25",
      songShadowHover: "gray-500/40",
      songRing: "gray-400/30",
      songOverlay: "from-gray-600/15 via-transparent to-zinc-900/15",
      songIndicator: "lime-300",

      cardBg: "from-zinc-900/60 via-neutral-900/60 to-gray-900/60",
      cardBgHover: "from-zinc-900/80 via-neutral-900/80 to-gray-900/80",
      cardBgActive: "from-zinc-900/80 via-neutral-900/80 to-gray-900/80",

      albumOverlay: "from-gray-500/15 via-transparent to-zinc-900/15",
      albumOverlayHover: "from-gray-400/10 via-lime-300/5 to-gray-600/10",

      rankGold: "from-amber-400 to-yellow-500",
      rankSilver: "from-gray-300 to-gray-400",
      rankBronze: "from-amber-600 to-orange-500",
      rankDefault: "from-gray-400 to-lime-500",

      rgb: {
        cardGradient: {
          normal:
            "rgba(24, 24, 27, 0.6), rgba(39, 39, 42, 0.6), rgba(31, 41, 55, 0.6)",
          hover:
            "rgba(24, 24, 27, 0.8), rgba(39, 39, 42, 0.8), rgba(31, 41, 55, 0.8)",
        },
        buttonGradient: {
          normal: "rgb(113, 113, 122), rgb(132, 204, 22)", // zinc-500, lime-500
          hover: "rgb(161, 161, 170), rgb(163, 230, 53)", // zinc-400, lime-400
        },
        overlayGradient:
          "rgba(63, 63, 70, 0.1), rgba(34, 197, 94, 0.05), rgba(24, 24, 27, 0.1)",
        albumOverlayGradient: {
          normal:
            "rgba(113, 113, 122, 0.15), transparent, rgba(24, 24, 27, 0.15)",
          hover:
            "rgba(132, 204, 22, 0.1), rgba(113, 113, 122, 0.05), rgba(24, 24, 27, 0.1)",
        },
      },
    },
    backgroundImage:
      "https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/Black.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9CbGFjay5wbmciLCJpYXQiOjE3NTQzOTY3NTMsImV4cCI6MTc4NTkzMjc1M30.PQ_SlY1I8Jl3owGoM8wspTfD7U7WiXBEEh1nmVvFEkc",
    particles: ["🎧", "🖤", "🎶", "🌑", "🌀"],
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Đỏ cam và đen",
    emoji: "🌃",
    description: "Không có gì",
    colors: {
      primary: "red",
      secondary: "green",
      accent: "lime",
      background: "from-black via-zinc-900 to-neutral-900",
      backgroundOverlay: "from-black/60 via-zinc-900/60 to-neutral-900/60",
      card: "zinc-900/30",
      cardHover: "zinc-800/50",
      text: "red-300",
      textHover: "green-300",
      button: "red-300/70",
      buttonHover: "green-400/70",
      border: "zinc-700/30",
      gradient: "from-red-500 to-lime-400",

      songCard: "zinc-900/30",
      songCardHover: "zinc-800/50",
      songBorder: "zinc-700/30",
      songBorderHover: "red-400/20",
      songText: "white",
      songTextHover: "green-200",
      songTextCurrent: "lime-400",
      songArtist: "red-300",
      songArtistHover: "lime-400",
      songPlayCount: "zinc-300",
      songPlayCountHover: "lime-300",
      songButton: "red-300/70",
      songButtonHover: "green-400/70",
      songButtonText: "zinc-900",
      songShadow: "red-500/25",
      songShadowHover: "red-500/40",
      songRing: "red-400/30",
      songOverlay: "from-red-600/15 via-transparent to-zinc-900/15",
      songIndicator: "lime-300",

      cardBg: "from-zinc-900/60 via-neutral-900/60 to-red-900/60",
      cardBgHover: "from-zinc-900/80 via-neutral-900/80 to-red-900/80",
      cardBgActive: "from-zinc-900/80 via-neutral-900/80 to-red-900/80",

      albumOverlay: "from-red-500/15 via-transparent to-zinc-900/15",
      albumOverlayHover: "from-red-400/10 via-lime-300/5 to-red-600/10",

      rankGold: "from-amber-400 to-yellow-500",
      rankSilver: "from-gray-300 to-gray-400",
      rankBronze: "from-amber-600 to-orange-500",
      rankDefault: "from-red-400 to-lime-500",

      rgb: {
        cardGradient: {
          normal:
            "rgba(24, 24, 27, 0.6), rgba(39, 39, 42, 0.6), rgba(220, 38, 38, 0.6)",
          hover:
            "rgba(24, 24, 27, 0.8), rgba(39, 39, 42, 0.8), rgba(220, 38, 38, 0.8)",
        },
        buttonGradient: {
          normal: "rgb(239, 68, 68), rgb(132, 204, 22)", // red-500, lime-500
          hover: "rgb(252, 165, 165), rgb(163, 230, 53)", // red-300, lime-400
        },
        overlayGradient:
          "rgba(239, 68, 68, 0.1), rgba(132, 204, 22, 0.05), rgba(24, 24, 27, 0.1)",
        albumOverlayGradient: {
          normal:
            "rgba(239, 68, 68, 0.15), transparent, rgba(24, 24, 27, 0.15)",
          hover:
            "rgba(132, 204, 22, 0.1), rgba(239, 68, 68, 0.05), rgba(24, 24, 27, 0.1)",
        },
      },
    },
    backgroundImage:
      "https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/phongcanh.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9waG9uZ2NhbmguanBnIiwiaWF0IjoxNzU0Mzk5MjU5LCJleHAiOjE3ODU5MzUyNTl9.3Wx7uceoO7bFTgLjmft6XO9oFB99snllaNiugiNyYCs",
    particles: ["🔺", "🟥", "🟩", "🌀", "💡"],
  },
  autumn: {
    id: "autumn",
    name: "Mùa thu vàng rụng lá 🍁",
    emoji: "🍂",
    description: "Chủ đề mùa thu ấm áp, vàng cam dịu nhẹ",
    colors: {
      primary: "amber",
      secondary: "orange",
      accent: "yellow",
      background: "from-amber-900 via-orange-800 to-yellow-700",
      backgroundOverlay: "from-amber-900/50 via-orange-800/50 to-yellow-700/50",
      card: "amber-900/30",
      cardHover: "amber-800/50",
      text: "amber-200",
      textHover: "orange-200",
      button: "orange-300/70",
      buttonHover: "yellow-400/70",
      border: "amber-600/30",
      gradient: "from-orange-400 to-yellow-400",

      songCard: "amber-900/30",
      songCardHover: "amber-800/50",
      songBorder: "amber-700/30",
      songBorderHover: "orange-400/20",
      songText: "white",
      songTextHover: "amber-100",
      songTextCurrent: "yellow-300",
      songArtist: "amber-300",
      songArtistHover: "yellow-300",
      songPlayCount: "amber-300",
      songPlayCountHover: "yellow-300",
      songButton: "gradient-to-r from-orange-600 to-yellow-500",
      songButtonHover: "gradient-to-r from-orange-500 to-amber-400",
      songButtonText: "white",
      songShadow: "amber-500/25",
      songShadowHover: "amber-500/40",
      songRing: "amber-400/30",
      songOverlay: "from-orange-500/15 via-transparent to-amber-900/15",
      songIndicator: "orange-300",

      cardBg: "from-orange-900/60 via-amber-800/60 to-yellow-700/60",
      cardBgHover: "from-orange-900/80 via-amber-800/80 to-yellow-700/80",
      cardBgActive: "from-orange-900/80 via-amber-800/80 to-yellow-700/80",

      albumOverlay: "from-orange-500/15 via-transparent to-amber-900/15",
      albumOverlayHover: "from-orange-400/10 via-yellow-300/5 to-amber-600/10",

      rankGold: "from-yellow-400 to-yellow-500",
      rankSilver: "from-gray-300 to-gray-400",
      rankBronze: "from-amber-600 to-orange-500",
      rankDefault: "from-orange-400 to-yellow-500",

      rgb: {
        cardGradient: {
          normal:
            "rgba(245, 158, 11, 0.6), rgba(234, 88, 12, 0.6), rgba(202, 138, 4, 0.6)",
          hover:
            "rgba(245, 158, 11, 0.8), rgba(234, 88, 12, 0.8), rgba(202, 138, 4, 0.8)",
        },
        buttonGradient: {
          normal: "rgb(234, 88, 12), rgb(202, 138, 4)", // orange-600, yellow-600
          hover: "rgb(249, 115, 22), rgb(253, 224, 71)", // orange-500, yellow-300
        },
        overlayGradient:
          "rgba(251, 191, 36, 0.1), rgba(251, 146, 60, 0.05), rgba(245, 158, 11, 0.1)",
        albumOverlayGradient: {
          normal:
            "rgba(251, 191, 36, 0.15), transparent, rgba(234, 88, 12, 0.15)",
          hover:
            "rgba(253, 224, 71, 0.1), rgba(251, 146, 60, 0.05), rgba(245, 158, 11, 0.1)",
        },
      },
    },
    backgroundImage:
      "https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/autunm.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9hdXR1bm0uanBlZyIsImlhdCI6MTc1NDUzMTkwMywiZXhwIjoyMDY5ODkxOTAzfQ.qsNb7wZEAh72xbuRlch-nrTQMgNLNm4vJRCeY97FWP0", // bạn có thể upload ảnh này lên Supabase và thay URL
    particles: ["🍂", "🍁", "🌰", "🦊", "🌾", "🧡", "🍄", "🪵"],
  },
  winter: {
    id: "winter",
    name: "Mùa đông cảm lạnh",
    emoji: "❄️",
    description: "Chủ đề mùa đông ấm áp và thư giãn",
    colors: {
      primary: "sky",
      secondary: "blue",
      accent: "cyan",
      background: "from-sky-700 via-sky-600 to-blue-600",
      backgroundOverlay: "from-sky-700/50 via-sky-600/50 to-blue-600/50",
      card: "sky-800/30",
      cardHover: "sky-700/50",
      text: "sky-200",
      textHover: "blue-200",
      button: "sky-300/70",
      buttonHover: "blue-300/70",
      border: "sky-500/30",
      gradient: "from-sky-300 to-blue-300",

      // Song component colors
      songCard: "sky-800/30",
      songCardHover: "sky-700/40",
      songBorder: "sky-500/50",
      songBorderHover: "sky-300/60",
      songText: "white",
      songTextHover: "sky-100",
      songTextCurrent: "cyan-300",
      songArtist: "sky-200",
      songArtistHover: "cyan-200",
      songPlayCount: "sky-200",
      songPlayCountHover: "cyan-200",
      songButton: "gradient-to-r from-sky-500 to-blue-400",
      songButtonHover: "gradient-to-r from-sky-400 to-blue-300",
      songButtonText: "white",
      songShadow: "sky-400/25",
      songShadowHover: "sky-300/40",
      songRing: "sky-300/30",
      songOverlay: "from-sky-400/10 via-transparent to-sky-700/10",
      songIndicator: "cyan-300",

      // Dynamic card backgrounds
      cardBg: "from-sky-800/60 via-sky-700/60 to-blue-700/60",
      cardBgHover: "from-sky-800/80 via-sky-700/80 to-blue-700/80",
      cardBgActive: "from-sky-800/80 via-sky-700/80 to-blue-700/80",

      // Album art overlays
      albumOverlay: "from-sky-400/10 via-transparent to-sky-700/10",
      albumOverlayHover: "from-sky-300/10 via-cyan-200/5 to-sky-500/10",

      // Rank badges
      rankGold: "from-amber-400 to-yellow-500",
      rankSilver: "from-gray-300 to-gray-400",
      rankBronze: "from-amber-600 to-orange-500",
      rankDefault: "from-sky-400 to-blue-400",

      // RGB values for dynamic styling
      rgb: {
        cardGradient: {
          normal:
            "rgba(7, 89, 133, 0.6), rgba(3, 105, 161, 0.6), rgba(29, 78, 216, 0.6)",
          hover:
            "rgba(7, 89, 133, 0.8), rgba(3, 105, 161, 0.8), rgba(29, 78, 216, 0.8)",
        },
        buttonGradient: {
          normal: "rgb(14, 165, 233), rgb(59, 130, 246)", // sky-500, blue-500
          hover: "rgb(56, 189, 248), rgb(96, 165, 250)", // sky-400, blue-400
        },
        overlayGradient:
          "rgba(56, 189, 248, 0.1), rgba(34, 211, 238, 0.05), rgba(14, 165, 233, 0.1)",
        albumOverlayGradient: {
          normal:
            "rgba(56, 189, 248, 0.1), transparent, rgba(3, 105, 161, 0.15)",
          hover:
            "rgba(125, 211, 252, 0.1), rgba(34, 211, 238, 0.05), rgba(14, 165, 233, 0.1)",
        },
      },
    },
    backgroundImage:
      "https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/winter.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS93aW50ZXIuanBlZyIsImlhdCI6MTc1NDM4ODg4OCwiZXhwIjoyMDY5NzQ4ODg4fQ.r4498DuWO9muYJjrmgjjQ6ZYZFbKdVDemgmXJFoqJeA",
    particles: ["❄️", "🌨️", "⛄", "🏔️", "🧊", "☃️", "❄️", "🌨️"],
  },
};

// 2. ThemeSelector.jsx - Component để chọn theme
import React from "react";
import { IconX, IconPalette } from "@tabler/icons-react";
import { useTheme } from "../../context/themeContext.js";

const ThemeCard = ({ theme, isActive, onClick }) => {
  return (
    <div
      className={`
        relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300
        ${
          isActive
            ? "ring-4 ring-white/50 shadow-2xl scale-105"
            : "hover:scale-102 hover:shadow-xl"
        }
      `}
      onClick={() => onClick(theme.id)}
    >
      {/* Background preview */}
      <div
        className={`
          h-32 w-full bg-gradient-to-br ${theme.colors.background}
          relative overflow-hidden
        `}
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${theme.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Theme emoji */}
        <div className="absolute top-2 right-2 text-2xl">{theme.emoji}</div>

        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-2 left-2">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Theme info */}
      <div
        className={`p-4 bg-gradient-to-r ${theme.colors.backgroundOverlay} backdrop-blur-sm`}
      >
        <h3 className="text-white font-semibold text-sm">{theme.name}</h3>
      </div>
    </div>
  );
};

const ThemeSelector = () => {
  const {
    themes,
    currentTheme,
    changeTheme,
    showThemeSelector,
    setShowThemeSelector,
  } = useTheme();

  if (!showThemeSelector) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowThemeSelector(false)}
      />

      {/* Modal */}
      <div className="relative bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <IconPalette className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Chọn Chủ Đề</h2>
              <p className="text-gray-400 text-sm">
                Tùy chỉnh giao diện theo sở thích của bạn
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowThemeSelector(false)}
            className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
          >
            <IconX className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(themes).map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={currentTheme === theme.id}
              onClick={changeTheme}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <p className="text-gray-400 text-sm text-center">
            Supported by Claude®
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;

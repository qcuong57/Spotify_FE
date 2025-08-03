// 3. ThemeButton.jsx - Button để mở theme selector
import React from 'react';
import { IconPalette } from '@tabler/icons-react';
import { useTheme } from './ThemeContext';

const ThemeButton = ({ className = '' }) => {
  const { setShowThemeSelector, theme } = useTheme();

  return (
    <button
      onClick={() => setShowThemeSelector(true)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full
        bg-gradient-to-r ${theme.colors.backgroundOverlay}
        hover:from-${theme.colors.primary}-400/70 hover:to-${theme.colors.secondary}-400/70
        text-${theme.colors.text} hover:text-white
        border border-${theme.colors.border}
        transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-lg
        backdrop-blur-sm
        ${className}
      `}
      title="Thay đổi chủ đề"
    >
      <IconPalette className="w-5 h-5" />
      <span className="text-sm font-medium hidden sm:block">Chủ đề</span>
    </button>
  );
};

export default ThemeButton;
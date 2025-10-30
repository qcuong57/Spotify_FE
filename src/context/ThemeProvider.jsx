import React, { createContext, useState, useEffect } from 'react';
import { themes } from './themeContext'; // Import predefined themes
import PropTypes from 'prop-types';

// Tạo ThemeContext trong file này
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('darkmode');
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Load theme từ localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('uia-music-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Lưu theme vào localStorage
  const changeTheme = (themeId) => {
    if (themes[themeId]) {
      setCurrentTheme(themeId);
      localStorage.setItem('uia-music-theme', themeId);
    }
  };

  const theme = themes[currentTheme];

  const value = {
    currentTheme,
    theme,
    themes,
    changeTheme,
    showThemeSelector,
    setShowThemeSelector
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { ThemeContext };
export default ThemeProvider;
// 4. ThemeParticles.jsx - Component hiệu ứng hạt theo theme
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/themeContext.js';

const ThemeParticles = () => {
  const { theme } = useTheme();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Tạo particles ngẫu nhiên
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      emoji: theme.particles[Math.floor(Math.random() * theme.particles.length)],
      left: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 8 + Math.random() * 4,
      size: 0.8 + Math.random() * 0.4
    }));
    setParticles(newParticles);
  }, [theme]);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-float opacity-20 hover:opacity-40 transition-opacity"
            style={{
              left: `${particle.left}%`,
              fontSize: `${particle.size}rem`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`,
            }}
          >
            {particle.emoji}
          </div>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0% {
              transform: translateY(100vh) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 0.2;
            }
            90% {
              opacity: 0.1;
            }
            100% {
              transform: translateY(-100px) rotate(360deg);
              opacity: 0;
            }
          }
          
          .animate-float {
            animation: float linear infinite;
          }
        `
      }} />
    </>
  );
};

export { ThemeParticles };
import React, { memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/themeContext";

const errorVariants = {
  initial: { opacity: 0, scale: 0.9, y: 30 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

const loadingVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    }
  }
};

const ErrorState = memo(({ error }) => {
  const { theme } = useTheme();
  const isTokenError = error.includes("Phiên đăng nhập đã hết hạn") || 
                      error.includes("đăng nhập lại");

  return (
    <motion.div 
      className="text-white p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto scrollbar-spotify"
      variants={errorVariants}
      initial="initial"
      animate="animate"
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          className="text-center space-y-6"
          variants={loadingVariants}
          initial="initial"
          animate="animate"
        >
          {/* Error Icon */}
          <div className="relative">
            <motion.div 
              className="w-32 h-32 mx-auto flex items-center justify-center"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: isTokenError ? [0, 5, -5, 0] : [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${isTokenError ? 'from-amber-400 to-orange-600' : 'from-red-400 to-red-600'} rounded-full flex items-center justify-center`}>
                <motion.svg 
                  className="w-10 h-10 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: "backOut" }}
                >
                  {isTokenError ? (
                    <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
                  ) : (
                    <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
                  )}
                </motion.svg>
              </div>
            </motion.div>
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <motion.h2 
              className={`text-2xl font-bold ${isTokenError ? 'text-amber-400' : 'text-red-400'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {isTokenError ? 'Phiên đăng nhập hết hạn' : 'Lỗi tải dữ liệu'}
            </motion.h2>
            <motion.p 
              className={`text-${theme.colors.text} max-w-md mx-auto leading-relaxed`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {error}
            </motion.p>
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            <motion.button
              onClick={() => window.location.reload()}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                isTokenError 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white'
                  : `bg-${theme.colors.secondary}-500 hover:bg-${theme.colors.secondary}-600 text-white`
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {isTokenError ? 'Đăng nhập lại' : 'Thử lại'}
            </motion.button>
            
            {isTokenError && (
              <motion.p 
                className={`text-sm text-${theme.colors.text}/60`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                Bạn sẽ được chuyển đến trang đăng nhập
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

export default ErrorState;
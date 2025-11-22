// ColorPalettePopup.jsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconX } from "@tabler/icons-react";

const ColorPalettePopup = ({
  isVisible,
  onClose,
  gradients,
  currentGradient,
  onSelectGradient,
}) => {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[21000] flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          transition={{ duration: 0.2 }}
        >
          {/* Lớp nền mờ (nhấp để đóng) */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          ></div>

          {/* Nội dung Modal */}
          <motion.div
            className="relative z-10 w-full max-w-lg p-6 bg-gray-800/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl"
            variants={modalVariants}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Chọn Nền 3D</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <IconX size={22} />
              </button>
            </div>

            {/* Lưới Gradient */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar-thin">
              {gradients.map((grad) => (
                <div
                  key={grad.id}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                  onClick={() => {
                    onSelectGradient(grad);
                    onClose(); // Tự động đóng popup khi chọn
                  }}
                >
                  {/* Ô màu preview */}
                  <div
                    className={`w-full aspect-square rounded-lg border-2 transition-all duration-200 ${
                      currentGradient.id === grad.id
                        ? "border-white shadow-lg"
                        : "border-transparent group-hover:border-white/50"
                    }`}
                    style={{
                      // SỬ DỤNG cssBackground TỪ FILE CẤU HÌNH MỚI
                      background: grad.cssBackground,
                    }}
                  ></div>
                  <span className="text-xs text-white/80 text-center truncate w-full">
                    {grad.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Style cho thanh cuộn
const styles = `
.custom-scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}
.custom-scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  border: transparent;
}
`;

if (typeof window !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default ColorPalettePopup;

// ColorPalettePopup.jsx (Đã cập nhật)

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
            // --- THAY ĐỔI 1: Tăng chiều rộng ---
            className="relative z-10 w-full max-w-lg p-6 bg-gray-800/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl" // max-w-md đổi thành max-w-lg
            variants={modalVariants}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Chọn Nền
              </h2>
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
                    onClose(); // --- THAY ĐỔI 2: Tự động đóng khi chọn ---
                  }}
                >
                  <div
                    // --- THAY ĐỔI 3: Bỏ scale-105 để fix lỗi scroll ---
                    className={`w-full aspect-square rounded-lg border-2 transition-all duration-200 ${
                      currentGradient.id === grad.id
                        ? "border-white shadow-lg" // Đã bỏ scale-105
                        : "border-transparent group-hover:border-white/50" // Đã bỏ group-hover:scale-105
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${grad.c1}, ${grad.c2})`,
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

// Style cho thanh cuộn (Không thay đổi)
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
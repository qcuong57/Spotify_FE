import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconMusic, IconX, IconPhoto, IconCheck } from "@tabler/icons-react";
import { updatePlaylistService } from "../../../services/playlistService";
import { useTheme } from "../../../context/themeContext";

// Animation variants
const backdropVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

const modalVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.8, 
    y: 50 
  },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 30,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const headerVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1
    }
  }
};

const imageContainerVariants = {
  initial: { opacity: 0, scale: 0.9, rotateY: -15 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    rotateY: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  hover: {
    scale: 1.02,
    rotateY: 5,
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.98
  }
};

const formFieldVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const inputVariants = {
  focus: {
    scale: 1.01,
    transition: {
      duration: 0.2
    }
  }
};

const buttonVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.95
  }
};

const loadingSpinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const imageOverlayVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.2
    }
  }
};

const EditPlaylistForm = ({ playlist, onClose, setCurrentView }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(playlist.title || "");
  const [description, setDescription] = useState(playlist.description || "");
  const [image, setImage] = useState(playlist.image || "");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước ảnh không được vượt quá 5MB!");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file ảnh!");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.onerror = () => {
        alert("Có lỗi xảy ra khi đọc file ảnh!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Vui lòng nhập tên playlist!");
      return;
    }

    try {
      setLoading(true);

      const data = {
        title: title.trim(),
        description: description.trim(),
        image: image,
      };


      const res = await updatePlaylistService(playlist.id, data);

      if (res && res.data) {
        const updatedPlaylist = {
          ...playlist,
          title: res.data.title || title.trim(),
          description: res.data.description || description.trim(),
          image: res.data.image || image,
          updated_at: res.data.updated_at || new Date().toISOString(),
        };


        setCurrentView(updatedPlaylist);
        alert("Cập nhật playlist thành công!");
        onClose();

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("EditPlaylistForm - Error updating playlist:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(
          `Có lỗi xảy ra: ${
            error.response.data.message ||
            error.response.data.error ||
            "Unknown error"
          }`
        );
      } else {
        alert("Có lỗi xảy ra khi cập nhật playlist!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle(playlist.title || "");
    setDescription(playlist.description || "");
    setImage(playlist.image || "");
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        variants={backdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className={`bg-gradient-to-b ${theme.colors.backgroundOverlay} backdrop-blur-md border border-${theme.colors.border} rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl`}
          variants={modalVariants}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <motion.div 
            className={`flex items-center justify-between p-4 border-b border-${theme.colors.border}`}
            variants={headerVariants}
          >
            <h2 className={`text-xl font-bold text-white bg-gradient-to-r ${theme.colors.gradient} bg-clip-text text-transparent`}>
              Chỉnh sửa Playlist
            </h2>
            <motion.button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-${theme.colors.card} transition-colors`}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <IconX className={`w-5 h-5 text-${theme.colors.text}`} />
            </motion.button>
          </motion.div>

          {/* Content */}
          <motion.div 
            className="p-4 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto"
            variants={contentVariants}
          >
            {/* Image Section */}
            <motion.div 
              className="flex justify-center"
              variants={formFieldVariants}
            >
              <motion.div
                className={`relative w-32 h-32 bg-${theme.colors.card} rounded-xl flex items-center justify-center overflow-hidden cursor-pointer border border-${theme.colors.border} group`}
                variants={imageContainerVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => document.getElementById("imageInput").click()}
              >
                <AnimatePresence mode="wait">
                  {image ? (
                    <motion.div
                      key="image"
                      className="relative w-full h-full"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <img
                        src={image}
                        alt="Playlist"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <motion.div 
                        className="absolute inset-0 bg-black/40 flex items-center justify-center"
                        variants={imageOverlayVariants}
                        initial="initial"
                        whileHover="animate"
                      >
                        <div className="text-center text-white">
                          <IconPhoto className="w-6 h-6 mx-auto mb-1" />
                          <span className="text-xs">Thay đổi</span>
                        </div>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      className={`w-full h-full bg-gradient-to-br from-${theme.colors.card} to-${theme.colors.cardHover} flex flex-col items-center justify-center text-center`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      >
                        <IconMusic className={`w-8 h-8 text-${theme.colors.text}/60 mb-2`} />
                      </motion.div>
                      <span className={`text-xs text-${theme.colors.text}/60 px-2`}>
                        Thêm ảnh
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </motion.div>
            </motion.div>

            {/* Title Field */}
            <motion.div variants={formFieldVariants}>
              <label className="block text-sm mb-2 text-white font-medium">
                Tên Playlist *
              </label>
              <motion.input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full bg-${theme.colors.card} px-4 py-3 rounded-xl text-white border border-${theme.colors.border} focus:border-${theme.colors.primary}-500 focus:outline-none transition-all hover:bg-${theme.colors.cardHover}`}
                placeholder="Nhập tên playlist..."
                disabled={loading}
                maxLength={100}
                variants={inputVariants}
                whileFocus="focus"
              />
              <div className={`text-xs text-${theme.colors.text}/60 mt-2 text-right`}>
                {title.length}/100
              </div>
            </motion.div>

            {/* Description Field */}
            <motion.div variants={formFieldVariants}>
              <label className="block text-sm mb-2 text-white font-medium">
                Mô tả Playlist
              </label>
              <motion.textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full bg-${theme.colors.card} px-4 py-3 rounded-xl text-white resize-none border border-${theme.colors.border} focus:border-${theme.colors.primary}-500 focus:outline-none transition-all hover:bg-${theme.colors.cardHover}`}
                rows="3"
                placeholder="Thêm mô tả cho playlist..."
                disabled={loading}
                maxLength={300}
                variants={inputVariants}
                whileFocus="focus"
              />
              <div className={`text-xs text-${theme.colors.text}/60 mt-2 text-right`}>
                {description.length}/300
              </div>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div 
            className={`flex justify-end gap-3 p-4 border-t border-${theme.colors.border}`}
            variants={contentVariants}
          >
            <motion.button
              onClick={handleCancel}
              className={`px-6 py-2.5 bg-${theme.colors.card} hover:bg-${theme.colors.cardHover} border border-${theme.colors.border} rounded-xl text-white font-medium transition-all disabled:opacity-50`}
              disabled={loading}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Hủy
            </motion.button>
            <motion.button
              onClick={handleSave}
              className={`px-6 py-2.5 bg-gradient-to-r ${theme.colors.gradient} rounded-xl text-white font-medium transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg`}
              disabled={loading || !title.trim()}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    variants={loadingSpinnerVariants}
                    animate="animate"
                    initial={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                  />
                ) : (
                  <motion.div
                    key="check"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <IconCheck className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
              {loading ? "Đang lưu..." : "Lưu"}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditPlaylistForm;
import React, { useState } from "react";
import { IconMusic } from "@tabler/icons-react";
import { updatePlaylistService } from "../../../services/playlistService";
import { useTheme } from "../../../context/themeContext";

const EditPlaylistForm = ({ playlist, onClose, setCurrentView }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(playlist.title || "");
  const [description, setDescription] = useState(playlist.description || "");
  const [image, setImage] = useState(playlist.image || "");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước ảnh không được vượt quá 5MB!");
        return;
      }

      // Kiểm tra loại file
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
      console.log("EditPlaylistForm - Updating playlist:", playlist.id);

      const data = {
        title: title.trim(),
        description: description.trim(),
        image: image,
      };

      console.log("EditPlaylistForm - Update data:", data);

      const res = await updatePlaylistService(playlist.id, data);
      console.log("EditPlaylistForm - Update response:", res);

      if (res && res.data) {
        // Tạo updated playlist object
        const updatedPlaylist = {
          ...playlist,
          title: res.data.title || title.trim(),
          description: res.data.description || description.trim(),
          image: res.data.image || image,
          updated_at: res.data.updated_at || new Date().toISOString(),
        };

        console.log("EditPlaylistForm - Updated playlist:", updatedPlaylist);

        // Gọi callback để update view
        setCurrentView(updatedPlaylist);

        alert("Cập nhật playlist thành công!");
        onClose();

        // Reload trang để đảm bảo data được sync
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
    // Reset form về trạng thái ban đầu
    setTitle(playlist.title || "");
    setDescription(playlist.description || "");
    setImage(playlist.image || "");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div
        className={`bg-gradient-to-b ${theme.colors.backgroundOverlay} backdrop-blur-md border border-${theme.colors.border} p-4 sm:p-6 rounded-lg w-full max-w-[90vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl`}
      >
        <h2
          className={`text-lg sm:text-xl font-bold mb-4 text-white bg-gradient-to-r ${theme.colors.gradient} bg-clip-text text-transparent`}
        >
          Chỉnh sửa Playlist
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Image Section */}
          <div className="flex justify-center">
            <div
              className={`relative w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] bg-${theme.colors.card} rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:bg-${theme.colors.cardHover} transition-all duration-200 group shadow-lg border border-${theme.colors.border}`}
              onClick={() => document.getElementById("imageInput").click()}
            >
              {image ? (
                <>
                  <img
                    src={image}
                    alt="Playlist"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      console.log("EditPlaylistForm - Image load error");
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center rounded-lg">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                      Thay đổi ảnh
                    </span>
                  </div>
                </>
              ) : (
                <div
                  className={`h-full w-full bg-gradient-to-br from-${theme.colors.card} to-gray-800/30 flex flex-col items-center justify-center rounded-lg`}
                >
                  <IconMusic
                    stroke={2}
                    className={`w-12 h-12 sm:w-16 sm:h-16 text-${theme.colors.text} mb-2`}
                  />
                  <span
                    className={`text-xs text-${theme.colors.text} text-center px-2`}
                  >
                    Nhấp để thêm ảnh
                  </span>
                </div>
              )}
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={loading}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-xs sm:text-sm mb-2 text-white font-medium">
                Tên Playlist *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full bg-${theme.colors.card} px-3 sm:px-4 py-2 rounded-lg text-white text-sm border border-${theme.colors.border} focus:border-${theme.colors.primary}-500 focus:outline-none transition-colors hover:bg-${theme.colors.cardHover}`}
                placeholder="Nhập tên playlist..."
                disabled={loading}
                maxLength={100}
              />
              <div className={`text-xs text-${theme.colors.text} mt-1`}>
                {title.length}/100 ký tự
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm mb-2 text-white font-medium">
                Mô tả Playlist
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full bg-${theme.colors.card} px-3 sm:px-4 py-2 rounded-lg text-white text-sm resize-none border border-${theme.colors.border} focus:border-${theme.colors.primary}-500 focus:outline-none transition-colors hover:bg-${theme.colors.cardHover}`}
                rows="3"
                placeholder="Thêm mô tả cho playlist..."
                disabled={loading}
                maxLength={300}
              />
              <div className={`text-xs text-${theme.colors.text} mt-1`}>
                {description.length}/300 ký tự
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`flex justify-end gap-3 pt-4 border-t border-${theme.colors.border}`}
        >
          <button
            onClick={handleCancel}
            className={`px-4 sm:px-6 py-2 bg-${theme.colors.card} hover:bg-${theme.colors.cardHover} border border-${theme.colors.border} rounded-lg text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md`}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className={`px-4 sm:px-6 py-2 bg-${theme.colors.button} hover:bg-${theme.colors.buttonHover} rounded-lg text-${theme.colors.buttonText} text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 shadow-md`}
            disabled={loading || !title.trim()}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            )}
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPlaylistForm;

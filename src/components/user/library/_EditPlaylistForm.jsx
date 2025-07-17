import React, { useState } from "react";
import { IconMusic } from "@tabler/icons-react";
import { updatePlaylistService } from "../../../services/playlistService";

const EditPlaylistForm = ({ playlist, onClose, setCurrentView }) => {
  const [title, setTitle] = useState(playlist.title);
  const [description, setDescription] = useState(playlist.description || "");
  const [image, setImage] = useState(playlist.image);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const data = {
        title: title,
        description: description,
        image: image,
      };
      const res = await updatePlaylistService(playlist.id, data);
      setCurrentView(res.data);
      setImage(res.data.image);
      alert("Cập nhật playlist thành công!");
      window.location.reload();
      onClose();
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#242424] p-4 sm:p-6 rounded-lg w-full max-w-[90vw] sm:max-w-[500px]">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Chỉnh sửa Playlist</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div
            className="relative w-[150px] h-[150px] sm:w-[230px] sm:h-[230px] bg-[#333333] rounded flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={() => document.getElementById("imageInput").click()}
          >
            {image ? (
              <img src={image} alt="Playlist" className="absolute inset-0 w-full h-full object-cover rounded" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#333333] to-[#121212] flex items-center justify-center">
                <IconMusic stroke={2} className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400" />
              </div>
            )}
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <div className="mb-4">
              <label className="block text-xs sm:text-sm mb-2">Tên Playlist</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#333333] px-3 sm:px-4 py-2 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm mb-2">Mô tả Playlist</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#333333] px-3 sm:px-4 py-2 rounded text-white text-sm resize-none"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-500 rounded text-white text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-3 sm:px-4 py-1 sm:py-2 bg-green-500 rounded text-white text-sm"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPlaylistForm;
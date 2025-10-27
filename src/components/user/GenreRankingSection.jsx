// // src/components/user/main/GenreRankingSection.jsx

// import React, { useMemo, memo } from "react";
// import { IconMusic, IconMicrophone } from "@tabler/icons-react";
// import { motion } from "framer-motion";
// import Section from "../../components/user/main/Section";
// import SongGrid from "../user/main/SongGrid"; // Tái sử dụng SongGrid

// const genreRankingVariants = {
//   initial: { opacity: 0, y: 30 },
//   animate: (i) => ({
//     opacity: 1,
//     y: 0,
//     transition: {
//       delay: i * 0.1, // Stagger delay cho mỗi thể loại
//       duration: 0.6,
//       ease: [0.4, 0, 0.2, 1],
//     },
//   }),
//   exit: { opacity: 0, y: -20 },
// };

// const GenreRankingSection = memo(
//   ({
//     genreRanking,
//     handleGenreViewAll,
//     contextMenu,
//     setContextMenu,
//     handleCloseContextMenu,
//     loadingStates,
//   }) => {
//     // Lọc các thể loại có bài hát
//     const validGenreRanking = useMemo(() => {
//       return genreRanking.filter(
//         (genre) =>
//           genre.songs &&
//           Array.isArray(genre.songs) &&
//           genre.songs.length > 0
//       );
//     }, [genreRanking]);

//     if (validGenreRanking.length === 0) return null;

//     return (
//       <>
//         {validGenreRanking.map((genre, idx) => (
//           <motion.div
//             key={genre.id}
//             variants={genreRankingVariants}
//             initial="initial"
//             animate="animate"
//             exit="exit"
//             custom={idx}
//           >
//             <Section
//               title={`Top ${genre.songs.length} ${genre.name}`}
//               emoji="🏆"
//               onViewAll={() =>
//                 handleGenreViewAll(genre.songs, `Top ${genre.name}`, genre.id)
//               }
//               buttonText="Xem thêm"
//               isLoading={loadingStates.genres[genre.id]}
//               index={idx + 4} // Index bắt đầu từ 4 để tránh trùng với các section cố định
//             >
//               {/* Tái sử dụng SongGrid để hiển thị top songs của genre */}
//               <SongGrid
//                 songs={genre.songs.slice(0, 10)} // Hiển thị tối đa 10 bài trong grid
//                 keyPrefix={`genre-ranking-${genre.id}`}
//                 contextMenu={contextMenu}
//                 setContextMenu={setContextMenu}
//                 handleCloseContextMenu={handleCloseContextMenu}
//                 index={idx + 4}
//               />
//             </Section>
//           </motion.div>
//         ))}
//       </>
//     );
//   }
// );

// export default GenreRankingSection;
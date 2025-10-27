import React, { useMemo, memo } from "react";
import { IconChartBar, IconChevronRight } from "@tabler/icons-react";
import { motion } from "framer-motion";
import Section from "../user/main/Section";
import TrendingSong from "./TrendingSong";
import LoadingGrid from "./LoadingGrid";

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const TopSongsSection = memo(
  ({
    topSongs,
    contextMenu,
    setContextMenu,
    handleCloseContextMenu,
    onViewAll,
    isLoading,
    index,
  }) => {
    const displaySongs = useMemo(() => {
      // Giới hạn hiển thị 10 bài
      return topSongs.slice(0, 10);
    }, [topSongs]);

    if (!isLoading && displaySongs.length === 0) return null;

    const songsList = useMemo(() => topSongs, [topSongs]);

    return (
      <Section
        title="Top 100 Bài hát được nghe nhiều nhất"
        emoji="👑"
        onViewAll={onViewAll}
        buttonText="Xem tất cả Top 100"
        isLoading={isLoading}
        index={index}
      >
        <motion.div
          className="grid grid-cols-1 gap-4"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {isLoading ? (
            <LoadingGrid count={10} cols={1} />
          ) : (
            displaySongs.map((song, idx) => (
              <motion.div key={song.id} variants={itemVariants}>
                <TrendingSong
                  song={song}
                  list={songsList}
                  rank={song.rank || idx + 1}
                  contextMenu={contextMenu}
                  setContextMenu={setContextMenu}
                  handleCloseContextMenu={handleCloseContextMenu}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      </Section>
    );
  }
);

export default TopSongsSection;
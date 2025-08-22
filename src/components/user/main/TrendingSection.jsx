import React, { memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/themeContext";
import Section from "./Section";
import TrendingSong from "./../TrendingSong";

const gridVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  }
};

const gridItemVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      delay: i * 0.05,
      ease: [0.4, 0, 0.2, 1],
    }
  })
};

const TrendingSection = memo(
  ({ trendingSongs, contextMenu, setContextMenu, handleCloseContextMenu, index }) => {
    const { theme } = useTheme();
    
    return (
      <Section
        title="Trending ngay bây giờ"
        emoji="🔥"
        index={index}
      >
        <motion.div 
          className="space-y-1"
          variants={gridVariants}
          initial="initial"
          animate="animate"
        >
          {trendingSongs.slice(0, 10).map((song, idx) => (
            <motion.div
              key={`trending-${song.id}`}
              variants={gridItemVariants}
              custom={idx}
            >
              <TrendingSong
                song={song}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
                list={trendingSongs}
                rank={idx + 1}
              />
            </motion.div>
          ))}
        </motion.div>
      </Section>
    );
  }
);

export default TrendingSection;
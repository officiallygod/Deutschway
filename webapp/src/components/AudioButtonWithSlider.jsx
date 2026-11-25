import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { playAudio, getAudioVolume, setAudioVolume } from '../utils/audioService';

const AudioButtonWithSlider = ({ text, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [volume, setVolume] = useState(() => getAudioVolume());

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setAudioVolume(newVol);
  };

  const handleClickSpeaker = (e) => {
    e.stopPropagation();
    playAudio(text, volume);
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={20} />;
    if (volume < 0.5) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center p-1 rounded-full glass border border-white/20 dark:border-white/10 shadow-sm transition-all">
        {/* Speaker Play Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleClickSpeaker}
          className="audio-btn w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          aria-label="Aussprache anhören"
          title="Aussprache anhören (Hover für Lautstärke)"
        >
          {getVolumeIcon()}
        </motion.button>

        {/* Volume Slider Only On Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 100, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden flex items-center pr-3 pl-1"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1.5 bg-black/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                title={`Lautstärke: ${Math.round(volume * 100)}%`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(AudioButtonWithSlider);

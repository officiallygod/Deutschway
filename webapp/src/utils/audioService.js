const VOLUME_STORAGE_KEY = 'deutschway_audio_volume';

let currentVolume = 1.0;
try {
  const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
  if (saved !== null) {
    currentVolume = parseFloat(saved);
  }
} catch {
  // ignore
}

export const getAudioVolume = () => currentVolume;

export const setAudioVolume = (vol) => {
  const clamped = Math.max(0, Math.min(1, vol));
  currentVolume = clamped;
  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, clamped.toString());
  } catch {
    // ignore
  }
};

export const playAudio = (text, customVolume) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    utterance.volume = customVolume !== undefined ? customVolume : currentVolume;

    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Speech Synthesis API not supported in this browser.');
  }
};

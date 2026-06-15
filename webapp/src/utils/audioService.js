export const playAudio = (text) => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9; // Slightly slower for language learners
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Speech Synthesis API not supported in this browser.");
  }
};

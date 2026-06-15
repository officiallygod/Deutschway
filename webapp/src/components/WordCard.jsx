import React from 'react';
import { Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getGenderInfo } from '../utils/grammarEngine';
import { playAudio } from '../utils/audioService';

const WordCard = React.memo(({ 
  word, 
  currentIndex, 
  totalWords, 
  handleNext, 
  handlePrev 
}) => {
  if (!word) return null;

  const genderInfo = getGenderInfo(word.word);

  return (
    <div className="card-container">
      <div className="word-card glass">
        <div className="card-top">
          {genderInfo ? (
            <div className="gender-badge" title={genderInfo.rule}>
              {genderInfo.label}
            </div>
          ) : <div />}
          <button 
            className="audio-btn" 
            onClick={() => playAudio(`${word.word}. ${word.example}`)}
            aria-label="Listen to pronunciation"
          >
            <Volume2 size={24} />
          </button>
        </div>

        <div className="word-title">
          <h2>{word.word}</h2>
          <p>{word.translation}</p>
        </div>

        <div className="example-section">
          <div className="sentence">{word.example}</div>
          <div className="translation">{word.exampleTranslation}</div>
          
          <div className="grammar-breakdown">
            <strong>Grammar Note:</strong>
            <span>Notice how the verb is usually placed in the second position of the main clause. Pay attention to the article gender!</span>
          </div>
        </div>
      </div>

      <div className="controls">
        <button 
          className="btn secondary" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={20} /> Previous
        </button>
        <button className="btn primary" onClick={handleNext}>
          {currentIndex === totalWords - 1 ? 'Finish Session' : 'Next Word'} <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
});

WordCard.displayName = 'WordCard';
export default WordCard;

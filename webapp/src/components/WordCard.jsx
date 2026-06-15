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
            <strong>Grammatik:</strong>
            <span>{word.grammarNote || "Achten Sie auf den spezifischen Kontext des Wortes."}</span>
          </div>

          {word.synonyms && word.synonyms.length > 0 && (
            <div className="synonyms">
              <strong>Ähnlich:</strong>
              {word.synonyms.map(syn => (
                <span key={syn} className="syn-tag">{syn}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="controls">
        <button 
          className="btn secondary" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={20} /> Zurück
        </button>
        <button className="btn primary" onClick={handleNext}>
          {currentIndex === totalWords - 1 ? 'Lektion beenden' : 'Nächstes Wort'} <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
});

WordCard.displayName = 'WordCard';
export default WordCard;

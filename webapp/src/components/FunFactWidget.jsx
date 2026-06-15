import React, { useState, useEffect } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { getRandomFunFact } from '../utils/grammarEngine';

const FunFactWidget = React.memo(() => {
  const [fact, setFact] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    setFact(getRandomFunFact());
  }, []);

  if (!fact) return null;

  if (!isExpanded) {
    return (
      <button 
        className="fun-fact-toggle glass desktop-only" 
        onClick={() => setIsExpanded(true)}
        aria-label="Wusstest du schon?"
      >
        <Lightbulb size={24} color="var(--primary-accent)" />
      </button>
    );
  }

  return (
    <div className="fun-fact-corner glass">
      <div className="fact-header">
        <h4><Lightbulb size={16} /> Wusstest du schon?</h4>
        <button className="close-btn" onClick={() => setIsExpanded(false)} aria-label="Schließen">
          <X size={16} />
        </button>
      </div>
      <p>{fact}</p>
    </div>
  );
});

FunFactWidget.displayName = 'FunFactWidget';
export default FunFactWidget;

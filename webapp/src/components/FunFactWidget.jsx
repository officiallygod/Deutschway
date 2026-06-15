import React, { useState, useEffect } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { getRandomFunFact } from '../utils/grammarEngine';

const FunFactWidget = React.memo(() => {
  const [fact, setFact] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setFact(getRandomFunFact());
  }, []);

  if (!fact || !isVisible) return null;

  return (
    <div className="fun-fact-corner glass">
      <div className="fact-header">
        <h4><Lightbulb size={16} /> Wusstest du schon?</h4>
        <button className="close-btn" onClick={() => setIsVisible(false)} aria-label="Schließen">
          <X size={16} />
        </button>
      </div>
      <p>{fact}</p>
    </div>
  );
});

FunFactWidget.displayName = 'FunFactWidget';
export default FunFactWidget;

import React, { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { getRandomFunFact } from '../utils/grammarEngine';

const FunFactWidget = React.memo(() => {
  const [fact, setFact] = useState('');

  useEffect(() => {
    setFact(getRandomFunFact());
  }, []);

  if (!fact) return null;

  return (
    <div className="fun-fact-corner glass">
      <h4><Lightbulb size={16} /> Did you know?</h4>
      <p>{fact}</p>
    </div>
  );
});

FunFactWidget.displayName = 'FunFactWidget';
export default FunFactWidget;

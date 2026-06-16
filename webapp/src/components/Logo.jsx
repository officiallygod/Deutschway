import React from 'react';

const Logo = ({ width = 32, height = 32, className = '' }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 120 120" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`deutschway-logo ${className}`}
      style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }}
    >
      <defs>
        <linearGradient id="ger-grad-left" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#333333" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        <linearGradient id="ger-grad-center" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff4b4b" />
          <stop offset="100%" stopColor="#cc0000" />
        </linearGradient>
        <linearGradient id="ger-grad-right" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe600" />
          <stop offset="100%" stopColor="#cc9900" />
        </linearGradient>
      </defs>

      {/* A subtle background glow to ensure the black wing is visible on black backgrounds */}
      <polygon points="50,45 10,25 35,65 50,85" fill="rgba(255,255,255,0.15)" transform="translate(-2, -2)" />

      {/* Left Wing: Black/Dark Grey */}
      <polygon points="50,45 10,25 35,65 50,85" fill="url(#ger-grad-left)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinejoin="round" />
      
      {/* Right Wing: Gold */}
      <polygon points="70,45 110,25 85,65 70,85" fill="url(#ger-grad-right)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinejoin="round" />
      
      {/* Head and Body: Red */}
      <polygon points="60,10 75,50 60,110 45,50" fill="url(#ger-grad-center)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
};

export default Logo;

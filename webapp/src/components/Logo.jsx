import React from 'react';

const Logo = ({ width = 32, height = 32, className = '' }) => {
  return (
    <img 
      src="/Deutschway/logo.png" 
      alt="DeutschWay Logo" 
      width={width} 
      height={height} 
      className={`deutschway-logo ${className}`}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default Logo;

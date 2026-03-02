import React from 'react';
import { useState } from 'react';

// Custom Tooltip component
const Tooltip = ({ text, children, position = 'top' }) => {
  const [isVisible, setVisible] = useState(false);

  return (
    <div
      className="tooltip-container"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      <div 
        className={`tooltip tooltip-${position} ${isVisible ? 'tooltip-visible' : ''}`}
      >
        {text}
      </div>
    </div>
  );
};

export default Tooltip;

import React from 'react';

const Loader = () => (
  <div style={{ 
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    zIndex: 9999
  }}>
    <div style={{ 
      width: '48px', 
      height: '48px', 
      position: 'relative' 
    }}>
      {/* Shadow */}
      <div style={{
        content: '',
        width: '48px',
        height: '5px',
        background: '#884b9e',
        position: 'absolute',
        top: '60px',
        left: 0,
        borderRadius: '50%',
        animation: 'shadow324 0.5s linear infinite'
      }} />
      
      {/* Cube */}
      <div style={{
        content: '',
        width: '100%',
        height: '100%',
        background: '#884b9e',
        position: 'absolute',
        top: 0,
        left: 0,
        borderRadius: '4px',
        animation: 'jump7456 0.5s linear infinite'
      }} />
    </div>
    
    <style>{`
      @keyframes jump7456 {
        15% {
          border-bottom-right-radius: 3px;
        }
        25% {
          transform: translateY(9px) rotate(22.5deg);
        }
        50% {
          transform: translateY(18px) scale(1, 0.9) rotate(45deg);
          border-bottom-right-radius: 40px;
        }
        75% {
          transform: translateY(9px) rotate(67.5deg);
        }
        100% {
          transform: translateY(0) rotate(90deg);
        }
      }
      
      @keyframes shadow324 {
        0%, 100% {
          transform: scale(1, 1);
        }
        50% {
          transform: scale(1.2, 1);
        }
      }
    `}</style>
  </div>
);

export default Loader;
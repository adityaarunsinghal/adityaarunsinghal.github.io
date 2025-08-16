import React from 'react';
import fourOHfour from '../images/404.gif';

const NotFound: React.FC = () => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h2 style={{ fontSize: 'max(2vw, 16px)', marginBottom: '1rem' }}>
        Sorry, that was not a real page.
      </h2>
      
      <img
        src={fourOHfour}
        alt='Sorry 404!'
        style={{
          maxWidth: '75%',
          height: 'auto',
          width: '100%',
          marginBottom: '2rem'
        }}
      />

      <button 
        onClick={handleGoHome}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#2ecc71',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFound;

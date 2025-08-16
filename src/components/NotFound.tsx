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
      padding: '2rem',
      width: '90%',
      maxWidth: '600px'
    }}>
      <h2 style={{ 
        fontSize: 'max(2vw, 16px)', 
        marginBottom: '1rem',
        color: '#333'
      }}>
        Sorry, that was not a real page.
      </h2>
      
      <img
        src={fourOHfour}
        alt='Sorry 404!'
        style={{
          maxWidth: '100%',
          height: 'auto',
          marginBottom: '2rem',
          borderRadius: '8px'
        }}
      />

      <button 
        onClick={handleGoHome}
        style={{
          padding: '12px 24px',
          backgroundColor: '#2ecc71',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          transition: 'background-color 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2ecc71'}
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFound;

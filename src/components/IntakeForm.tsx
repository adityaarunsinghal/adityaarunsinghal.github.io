import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const IntakeForm = () => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLSdEf_CwwL0LCzbEc85b_FuPosDsZTTru0ntOFU7Mn48pevHVw/viewform?usp=sharing&ouid=108983163737349704776';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px'
    }}>
      <div style={{ 
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '60px 40px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ 
          fontSize: '4rem', 
          marginBottom: '30px',
          animation: 'pulse 2s infinite'
        }}>
          📝
        </div>
        
        <h1 style={{ 
          fontSize: '2.2rem', 
          marginBottom: '20px',
          fontWeight: '700',
          background: 'linear-gradient(45deg, #4ecdc4, #45b7d1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Workshop Application
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '30px',
          opacity: '0.9',
          lineHeight: '1.6'
        }}>
          Redirecting to the intake form in <strong style={{ color: '#4ecdc4' }}>{countdown}</strong> seconds...
        </p>
        
        <div style={{ marginBottom: '30px' }}>
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSdEf_CwwL0LCzbEc85b_FuPosDsZTTru0ntOFU7Mn48pevHVw/viewform?usp=sharing&ouid=108983163737349704776" 
            style={{ 
              display: 'inline-block',
              background: 'linear-gradient(45deg, #4ecdc4, #45b7d1)',
              color: 'white',
              padding: '15px 30px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)',
              marginRight: '15px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.3)';
            }}
          >
            Go to Form Now
          </a>
        </div>
        
        <Link 
          to="/agentic-ai-workshop" 
          style={{ 
            color: '#4ecdc4',
            textDecoration: 'none',
            fontSize: '1rem',
            opacity: '0.8',
            borderBottom: '1px solid transparent',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderBottomColor = '#4ecdc4';
            e.currentTarget.style.opacity = '1';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderBottomColor = 'transparent';
            e.currentTarget.style.opacity = '0.8';
          }}
        >
          ← Back to Workshop Details
        </Link>
        
        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'rgba(255, 193, 7, 0.1)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          fontSize: '0.9rem'
        }}>
          <strong style={{ color: '#ffc107' }}>Note:</strong> Please include whether you're an undergraduate, graduate student, or alumni in your application.
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @media (max-width: 480px) {
          div[style*="padding: 60px 40px"] {
            padding: 40px 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default IntakeForm;

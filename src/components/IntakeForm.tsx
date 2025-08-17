import { useEffect } from 'react';

const IntakeForm = () => {
  useEffect(() => {
    window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLSdEf_CwwL0LCzbEc85b_FuPosDsZTTru0ntOFU7Mn48pevHVw/viewform?usp=sharing&ouid=108983163737349704776';
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Redirecting to Intake Form...</h2>
        <p>If you're not redirected automatically, <a href="https://docs.google.com/forms/d/e/1FAIpQLSdEf_CwwL0LCzbEc85b_FuPosDsZTTru0ntOFU7Mn48pevHVw/viewform?usp=sharing&ouid=108983163737349704776" style={{ color: '#4ecdc4' }}>click here</a></p>
      </div>
    </div>
  );
};

export default IntakeForm;

import { useEffect } from 'react';

const LinkedInRedirect = () => {
  useEffect(() => {
    window.location.href = 'https://www.linkedin.com/in/adi-singhal/';
  }, []);

  return null;
};

export default LinkedInRedirect;

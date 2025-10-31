import { useEffect } from 'react';

const InstagramRedirect = () => {
  useEffect(() => {
    window.location.href = 'https://www.instagram.com/that_dramebaaz_guy/';
  }, []);

  return null;
};

export default InstagramRedirect;

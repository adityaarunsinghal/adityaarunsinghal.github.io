import { useEffect } from 'react';

const FacebookRedirect = () => {
  useEffect(() => {
    window.location.href = 'https://www.facebook.com/that.dramebaaz.guy';
  }, []);

  return null;
};

export default FacebookRedirect;

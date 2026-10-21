import { useEffect } from 'react';

const YouTubeRedirect = () => {
  useEffect(() => {
    window.location.href = 'https://www.youtube.com/@singhaladitya';
  }, []);

  return null;
};

export default YouTubeRedirect;

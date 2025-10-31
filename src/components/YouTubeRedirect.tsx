import { useEffect } from 'react';

const YouTubeRedirect = () => {
  useEffect(() => {
    window.location.href = 'https://www.youtube.com/channel/UCgepx936F0EMIiYK8I4HiNw';
  }, []);

  return null;
};

export default YouTubeRedirect;

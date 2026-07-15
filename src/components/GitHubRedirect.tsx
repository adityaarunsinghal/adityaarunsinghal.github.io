import { useEffect } from 'react';

const GitHubRedirect = () => {
  useEffect(() => {
    window.location.href = 'https://github.com/adityaarunsinghal';
  }, []);

  return null;
};

export default GitHubRedirect;

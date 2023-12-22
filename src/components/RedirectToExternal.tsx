import React from 'react';

interface RedirectToExternalProps {
  url: string;
}

const RedirectToExternal: React.FC<RedirectToExternalProps> = ({ url }) => {
  window.location.href = url;
  return null;
};

export default RedirectToExternal;

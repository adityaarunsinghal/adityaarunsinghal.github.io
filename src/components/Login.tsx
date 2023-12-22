import React from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const Login: React.FC = () => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Redirect after login
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>{"Hi babydoll ;)"}</h1>
      <button onClick={handleLogin}>Log in with Google</button>
    </div>
  );
};

export default Login;

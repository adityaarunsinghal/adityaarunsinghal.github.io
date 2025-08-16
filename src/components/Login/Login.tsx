import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import './Login.css';
import { auth } from '../../firebase';
import { ALLOWED_EMAILS } from '@/config';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;
      if (userEmail && !ALLOWED_EMAILS.includes(userEmail)) {
        await signOut(auth);
        alert('Access denied. Only Adi and Ingy can log in.');
        return;
      }
      navigate(from);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-page'>
      <h1>{"Hi babydoll ;)"}</h1>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Log in with Google'}
      </button>
    </div>
  );
};

export default Login;

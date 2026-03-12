import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import './Login.css';
import { auth } from '../../firebase';
import { ALLOWED_EMAILS } from '@/config';

const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || (navigator as any).standalone === true;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Handle redirect result when returning from Google sign-in
  React.useEffect(() => {
    if (!isStandalone) return;
    setLoading(true);
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const userEmail = result.user.email;
          if (userEmail && !ALLOWED_EMAILS.includes(userEmail)) {
            signOut(auth);
            alert('Access denied. Only Adi and Ingy can log in.');
            return;
          }
          navigate(from);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();

    if (isStandalone) {
      // Redirect flow for standalone PWA — popups don't work
      await signInWithRedirect(auth, provider);
      return;
    }

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

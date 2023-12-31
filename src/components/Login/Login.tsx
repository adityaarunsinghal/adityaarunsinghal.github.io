import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import './Login.css'; // Import the CSS file
import { auth } from '../../firebase';

const Login: React.FC = () => {
  // Define allowed email addresses
  const allowedEmails = ['adityaarunsinghal@gmail.com',
    'johannefriedman@gmail.com',
    'johanne.friedman@gmail.com'];
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;
      if (userEmail && !allowedEmails.includes(userEmail)) {
        await signOut(auth);
        alert('Access denied. Only Adi and Ingy can log in.');
        return;
      }
      navigate(from); // Redirect to the original page or the default path
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='login-page'>
      <h1>{"Hi babydoll ;)"}</h1>
      <button onClick={handleLogin}>Log in with Google</button>
    </div>
  );
};

export default Login;

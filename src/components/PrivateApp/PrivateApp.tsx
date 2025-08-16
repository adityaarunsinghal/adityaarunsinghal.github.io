import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import reactLogo from '../../images/react.svg';
import viteLogo from '../../images/vite.svg';
import './PrivateApp.css';

function PrivateApp() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div id='private-app'>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div>
        <a href='https://vitejs.dev' target='_blank'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/PrivateApp.tsx</code> and save to test HMR
        </p>
      </div>
      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default PrivateApp;

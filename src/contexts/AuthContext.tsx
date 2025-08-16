import React, { useEffect, useState, ReactNode } from 'react';
import { auth } from '../firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import Loading from '@/components/Loading';

import { createContext } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const defaultValue: AuthContextType = {
  user: null,
  loading: true,
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>(defaultValue);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <Loading message="Authenticating..." />;
  }

  return (
    <AuthContext.Provider value={{ user: currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
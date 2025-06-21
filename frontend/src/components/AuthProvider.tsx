import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUserAndToken: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  setUserAndToken: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Set user and token after login
  const setUserAndToken = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('jwt', token);
    setLoading(false);
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwt');
  };

  // Load user from token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt');
    if (storedToken) {
      setToken(storedToken);
      axios
        .get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('jwt');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, setUserAndToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 
import { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, signupApi, googleLoginApi, getMeApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('buildsense_token') || null);
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('buildsense_token');
    if (!savedToken) {
      localStorage.removeItem('buildsense_user');
      return null;
    }
    try {
      const savedUser = localStorage.getItem('buildsense_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('buildsense_user');
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('buildsense_token');
      if (storedToken) {
        try {
          const res = await getMeApi();
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('buildsense_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          setToken(null);
          setUser(null);
          localStorage.removeItem('buildsense_token');
          localStorage.removeItem('buildsense_user');
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('buildsense_user');
        localStorage.removeItem('buildsense_token');
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('buildsense_token', newToken);
    localStorage.setItem('buildsense_user', JSON.stringify(newUser));
    return res.data;
  };

  const signup = async (name, email, password) => {
    const res = await signupApi({ name, email, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('buildsense_token', newToken);
    localStorage.setItem('buildsense_user', JSON.stringify(newUser));
    return res.data;
  };

  const googleLogin = async (credential) => {
    const res = await googleLoginApi(credential);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('buildsense_token', newToken);
    localStorage.setItem('buildsense_user', JSON.stringify(newUser));
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('buildsense_token');
    localStorage.removeItem('buildsense_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, googleLogin, logout, isAuthenticated: !!user && !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

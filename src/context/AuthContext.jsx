// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../SupabaseClient';


const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('users');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Supabase login
  const login = async (username, password) => {
    try {
      setIsLoading(true);

      // Query Supabase users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', username) // match user_name column
        .eq('phone_number', password)  // ⚠️ plain text for demo only
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Save user data
      setUser(data);
      localStorage.setItem('users', JSON.stringify(data));

      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('users');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

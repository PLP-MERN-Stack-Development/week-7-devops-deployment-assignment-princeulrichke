'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { User } from '@/types';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getProfile();
        setUser(response.user);
      } catch (error) {
        // Token is invalid, remove it
        Cookies.remove('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await api.login({
        email,
        password
      });

      const { token, user: userData } = response;
      
      // Store token in cookie (7 days)
      Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
      setUser(userData);
      
      toast.success('Login successful!');
    } catch (error) {
      // Error handling is done in the API interceptor
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await api.register({
        username,
        email,
        password
      });

      const { token, user: userData } = response;
      
      // Store token in cookie (7 days)
      Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
      setUser(userData);
      
      toast.success('Registration successful!');
    } catch (error) {
      // Error handling is done in the API interceptor
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      // Always clear local state
      Cookies.remove('token');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { AuthRequest, User } from '../types';
import { decodeToken } from '../utils/jwt';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: AuthRequest) => Promise<void>;
  register: (userData: User) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  setUserFromToken: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decodedToken = decodeToken(token);
        const userStr = localStorage.getItem('user');
        const storedUser = userStr ? JSON.parse(userStr) : {};

        const userData: User = {
          ...storedUser,
          id: decodedToken.id || storedUser.id || 0,
          name: decodedToken.sub || storedUser.name || '',
          email: decodedToken.email || storedUser.email || '',
          roles: decodedToken.roles || '',
        };
        setUser(userData);
      } catch (e) {
        console.error("Failed to restore user from token", e);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: AuthRequest) => {
    try {
      const response = await authAPI.signIn(credentials);
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      const decodedToken = decodeToken(accessToken);
      console.log('Decoded Token:', decodedToken);

      const userData: User = {
        id: decodedToken.id || 0,
        name: decodedToken.sub || credentials.email,
        email: decodedToken.email || credentials.email,
        roles: decodedToken.roles || '',
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: User) => {
    try {
      // Clear existing tokens to ensure a fresh registration
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      const response = await authAPI.signUp(userData);
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      const decodedToken = decodeToken(accessToken);

      const newUserData: User = {
        ...userData,
        roles: decodedToken.roles || userData.roles || '',
      };

      localStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const response = await authAPI.googleSignIn(credential);
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      const decodedToken = decodeToken(accessToken);
      console.log('Google Login - Decoded Token:', decodedToken);

      const userData: User = {
        id: decodedToken.id || 0,
        name: decodedToken.sub || '',
        email: decodedToken.email || '',
        roles: decodedToken.roles || '',
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const setUserFromToken = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decodedToken = decodeToken(token);
        const userStr = localStorage.getItem('user');
        const storedUser = userStr ? JSON.parse(userStr) : {};

        const userData: User = {
          ...storedUser,
          id: decodedToken.id || storedUser.id || 0,
          name: decodedToken.sub || storedUser.name || '',
          email: decodedToken.email || storedUser.email || '',
          roles: decodedToken.roles || storedUser.roles || '',
        };
        setUser(userData);
      } catch (e) {
        console.error("Failed to set user from token", e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        setUserFromToken,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { AuthRequest, User } from '../types';
import { decodeToken } from '../utils/jwt';
import { resolveProfileImage } from '../utils/profileImage';

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

  const parseUserId = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getToken = (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Unable to read ${key} from localStorage`, error);
      return null;
    }
  };

  const setToken = (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Unable to write ${key} to localStorage`, error);
      return false;
    }
  };

  const clearStoredTokens = () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.warn('Unable to clear auth tokens from localStorage', error);
    }
  };

  const persistTokens = (accessToken: string, refreshToken: string) => {
    const accessStored = setToken('accessToken', accessToken);
    const refreshStored = setToken('refreshToken', refreshToken);

    if (!accessStored || !refreshStored) {
      clearStoredTokens();
      throw new Error('Unable to store authentication tokens.');
    }
  };

  useEffect(() => {
    const token = getToken('accessToken');
    if (token) {
      try {
        const decodedToken = decodeToken(token);
        const userStr = localStorage.getItem('user');
        const storedUser = userStr ? JSON.parse(userStr) : {};

        const userData: User = {
          ...storedUser,
          id: parseUserId(decodedToken.id ?? storedUser.id),
          name: decodedToken.sub || storedUser.name || '',
          email: decodedToken.email || storedUser.email || '',
          roles: decodedToken.roles || '',
          profileImage: resolveProfileImage(decodedToken.profileImage, decodedToken.picture, storedUser.profileImage),
        };
        setUser(userData);
      } catch (e) {
        console.error("Failed to restore user from token", e);
        clearStoredTokens();
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: AuthRequest) => {
    try {
      const response = await authAPI.signIn(credentials);
      const { accessToken, refreshToken } = response.data;
      persistTokens(accessToken, refreshToken);

      const decodedToken = decodeToken(accessToken);
      console.log('Decoded Token:', decodedToken);

      const userData: User = {
        id: parseUserId(decodedToken.id),
        name: decodedToken.sub || credentials.email,
        email: decodedToken.email || credentials.email,
        roles: decodedToken.roles || '',
        profileImage: resolveProfileImage(decodedToken.profileImage, decodedToken.picture),
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
      console.log('Register function called with userData:', {
        ...userData,
        password: '***',
        adminKey: userData.adminKey ? '***' : undefined
      });

      // Clear existing tokens to ensure a fresh registration
      clearStoredTokens();
      localStorage.removeItem('user');

      const response = await authAPI.signUp(userData);
      console.log('SignUp API response:', response);

      const { accessToken, refreshToken } = response.data;
      persistTokens(accessToken, refreshToken);

      const decodedToken = decodeToken(accessToken);
      console.log('Decoded token after signup:', decodedToken);
      console.log('Roles from token:', decodedToken.roles);
      console.log('Roles from userData:', userData.roles);

      const newUserData: User = {
        ...userData,
        roles: decodedToken.roles || userData.roles || '',
        profileImage: resolveProfileImage(decodedToken.profileImage, decodedToken.picture, userData.profileImage),
      };

      console.log('Final user data being stored:', {
        ...newUserData,
        password: '***'
      });

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
      persistTokens(accessToken, refreshToken);

      const decodedToken = decodeToken(accessToken);
      console.log('Google Login - Decoded Token:', decodedToken);

      const userData: User = {
        id: parseUserId(decodedToken.id),
        name: decodedToken.sub || '',
        email: decodedToken.email || '',
        roles: decodedToken.roles || '',
        profileImage: resolveProfileImage(decodedToken.profileImage, decodedToken.picture),
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    clearStoredTokens();
    localStorage.removeItem('user');
    setUser(null);
  };

  const setUserFromToken = () => {
    const token = getToken('accessToken');
    if (token) {
      try {
        const decodedToken = decodeToken(token);
        const userStr = localStorage.getItem('user');
        const storedUser = userStr ? JSON.parse(userStr) : {};

        const userData: User = {
          ...storedUser,
          id: parseUserId(decodedToken.id ?? storedUser.id),
          name: decodedToken.sub || storedUser.name || '',
          email: decodedToken.email || storedUser.email || '',
          roles: decodedToken.roles || storedUser.roles || '',
          profileImage: resolveProfileImage(decodedToken.profileImage, decodedToken.picture, storedUser.profileImage),
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

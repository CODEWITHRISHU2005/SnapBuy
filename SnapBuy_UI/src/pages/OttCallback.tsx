import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { decodeToken } from '../utils/jwt';
import { resolveProfileImage } from '../utils/profileImage';
import { ottAPI } from '../services/api';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const clearAuthTokens = () => {
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.warn('Unable to clear auth tokens from localStorage', error);
  }
};

const storeAuthTokens = (accessToken: string, refreshToken: string) => {
  try {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return true;
  } catch (error) {
    console.error('Unable to store authentication tokens', error);
    clearAuthTokens();
    return false;
  }
};

const OttCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserFromToken } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Verifying your magic link...');

  useEffect(() => {
    const verifyMagicLink = async () => {
      try {
        const token = searchParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage('No verification token found in the magic link. Please request a new one.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Call the backend endpoint to login with the OTT token
        const response = await ottAPI.login(token);
        const { accessToken, refreshToken } = response.data;

        if (!accessToken) {
          setStatus('error');
          setMessage('Authentication failed. No access token returned.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Store tokens safely in localStorage
        const stored = storeAuthTokens(accessToken, refreshToken || '');

        if (!stored) {
          setStatus('error');
          setMessage('Unable to store authentication tokens. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Decode token to get user information
        const decodedToken = decodeToken(accessToken);
        console.log('Magic Link Login - Decoded Token:', decodedToken);

        const userData = {
          id: decodedToken.id || 0,
          name: decodedToken.sub || '',
          email: decodedToken.email || '',
          roles: decodedToken.roles || '',
          profileImage: resolveProfileImage(
            decodedToken.profileImage,
            decodedToken.picture,
            decodedToken.avatar_url,
            decodedToken.avatar
          ),
        };

        // Store user data
        localStorage.setItem('user', JSON.stringify(userData));

        // Update AuthContext state so the user is marked as authenticated
        setUserFromToken();

        // Successful login
        setStatus('success');
        setMessage('Successfully authenticated! Redirecting to homepage...');

        // Redirect to home page
        setTimeout(() => navigate('/'), 1500);
      } catch (err: any) {
        console.error('Magic link verification error:', err);
        clearAuthTokens();
        setStatus('error');
        const errorMsg = err.response?.data?.message || 'Invalid or expired magic link. Please request a new one.';
        setMessage(errorMsg);
        setTimeout(() => navigate('/login'), 4000);
      }
    };

    verifyMagicLink();
  }, [searchParams, navigate, setUserFromToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 transition-colors duration-500">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-200/40 to-pink-200/40 dark:from-purple-900/30 dark:to-pink-900/20 blur-3xl animate-blob" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-200/40 to-blue-200/40 dark:from-indigo-900/30 dark:to-blue-900/20 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-pink-200/40 to-rose-200/40 dark:from-pink-900/30 dark:to-rose-900/20 blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Card container */}
      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="glass-enhanced p-10 rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700/50 backdrop-blur-xl">
          <div className="text-center">
            {/* Status Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white mb-6 shadow-2xl shadow-indigo-500/50 animate-float-3d relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {status === 'processing' && <Loader2 className="w-10 h-10 relative z-10 animate-spin" />}
              {status === 'success' && <CheckCircle2 className="w-10 h-10 relative z-10" />}
              {status === 'error' && <AlertCircle className="w-10 h-10 relative z-10" />}
            </div>

            {/* Header Text */}
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-3 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
              {status === 'processing' && 'Magic Link Login'}
              {status === 'success' && 'Welcome Back!'}
              {status === 'error' && 'Verification Failed'}
            </h2>

            {/* Message Description */}
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
              {message}
            </p>

            {/* Loading indicator bar */}
            {status === 'processing' && (
              <div className="mt-8">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-text-shimmer"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OttCallback;

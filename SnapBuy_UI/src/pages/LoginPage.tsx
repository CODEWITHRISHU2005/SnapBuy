import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ottAPI } from '../services/api';
import { Package, Mail, Lock, User, ArrowRight, MapPin, CheckCircle2, AlertCircle, Sparkles, Phone } from 'lucide-react';
import type { Address } from '../types';
import { decodeToken } from '../utils/jwt';

const LoginPage: React.FC = () => {
  const [isOTT, setIsOTT] = useState(false);
  const [ottStep, setOttStep] = useState<'request' | 'verify'>('request');
  const [ottToken, setOttToken] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  const [role, setRole] = useState('ROLE_USER');
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const { login, register, setUserFromToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);

    // Check for token or error in URL (from OAuth redirect)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const errorParam = params.get('error');

    if (token) {
      localStorage.setItem('accessToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      try {
        const decodedToken = decodeToken(token);
        const userData = {
          id: decodedToken.id || 0,
          name: decodedToken.sub || '',
          email: decodedToken.email || '',
          roles: decodedToken.roles || '',
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUserFromToken();
        navigate('/');
      } catch (e) {
        console.error("Failed to process token from URL", e);
        setError('Authentication failed. Invalid token.');
      }
    } else if (errorParam) {
      setError(errorParam === 'oauth_failed' ? 'Google login failed. Please try again.' : errorParam);
    }
  }, [setUserFromToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget as HTMLFormElement;

    try {
      if (isLogin) {
        await login({ email: username, password });

      } else {
        await register({
          id: 0,
          name: username,
          email: username,
          password,
          phoneNumber,
          roles: role,
          userAddress: address
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
      // Shake animation on error
      if (form) {
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTT = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await ottAPI.send(username);
      setSuccessMessage(`Magic link sent to ${username}! Check your email.`);
      setOttStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithOTT = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await ottAPI.login(ottToken);
      const { accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Decode token and set user data (similar to regular login)
      const decodedToken = decodeToken(accessToken);
      const userData = {
        id: decodedToken.id || 0,
        name: decodedToken.sub || '',
        email: decodedToken.email || '',
        roles: decodedToken.roles || '',
      };
      localStorage.setItem('user', JSON.stringify(userData));

      // Update AuthContext state so user is shown as logged in
      setUserFromToken();

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // The frontend must redirect to the authorization endpoint to START the flow.
    // Spring Security will then redirect to Google with the configured redirect-uri (login/oauth2/code/google)
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 transition-colors duration-500">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-200/40 to-pink-200/40 dark:from-purple-900/30 dark:to-pink-900/20 blur-3xl animate-blob" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-200/40 to-blue-200/40 dark:from-indigo-900/30 dark:to-blue-900/20 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-pink-200/40 to-rose-200/40 dark:from-pink-900/30 dark:to-rose-900/20 blur-3xl animate-blob animation-delay-4000" />

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      <div className={`max-w-md w-full mx-4 relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="glass-enhanced p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700/50 backdrop-blur-xl transition-all duration-500 hover:shadow-3xl">
          {/* Header with Animation */}
          <div className={`text-center mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white mb-6 shadow-2xl shadow-indigo-500/50 animate-float-3d relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Package className="w-8 h-8 relative z-10" />
            </div>
            <h2 className="text-4xl font-bold font-display text-slate-900 dark:text-white mb-3 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
              {isOTT
                ? (ottStep === 'request' ? 'Login with Magic Link' : 'Verify Token')
                : (isLogin ? 'Welcome Back' : 'Create Account')}
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
              {isOTT
                ? (ottStep === 'request' ? 'Enter your email to receive a magic link' : 'Enter the token sent to your email')
                : (isLogin ? 'Enter your details to access your account' : 'Start your journey with us today')}
            </p>
          </div>

          {isOTT ? (
            // OTT Form
            <form className={`space-y-6 form-transition ${mounted ? 'opacity-100' : 'opacity-0'}`} onSubmit={ottStep === 'request' ? handleSendOTT : handleLoginWithOTT}>
              <div className="space-y-5">
                {ottStep === 'request' ? (
                  <div className="animate-slide-in-bottom">
                    <label htmlFor="ott-username" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative group input-glow">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                        <Mail className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                      </div>
                      <input
                        id="ott-username"
                        name="username"
                        type="email"
                        required
                        className="block w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                        placeholder="Enter your email address"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="animate-slide-in-bottom">
                    <label htmlFor="ott-token" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Token
                    </label>
                    <div className="relative group input-glow">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                        <Lock className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                      </div>
                      <input
                        id="ott-token"
                        name="token"
                        type="text"
                        required
                        className="block w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                        placeholder="Enter token"
                        value={ottToken}
                        onChange={(e) => setOttToken(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/30 p-4 border-2 border-red-200 dark:border-red-800 animate-slide-in-top flex items-center gap-3 shadow-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl bg-green-50 dark:bg-green-900/30 p-4 border-2 border-green-200 dark:border-green-800 animate-slide-in-top flex items-center gap-3 shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 animate-success-check" />
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">{successMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-ripple w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 group"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {ottStep === 'request' ? 'Send Magic Link' : 'Verify & Login'}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsOTT(false);
                    setOttStep('request');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 hover:underline"
                >
                  ← Back to Password Login
                </button>
              </div>
            </form>
          ) : (
            // Standard Login/Register Form
            <form className={`space-y-6 form-transition ${mounted ? 'opacity-100' : 'opacity-0'}`} onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="animate-slide-in-bottom">
                  <label htmlFor="username" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative group input-glow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                      <Mail className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="email"
                      required
                      className="block w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                      placeholder="Enter your email address"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div className="animate-slide-in-bottom delay-100">
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Confirm Email
                      </label>
                      <div className="relative group input-glow">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                          <Mail className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          className="block w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="animate-slide-in-bottom delay-150">
                      <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Phone Number
                      </label>
                      <div className="relative group input-glow">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                          <Phone className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                        </div>
                        <input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          required
                          className="block w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                          placeholder="Enter your phone number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="animate-slide-in-bottom delay-200">
                      <label htmlFor="role" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Role
                      </label>
                      <div className="relative group input-glow">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                          <User className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                        </div>
                        <select
                          id="role"
                          name="role"
                          className="block w-full pl-12 pr-10 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700 appearance-none cursor-pointer"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                        >
                          <option value="ROLE_USER">User</option>
                          <option value="ROLE_ADMIN">Admin</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                          <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Address Fields */}
                    <div className="animate-slide-in-bottom delay-300 space-y-4 pt-4 border-t-2 border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                          <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Address (Optional)
                        </label>
                      </div>

                      <div>
                        <label htmlFor="street" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                          Street Address
                        </label>
                        <input
                          id="street"
                          name="street"
                          type="text"
                          className="block w-full px-4 py-3 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                          placeholder="Enter street address"
                          value={address.street}
                          onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="city" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            City
                          </label>
                          <input
                            id="city"
                            name="city"
                            type="text"
                            className="block w-full px-4 py-3 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                            placeholder="Enter city name"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          />
                        </div>

                        <div>
                          <label htmlFor="state" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            State
                          </label>
                          <input
                            id="state"
                            name="state"
                            type="text"
                            className="block w-full px-4 py-3 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                            placeholder="Enter state name"
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="zipCode" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            ZIP Code
                          </label>
                          <input
                            id="zipCode"
                            name="zipCode"
                            type="text"
                            className="block w-full px-4 py-3 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                            placeholder="Enter pincode"
                            value={address.zipCode}
                            onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                          />
                        </div>

                        <div>
                          <label htmlFor="country" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            Country
                          </label>
                          <input
                            id="country"
                            name="country"
                            type="text"
                            className="block w-full px-4 py-3 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                            placeholder="Enter country name"
                            value={address.country}
                            onChange={(e) => setAddress({ ...address, country: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className={`${!isLogin ? 'animate-slide-in-bottom delay-300' : ''}`}>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative group input-glow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                      <Lock className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="block w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/30 p-4 border-2 border-red-200 dark:border-red-800 animate-slide-in-top flex items-center gap-3 shadow-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-ripple w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                ) : (
                  <span className="relative z-10 flex items-center">
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                )}
              </button>

              {/* Google Sign-In Button - Only show on login, not register */}
              {isLogin && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">OR</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-4 focus:ring-slate-300/30 dark:focus:ring-slate-600/30 transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </>
              )}

              <div className="flex flex-col gap-4 text-center mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    if (!isLogin) {
                      setPhoneNumber('');
                      setAddress({
                        street: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: '',
                      });
                    }
                  }}
                  className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 hover:underline"
                >
                  {isLogin ? (
                    <>
                      Don't have an account? <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Sign up</span>
                    </>
                  ) : (
                    <>
                      Already have an account? <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Sign in</span>
                    </>
                  )}
                </button>

                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOTT(true);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="w-full py-3.5 px-4 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 flex items-center justify-center group hover:scale-[1.02] shadow-md hover:shadow-lg"
                  >
                    <Sparkles className="mr-2 w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                    Login with Magic Link
                    <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

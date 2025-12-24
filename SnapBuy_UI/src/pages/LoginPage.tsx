import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ottAPI, otpAPI } from '../services/api';
import { Package, Mail, Lock, ArrowRight, MapPin, CheckCircle2, AlertCircle, Sparkles, Phone, Shield, User, Camera } from 'lucide-react';
import type { Address } from '../types';
import { Role } from '../types';
import { decodeToken } from '../utils/jwt';
import { resolveProfileImage } from '../utils/profileImage';

const initialAddressState: Address = {
  street: '',
  city: '',
  state: '',
  pinCode: '',
  country: '',
  phoneNumber: '',
};

const LoginPage: React.FC = () => {
  const [isOTT, setIsOTT] = useState(false);
  const [ottStep, setOttStep] = useState<'request' | 'verify'>('request');
  const [ottToken, setOttToken] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [loginOtpStatus, setLoginOtpStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'verified'>('idle');
  const [loginOtpMessage, setLoginOtpMessage] = useState('');
  const [loginOtpError, setLoginOtpError] = useState('');
  const [loginOtpExpiresAt, setLoginOtpExpiresAt] = useState<string | null>(null);


  const [adminKey, setAdminKey] = useState('');
  const [address, setAddress] = useState<Address>({ ...initialAddressState });

  const { login, register, setUserFromToken } = useAuth();
  const navigate = useNavigate();

  const storeTokensSafely = (accessToken: string, refreshToken?: string) => {
    try {
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error('Unable to store authentication tokens.');
    }
  };

  const normalizePhone = (value: string) => value.replace(/\D/g, '');
  const sanitizePhoneForPayload = (value: string) => {
    const digitsOnly = normalizePhone(value);
    if (!digitsOnly) {
      return '';
    }
    return value.trim().startsWith('+') ? `+${digitsOnly}` : digitsOnly;
  };
  const isValidPhone = (value: string) => {
    const digits = normalizePhone(value);
    return digits.length >= 10 && digits.length <= 15;
  };

  const formatExpiryTime = (timestamp: string | null) => {
    if (!timestamp) {
      return '';
    }
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const resetOtpState = () => {
    setLoginOtp('');
    setLoginOtpStatus('idle');
    setLoginOtpMessage('');
    setLoginOtpError('');
    setLoginOtpExpiresAt(null);
    setLoginPhone('');
  };

  const handleSendOtp = async (action: 'send' | 'resend' = 'send') => {
    const phoneInput = loginPhone;
    const sanitizedPhone = sanitizePhoneForPayload(phoneInput);
    const emailInput = username.trim();
    
    if (!isValidPhone(phoneInput)) {
      setLoginOtpError('Enter a valid phone number to receive the OTP (10-15 digits).');
      return;
    }

    if (!emailInput) {
      setLoginOtpError('Enter your email address before requesting an OTP.');
      return;
    }

    setLoginOtpStatus('sending');
    setLoginOtpMessage('');
    setLoginOtpError('');

    try {
      const payload = { phone: sanitizedPhone, email: emailInput };
      const { data } = action === 'send'
        ? await otpAPI.send(payload)
        : await otpAPI.resend(payload);
      
      setLoginOtpStatus('sent');
      setLoginOtpMessage(data.message || `OTP ${action === 'send' ? 'sent' : 'resent'} successfully.`);
      setLoginOtpExpiresAt(data.expiresAt ?? null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Unable to send OTP. Please try again.';
      setLoginOtpStatus('idle');
      setLoginOtpError(errorMessage);
    }
  };



  useEffect(() => {
    setMounted(true);

    // Check for token or error in URL (from OAuth redirect)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const errorParam = params.get('error');

    if (token) {
      try {
        storeTokensSafely(token, refreshToken ?? undefined);

        const decodedToken = decodeToken(token);
        const userData = {
          id: decodedToken.id || 0,
          name: decodedToken.sub || '',
          email: decodedToken.email || '',
          roles: decodedToken.roles || '',
          profileImage: resolveProfileImage(decodedToken.profileImage, decodedToken.picture, decodedToken.avatar_url, decodedToken.avatar),
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUserFromToken();
        navigate('/');
      } catch (e) {
        console.error("Failed to process token from URL", e);
        setError('Authentication failed. Invalid or oversized token.');
      }
    } else if (errorParam) {
      setError(errorParam === 'oauth_failed' ? 'Google login failed. Please try again.' : errorParam);
    }
  }, [setUserFromToken, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Keep the full string for preview
        setProfileImagePreview(base64String);

        // Strip the data:image/...;base64, prefix for the backend
        // The backend expects a raw base64 string for the byte[] field
        const base64Content = base64String.split(',')[1];
        setProfileImage(base64Content);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget as HTMLFormElement;

    try {
      if (isLogin) {
        // For login with OTP: Send OTP data to backend, which will verify and authenticate
        const sanitizedPhone = sanitizePhoneForPayload(loginPhone);
        const emailInput = username.trim();
        
        // Check if OTP was requested
        if (loginOtpStatus === 'idle') {
          setError('Please request an OTP before signing in.');
          setLoading(false);
          return;
        }
        
        // Check if OTP was entered
        if (!loginOtp || loginOtp.trim().length < 4) {
          setError('Please enter the OTP sent to your phone.');
          setLoading(false);
          return;
        }
        
        // Backend will verify the OTP during sign-in
        await login({
          email: emailInput,
          phone: sanitizedPhone,
          otp: loginOtp.trim(),
        });
      } else {
        const sanitizedAddress = Object.fromEntries(
          Object.entries(address).map(([key, value]) => [key, value.trim() === '' ? undefined : value.trim()])
        );
        
        // Remove undefined keys to create a clean object
        const finalAddress = Object.keys(sanitizedAddress).length > 0
          ? JSON.parse(JSON.stringify(sanitizedAddress)) // Quick way to strip undefined
          : undefined;

        const signupData = {
          id: 0,
          name: fullName,
          email: username,
          password,
          profileImage: profileImage || undefined,
          adminKey: adminKey || undefined,
          roles: [adminKey === 'Rishabh@2005' ? Role.ADMIN : Role.USER],
          userAddress: finalAddress
        };
        console.log('Signup attempt with data:', {
          ...signupData,
          password: '***',
          adminKey: adminKey ? '***' : undefined,
          isAdminSignup: adminKey === 'Rishabh@2005'
        });
        await register(signupData);
      }
      navigate('/');
    } catch (err: any) {
      console.error('Authentication error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Error message:', err.response?.data?.message);
      console.error('Error status:', err.response?.status);

      let errorMessage = 'Authentication failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        if (typeof err.response.data.error === 'object') {
          errorMessage = err.response.data.error.message || JSON.stringify(err.response.data.error);
        } else {
          errorMessage = String(err.response.data.error);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

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

      storeTokensSafely(accessToken, refreshToken);

      // Decode token and set user data (similar to regular login)
      const decodedToken = decodeToken(accessToken);
      const userData = {
        id: decodedToken.id || 0,
        name: decodedToken.sub || '',
        email: decodedToken.email || '',
        roles: decodedToken.roles || '',
        profileImage: resolveProfileImage(decodedToken.profileImage, decodedToken.picture, decodedToken.avatar_url, decodedToken.avatar),
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
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    
    window.location.href = `${API_URL}/login/oauth2/code/google`;
  };

  const isLoginOtpSending = loginOtpStatus === 'sending';


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
                    resetOtpState();
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
                {!isLogin && (
                  <div className="animate-slide-in-bottom">
                    <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative group input-glow">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                        <User className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                      </div>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        className="block w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>
                )}
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

                {isLogin && (
                  <div className="animate-slide-in-bottom">
                    <label htmlFor="loginPhone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Phone Number (OTP Verification)
                    </label>
                    <div className="relative group input-glow">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                        <Phone className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                      </div>
                      <input
                        id="loginPhone"
                        name="loginPhone"
                        type="tel"
                        required
                        inputMode="tel"
                        pattern="[0-9+ ]*"
                        className="block w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                        placeholder="Enter phone number linked to your account"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                      We will send a verification OTP to this number for secure sign in.
                    </p>
                  </div>
                )}

                {isLogin && (
                  <div className="animate-slide-in-bottom">
                    <div className="rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-slate-800/50 p-4 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-indigo-500" />
                            Secure with OTP
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {loginOtpStatus === 'verified'
                              ? 'Phone verified • Ready to sign in'
                              : loginOtpExpiresAt
                                ? `Current OTP expires at ${formatExpiryTime(loginOtpExpiresAt)}`
                                : 'OTP is valid for 5 minutes'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void handleSendOtp()}
                            disabled={!isValidPhone(loginPhone) || isLoginOtpSending}
                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                          >
                            {loginOtpStatus === 'sending' ? 'Sending...' : 'Send OTP'}
                          </button>
                          {loginOtpStatus === 'sent' && (
                            <button
                              type="button"
                              onClick={() => void handleSendOtp('resend')}
                              disabled={isLoginOtpSending}
                              className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Resend
                            </button>
                          )}
                        </div>
                      </div>

                      {loginOtpStatus !== 'idle' && (
                        <div className="mt-4">
                          <div className="relative">
                            <input
                              type="tel"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={6}
                              placeholder="Enter 4-6 digit OTP"
                              className="block w-full px-4 py-3 bg-white/80 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition"
                              value={loginOtp}
                              onChange={(e) => setLoginOtp(e.target.value.replace(/[^\d]/g, ''))}
                            />
                          </div>
                        </div>
                      )}

                      {loginOtpMessage && (
                        <p className="mt-3 text-xs font-medium text-green-600 dark:text-green-400">
                          {loginOtpMessage}
                          {loginOtpExpiresAt && ` • Expires at ${formatExpiryTime(loginOtpExpiresAt)}`}
                        </p>
                      )}
                      {loginOtpError && (
                        <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">
                          {loginOtpError}
                        </p>
                      )}
                    </div>
                  </div>
                )}

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
                          value={address.phoneNumber}
                          onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
                        />
                      </div>
                    </div>




                    {/* Profile Image Upload */}
                    <div className="animate-slide-in-bottom delay-200">
                      <label htmlFor="profileImage" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Profile Image (Optional)
                      </label>
                      <div className="relative">
                        <input
                          id="profileImage"
                          name="profileImage"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="profileImage"
                          className="flex flex-col items-center justify-center w-full px-4 py-6 bg-white/80 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 group hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
                        >
                          {profileImagePreview ? (
                            <div className="relative">
                              <img
                                src={profileImagePreview}
                                alt="Profile preview"
                                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200 dark:border-indigo-700 shadow-lg"
                              />
                              <div className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Camera className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                                <User className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                Click to upload profile image
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-500">
                                PNG, JPG up to 5MB
                              </p>
                            </div>
                          )}
                        </label>
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
                          <label htmlFor="pinCode" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            PIN Code
                          </label>
                          <input
                            id="pinCode"
                            name="pinCode"
                            type="text"
                            className="block w-full px-4 py-3 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                            placeholder="Enter pincode"
                          value={address.pinCode}
                          onChange={(e) => setAddress({ ...address, pinCode: e.target.value })}
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

                {!isLogin && (
                  <div className="animate-slide-in-bottom delay-300">
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
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div className="animate-slide-in-bottom delay-400">
                    <label htmlFor="adminKey" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Admin Secret Key (Optional)
                    </label>
                    <div className="relative group input-glow">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-all duration-300">
                        <Shield className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110" />
                      </div>
                      <input
                        id="adminKey"
                        name="adminKey"
                        type="password"
                        className="block w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                        placeholder="Enter admin key to register as admin"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
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
                    const nextIsLogin = !isLogin;
                    setIsLogin(nextIsLogin);
                    setError('');
                    if (nextIsLogin) {
                      resetOtpState();
                      setFullName('');
                      setProfileImage('');
                      setProfileImagePreview('');
                      setAddress({ ...initialAddressState });
                    } else {
                      resetOtpState();
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

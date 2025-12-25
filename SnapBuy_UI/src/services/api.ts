import axios from 'axios';
import type {
  AuthRequest,
  JwtResponse,
  Product,
  User,
  OrderRequest,
  OrderResponse,
  StripeRequest,
  StripeResponse,
  OtpRequest,
  OtpResponse,
} from '../types';
const getStoredToken = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Unable to read ${key} from localStorage`, error);
    return null;
  }
};

const setStoredToken = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Unable to write ${key} to localStorage`, error);
    return false;
  }
};

const clearAuthTokens = () => {
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.warn('Unable to clear auth tokens from localStorage', error);
  }
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (getStoredToken('refreshToken')) {
    clearAuthTokens();
    window.location.href = '/login';
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getStoredToken('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refreshToken`, {
          token: refreshToken,
        });
        const { accessToken } = response.data;

        const stored = accessToken ? setStoredToken('accessToken', accessToken) : false;
        if (!stored) {
          clearAuthTokens();
          window.location.href = '/login';
          return Promise.reject(new Error('Unable to persist refreshed access token'));
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        clearAuthTokens();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signIn: (data: AuthRequest) => api.post<JwtResponse>('/auth/signIn', data),
  signUp: (data: User) => api.post<JwtResponse>('/auth/signUp', data),
  refreshToken: (token: string) => api.post<JwtResponse>('/auth/refreshToken', { token }),
  googleSignIn: (credential: string) => api.post<JwtResponse>('/auth/google', { credential }),
};

export const productAPI = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
  search: (keyword: string) => api.get<Product[]>(`/products/search?keyword=${keyword}`),
  getPaginated: (page: number, size: number, sortBy: string, sortDirection: string) =>
    api.get<{ content: Product[], totalPages: number, totalElements: number }>(`/products/pagination-sorting?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`),
  create: (product: FormData) => api.post<Product>('/products', product),
  delete: (id: number) => api.delete(`/products/${id}`),
  getImage: (id: number) => api.get<Blob>(`/products/${id}/image`, { responseType: 'blob' }),
  generateDescription: (name: string, category: string) =>
    api.post<string>(`/products/generate-description?name=${encodeURIComponent(name)}&category=${encodeURIComponent(category)}`, {}),
  generateImage: (name: string, category: string, description: string) =>
    api.post<Blob>(`/products/generate-image?name=${encodeURIComponent(name)}&category=${encodeURIComponent(category)}&description=${encodeURIComponent(description)}`, null, { responseType: 'blob' }),
};

export const orderAPI = {
  place: (order: OrderRequest) => api.post<OrderResponse>('/orders/place', order),
  getAll: () => api.get<OrderResponse[]>('/orders/allOrders'),
};

export const paymentAPI = {
  initiateStripe: (payload: StripeRequest) => api.post<StripeResponse>('/payments/stripe', payload),
};

export const chatAPI = {
  ask: (message: string) => api.get<string>(`/chat/ask?message=${encodeURIComponent(message)}`),
};

export const ottAPI = {
  send: (username: string) => api.post<string>(`/ott/sent?email=${encodeURIComponent(username)}`),
  login: (token: string) => api.post<JwtResponse>(`/ott/login?token=${encodeURIComponent(token)}`),
};

export const otpAPI = {
  // All endpoints now use OtpRequest (otp field is optional for send/resend)
  send: (payload: OtpRequest) => api.post<OtpResponse>('/otp/send', payload),
  verify: (payload: OtpRequest) => api.post<OtpResponse>('/otp/verify', payload),
  resend: (payload: OtpRequest) => api.post<OtpResponse>('/otp/resend', payload),
};

export default api;

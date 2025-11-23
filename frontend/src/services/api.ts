import axios from 'axios';
import type { AuthRequest, JwtResponse, Product, User, OrderRequest, OrderResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refreshToken`, {
          token: refreshToken,
        });
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
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
};

export const productAPI = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
  search: (keyword: string) => api.get<Product[]>(`/products/search?keyword=${keyword}`),
  getPaginated: (page: number, size: number, sortBy: string, sortDirection: string) =>
    api.get<{content: Product[], totalPages: number, totalElements: number}>(`/products/pagination&sorting?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`),
  create: (product: FormData) => api.post<Product>('/products', product, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id: number) => api.delete(`/products/${id}`),
  getImage: (id: number) => api.get<Blob>(`/products/${id}/image`, { responseType: 'blob' }),
  generateDescription: (name: string, category: string) =>
    api.post<string>(`/products/generate-description?name=${encodeURIComponent(name)}&category=${encodeURIComponent(category)}`),
  generateImage: (name: string, category: string, description: string) =>
    api.post<Blob>(`/products/generate-image?name=${encodeURIComponent(name)}&category=${encodeURIComponent(category)}&description=${encodeURIComponent(description)}`, null, { responseType: 'blob' }),
};

export const orderAPI = {
  place: (order: OrderRequest) => api.post<OrderResponse>('/orders/place', order),
  getAll: () => api.get<OrderResponse[]>('/orders/allOrders'),
};

export const chatAPI = {
  ask: (message: string) => api.get<string>(`/chat/ask?message=${encodeURIComponent(message)}`),
};

export const ottAPI = {
  send: (username: string) => api.post<string>(`/ott/sent?username=${encodeURIComponent(username)}`),
  login: (token: string) => api.post<JwtResponse>(`/ott/login?token=${encodeURIComponent(token)}`),
};

export default api;

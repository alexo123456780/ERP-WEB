import api from './api';
import { ApiResponse, AuthData } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthData> {
    const res = await api.post<ApiResponse<AuthData>>('/auth/login', { email, password });
    return res.data.data;
  },

  async register(data: { nombre: string; email: string; password: string; role: string }) {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },
};

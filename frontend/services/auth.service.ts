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

  saveUser(user: AuthData['user']) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },

  async getMe(): Promise<AuthData['user']> {
    const res = await api.get<ApiResponse<AuthData['user']>>('/auth/me');
    return res.data.data;
  },

  async updateMe(data: { nombre?: string; email?: string; password?: string }): Promise<AuthData['user']> {
    const res = await api.patch<ApiResponse<AuthData['user']>>('/auth/me', data);
    return res.data.data;
  },

  async uploadAvatar(file: File): Promise<{ foto_url: string }> {
    const form = new FormData();
    form.append('avatar', file);
    const res = await api.post<ApiResponse<{ foto_url: string }>>('/auth/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};

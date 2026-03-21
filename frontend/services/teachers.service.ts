import api from './api';
import { ApiResponse, Teacher } from '../types';

export const teachersService = {
  async getAll(activo?: boolean): Promise<Teacher[]> {
    const params = activo !== undefined ? { activo } : {};
    const res = await api.get<ApiResponse<Teacher[]>>('/teachers', { params });
    return res.data.data;
  },

  async getById(id: number): Promise<Teacher> {
    const res = await api.get<ApiResponse<Teacher>>(`/teachers/${id}`);
    return res.data.data;
  },

  async create(data: any): Promise<Teacher> {
    const res = await api.post<ApiResponse<Teacher>>('/teachers', data);
    return res.data.data;
  },

  async update(id: number, data: any): Promise<Teacher> {
    const res = await api.patch<ApiResponse<Teacher>>(`/teachers/${id}`, data);
    return res.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/teachers/${id}`);
  },

  async getSubjects(id: number) {
    const res = await api.get<ApiResponse<any[]>>(`/teachers/${id}/subjects`);
    return res.data.data;
  },
};

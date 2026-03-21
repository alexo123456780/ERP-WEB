import api from './api';
import { ApiResponse, Student } from '../types';

export const studentsService = {
  async getAll(activo?: boolean): Promise<Student[]> {
    const params = activo !== undefined ? { activo } : {};
    const res = await api.get<ApiResponse<Student[]>>('/students', { params });
    return res.data.data;
  },

  async getById(id: number): Promise<Student> {
    const res = await api.get<ApiResponse<Student>>(`/students/${id}`);
    return res.data.data;
  },

  async create(data: any): Promise<Student> {
    const res = await api.post<ApiResponse<Student>>('/students', data);
    return res.data.data;
  },

  async update(id: number, data: any): Promise<Student> {
    const res = await api.patch<ApiResponse<Student>>(`/students/${id}`, data);
    return res.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/students/${id}`);
  },

  async getHistory(id: number) {
    const res = await api.get<ApiResponse<any>>(`/students/${id}/history`);
    return res.data.data;
  },
};

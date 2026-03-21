import api from './api';
import { ApiResponse, Subject } from '../types';

export const subjectsService = {
  async getAll(): Promise<Subject[]> {
    const res = await api.get<ApiResponse<Subject[]>>('/subjects');
    return res.data.data;
  },

  async getById(id: number): Promise<Subject> {
    const res = await api.get<ApiResponse<Subject>>(`/subjects/${id}`);
    return res.data.data;
  },

  async create(data: any): Promise<Subject> {
    const res = await api.post<ApiResponse<Subject>>('/subjects', data);
    return res.data.data;
  },

  async update(id: number, data: any): Promise<Subject> {
    const res = await api.patch<ApiResponse<Subject>>(`/subjects/${id}`, data);
    return res.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/subjects/${id}`);
  },

  async enroll(subjectId: number, studentId: number, ciclo: string) {
    const res = await api.post<ApiResponse<any>>(`/subjects/${subjectId}/enroll`, { student_id: studentId, ciclo });
    return res.data.data;
  },

  async getStudents(subjectId: number) {
    const res = await api.get<ApiResponse<any[]>>(`/subjects/${subjectId}/students`);
    return res.data.data;
  },
};

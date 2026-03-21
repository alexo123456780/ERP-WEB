import api from './api';
import { ApiResponse, Grade } from '../types';

export const gradesService = {
  async create(data: { enrollment_id: number; parcial: number; calificacion: number; fecha?: string }): Promise<Grade> {
    const res = await api.post<ApiResponse<Grade>>('/grades', data);
    return res.data.data;
  },

  async getByStudent(studentId: number): Promise<Grade[]> {
    const res = await api.get<ApiResponse<Grade[]>>(`/grades/student/${studentId}`);
    return res.data.data;
  },

  async getBySubject(subjectId: number): Promise<Grade[]> {
    const res = await api.get<ApiResponse<Grade[]>>(`/grades/subject/${subjectId}`);
    return res.data.data;
  },

  async getAverage(studentId: number) {
    const res = await api.get<ApiResponse<any>>(`/grades/student/${studentId}/average`);
    return res.data.data;
  },
};

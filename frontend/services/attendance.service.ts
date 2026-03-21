import api from './api';
import { ApiResponse, Attendance } from '../types';

export const attendanceService = {
  async create(data: { enrollment_id: number; fecha: string; presente?: boolean; justificado?: boolean }): Promise<Attendance> {
    const res = await api.post<ApiResponse<Attendance>>('/attendance', data);
    return res.data.data;
  },

  async getByStudent(studentId: number) {
    const res = await api.get<ApiResponse<any>>(`/attendance/student/${studentId}`);
    return res.data.data;
  },

  async getBySubject(subjectId: number): Promise<Attendance[]> {
    const res = await api.get<ApiResponse<Attendance[]>>(`/attendance/subject/${subjectId}`);
    return res.data.data;
  },
};

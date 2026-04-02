import api from './api';
import { ApiResponse, Payment } from '../types';

export const paymentsService = {
  async getAll(): Promise<Payment[]> {
    const res = await api.get<ApiResponse<Payment[]>>('/payments');
    return res.data.data;
  },

  async create(data: any): Promise<Payment> {
    const res = await api.post<ApiResponse<Payment>>('/payments', data);
    return res.data.data;
  },

  async getByStudent(studentId: number): Promise<Payment[]> {
    const res = await api.get<ApiResponse<Payment[]>>(`/payments/student/${studentId}`);
    return res.data.data;
  },

  async updateStatus(id: number, estado: 'pagado' | 'pendiente', fecha_pago?: string): Promise<Payment> {
    const res = await api.patch<ApiResponse<Payment>>(`/payments/${id}/status`, { estado, fecha_pago });
    return res.data.data;
  },

  async getPending(): Promise<Payment[]> {
    const res = await api.get<ApiResponse<Payment[]>>('/payments/pending');
    return res.data.data;
  },
};

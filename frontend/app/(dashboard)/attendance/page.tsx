'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../../../services/attendance.service';
import { studentsService } from '../../../services/students.service';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { FormField, inputClass } from '../../../components/ui/FormField';
import { Attendance, Student } from '../../../types';

export default function AttendancePage() {
  const qc = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [modal, setModal] = useState(false);
  const [mutError, setMutError] = useState('');
  const [form, setForm] = useState({ enrollment_id: '', fecha: new Date().toISOString().split('T')[0], presente: true, justificado: false });

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: studentsService.getAll });

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance', selectedStudent],
    queryFn: () => selectedStudent ? attendanceService.getByStudent(selectedStudent) : Promise.resolve(null),
    enabled: !!selectedStudent,
  });

  const createMut = useMutation({
    mutationFn: (d: any) => attendanceService.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attendance'] }); setModal(false); },
    onError: (e: any) => setMutError(e.response?.data?.message || 'Error'),
  });

  const columns = [
    { key: 'subject', header: 'Materia', render: (r: Attendance) => r.enrollment?.subject?.nombre ?? '—' },
    { key: 'fecha', header: 'Fecha' },
    {
      key: 'presente', header: 'Asistencia', render: (r: Attendance) => (
        <span className={r.presente ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {r.presente ? '✓ Presente' : '✗ Ausente'}
        </span>
      )
    },
    { key: 'justificado', header: 'Justificado', render: (r: Attendance) => r.justificado ? 'Sí' : 'No' },
  ];

  const resumen = attendanceData?.resumen;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Asistencias</h2>
        <button onClick={() => { setMutError(''); setModal(true); }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">+ Registrar asistencia</button>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ver asistencias por alumno</label>
        <select className={inputClass} value={selectedStudent ?? ''} onChange={(e) => setSelectedStudent(e.target.value ? Number(e.target.value) : null)}>
          <option value="">Seleccionar alumno</option>
          {students.map((s: Student) => <option key={s.id} value={s.id}>{s.user.nombre} — {s.curp}</option>)}
        </select>
      </div>

      {resumen && (
        <div className={`rounded-xl p-4 border text-sm ${resumen.alerta ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex gap-6 flex-wrap">
            <span><strong>Total:</strong> {resumen.total}</span>
            <span className="text-green-700"><strong>Presentes:</strong> {resumen.presentes}</span>
            <span className="text-red-700"><strong>Ausentes:</strong> {resumen.ausentes}</span>
            <span className={resumen.alerta ? 'text-red-700 font-bold' : 'text-green-700 font-bold'}>
              <strong>% Asistencia:</strong> {resumen.porcentaje_asistencia}%
              {resumen.alerta && ' ⚠️ Bajo porcentaje'}
            </span>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div className="bg-white rounded-xl shadow-sm">
          <DataTable columns={columns} data={attendanceData?.records ?? []} loading={isLoading} emptyMessage="Sin registros de asistencia" />
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Registrar asistencia">
        <form onSubmit={(e) => {
          e.preventDefault(); setMutError('');
          createMut.mutate({ enrollment_id: Number(form.enrollment_id), fecha: form.fecha, presente: form.presente, justificado: form.justificado });
        }} className="space-y-4">
          <FormField label="ID de inscripción (enrollment_id)">
            <input type="number" className={inputClass} value={form.enrollment_id} onChange={(e) => setForm((f) => ({ ...f, enrollment_id: e.target.value }))} required min={1} />
          </FormField>
          <FormField label="Fecha">
            <input type="date" className={inputClass} value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} required />
          </FormField>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.presente} onChange={(e) => setForm((f) => ({ ...f, presente: e.target.checked }))} />
              Presente
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.justificado} onChange={(e) => setForm((f) => ({ ...f, justificado: e.target.checked }))} />
              Justificado
            </label>
          </div>
          {mutError && <p className="text-red-500 text-sm">{mutError}</p>}
          <button type="submit" disabled={createMut.isPending} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">Registrar</button>
        </form>
      </Modal>
    </div>
  );
}

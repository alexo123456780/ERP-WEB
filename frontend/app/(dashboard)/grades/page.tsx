'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gradesService } from '../../../services/grades.service';
import { studentsService } from '../../../services/students.service';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { FormField, inputClass } from '../../../components/ui/FormField';
import { Grade, Student } from '../../../types';

export default function GradesPage() {
  const qc = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [modal, setModal] = useState(false);
  const [mutError, setMutError] = useState('');
  const [form, setForm] = useState({ enrollment_id: '', parcial: '1', calificacion: '', fecha: '' });

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: studentsService.getAll });

  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['grades', selectedStudent],
    queryFn: () => selectedStudent ? gradesService.getByStudent(selectedStudent) : Promise.resolve([]),
    enabled: !!selectedStudent,
  });

  const { data: avg } = useQuery({
    queryKey: ['grades-avg', selectedStudent],
    queryFn: () => selectedStudent ? gradesService.getAverage(selectedStudent) : Promise.resolve(null),
    enabled: !!selectedStudent,
  });

  const createMut = useMutation({
    mutationFn: (d: any) => gradesService.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades'] });
      qc.invalidateQueries({ queryKey: ['grades-avg'] });
      setModal(false);
    },
    onError: (e: any) => setMutError(e.response?.data?.message || 'Error'),
  });

  const columns = [
    { key: 'subject', header: 'Materia', render: (r: Grade) => r.enrollment?.subject?.nombre ?? '—' },
    { key: 'ciclo', header: 'Ciclo', render: (r: Grade) => r.enrollment?.ciclo ?? '—' },
    { key: 'parcial', header: 'Parcial' },
    { key: 'calificacion', header: 'Calificación', render: (r: Grade) => <span className={Number(r.calificacion) >= 60 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{r.calificacion}</span> },
    { key: 'fecha', header: 'Fecha' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Calificaciones</h2>
        <button onClick={() => { setMutError(''); setModal(true); }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">+ Registrar calificación</button>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ver calificaciones por alumno</label>
        <select className={inputClass} value={selectedStudent ?? ''} onChange={(e) => setSelectedStudent(e.target.value ? Number(e.target.value) : null)}>
          <option value="">Seleccionar alumno</option>
          {students.map((s: Student) => <option key={s.id} value={s.id}>{s.user.nombre} — {s.curp}</option>)}
        </select>
      </div>

      {selectedStudent && avg && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
          <span className="font-medium text-blue-700">Promedio general: </span>
          <span className="text-blue-800 text-lg font-bold">{avg.average}</span>
          <span className="text-blue-500 ml-2">({avg.total} calificaciones)</span>
        </div>
      )}

      {selectedStudent && (
        <div className="bg-white rounded-xl shadow-sm">
          <DataTable columns={columns} data={grades} loading={isLoading} emptyMessage="Sin calificaciones" />
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Registrar calificación">
        <form onSubmit={(e) => {
          e.preventDefault(); setMutError('');
          createMut.mutate({
            enrollment_id: Number(form.enrollment_id),
            parcial: Number(form.parcial),
            calificacion: Number(form.calificacion),
            fecha: form.fecha || undefined,
          });
        }} className="space-y-4">
          <FormField label="ID de inscripción (enrollment_id)">
            <input type="number" className={inputClass} value={form.enrollment_id} onChange={(e) => setForm((f) => ({ ...f, enrollment_id: e.target.value }))} required min={1} />
          </FormField>
          <FormField label="Parcial">
            <input type="number" className={inputClass} value={form.parcial} onChange={(e) => setForm((f) => ({ ...f, parcial: e.target.value }))} required min={1} max={10} />
          </FormField>
          <FormField label="Calificación (0-100)">
            <input type="number" className={inputClass} value={form.calificacion} onChange={(e) => setForm((f) => ({ ...f, calificacion: e.target.value }))} required min={0} max={100} step={0.01} />
          </FormField>
          <FormField label="Fecha">
            <input type="date" className={inputClass} value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} />
          </FormField>
          {mutError && <p className="text-red-500 text-sm">{mutError}</p>}
          <button type="submit" disabled={createMut.isPending} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">Registrar</button>
        </form>
      </Modal>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectsService } from '../../../services/subjects.service';
import { teachersService } from '../../../services/teachers.service';
import { studentsService } from '../../../services/students.service';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { FormField, inputClass } from '../../../components/ui/FormField';
import { Subject } from '../../../types';

export default function SubjectsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<'create' | 'edit' | 'enroll' | null>(null);
  const [selected, setSelected] = useState<Subject | null>(null);
  const [mutError, setMutError] = useState('');

  const [form, setForm] = useState({ nombre: '', descripcion: '', creditos: '0', teacher_id: '' });
  const [enrollForm, setEnrollForm] = useState({ student_id: '', ciclo: '' });

  const { data: subjects = [], isLoading } = useQuery({ queryKey: ['subjects'], queryFn: subjectsService.getAll });
  const { data: teachers = [] } = useQuery({ queryKey: ['teachers'], queryFn: teachersService.getAll });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: studentsService.getAll });

  const setField = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const createMut = useMutation({
    mutationFn: (d: any) => subjectsService.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); setModal(null); },
    onError: (e: any) => setMutError(e.response?.data?.message || 'Error'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => subjectsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); setModal(null); },
    onError: (e: any) => setMutError(e.response?.data?.message || 'Error'),
  });

  const deleteMut = useMutation({
    mutationFn: subjectsService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  });

  const enrollMut = useMutation({
    mutationFn: ({ id, sid, ciclo }: any) => subjectsService.enroll(id, sid, ciclo),
    onSuccess: () => { setModal(null); setMutError(''); },
    onError: (e: any) => setMutError(e.response?.data?.message || 'Error al inscribir'),
  });

  const openEdit = (s: Subject) => {
    setSelected(s);
    setForm({ nombre: s.nombre, descripcion: s.descripcion ?? '', creditos: String(s.creditos), teacher_id: String(s.teacher?.id ?? '') });
    setMutError('');
    setModal('edit');
  };

  const columns = [
    { key: 'nombre', header: 'Materia' },
    { key: 'creditos', header: 'Créditos' },
    { key: 'teacher', header: 'Maestro', render: (r: Subject) => r.teacher?.user?.nombre ?? '—' },
    {
      key: 'actions', header: 'Acciones',
      render: (r: Subject) => (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => openEdit(r)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">Editar</button>
          <button onClick={() => { setSelected(r); setMutError(''); setModal('enroll'); }}
            className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100">Inscribir</button>
          <button onClick={() => { if (confirm('¿Eliminar materia?')) deleteMut.mutate(r.id); }}
            className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Eliminar</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Materias</h2>
        <button onClick={() => { setForm({ nombre: '', descripcion: '', creditos: '0', teacher_id: '' }); setMutError(''); setModal('create'); }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">+ Nueva materia</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm">
        <DataTable columns={columns} data={subjects} loading={isLoading} emptyMessage="No hay materias" />
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'create' ? 'Nueva materia' : 'Editar materia'}>
        <form onSubmit={(e) => {
          e.preventDefault(); setMutError('');
          const data = { nombre: form.nombre, descripcion: form.descripcion, creditos: Number(form.creditos), teacher_id: form.teacher_id ? Number(form.teacher_id) : undefined };
          if (modal === 'create') createMut.mutate(data);
          else if (selected) updateMut.mutate({ id: selected.id, data });
        }} className="space-y-4">
          <FormField label="Nombre"><input className={inputClass} value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} required /></FormField>
          <FormField label="Descripción"><textarea className={inputClass} value={form.descripcion} onChange={(e) => setField('descripcion', e.target.value)} rows={2} /></FormField>
          <FormField label="Créditos"><input type="number" className={inputClass} value={form.creditos} onChange={(e) => setField('creditos', e.target.value)} min={0} /></FormField>
          <FormField label="Maestro">
            <select className={inputClass} value={form.teacher_id} onChange={(e) => setField('teacher_id', e.target.value)}>
              <option value="">Sin maestro</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.user.nombre}</option>)}
            </select>
          </FormField>
          {mutError && <p className="text-red-500 text-sm">{mutError}</p>}
          <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">Guardar</button>
        </form>
      </Modal>

      {/* Enroll Modal */}
      <Modal open={modal === 'enroll'} onClose={() => setModal(null)} title={`Inscribir alumno — ${selected?.nombre}`}>
        <form onSubmit={(e) => {
          e.preventDefault(); setMutError('');
          if (selected) enrollMut.mutate({ id: selected.id, sid: Number(enrollForm.student_id), ciclo: enrollForm.ciclo });
        }} className="space-y-4">
          <FormField label="Alumno">
            <select className={inputClass} value={enrollForm.student_id} onChange={(e) => setEnrollForm((f) => ({ ...f, student_id: e.target.value }))} required>
              <option value="">Seleccionar alumno</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.user.nombre} — {s.curp}</option>)}
            </select>
          </FormField>
          <FormField label="Ciclo escolar">
            <input className={inputClass} value={enrollForm.ciclo} onChange={(e) => setEnrollForm((f) => ({ ...f, ciclo: e.target.value }))} placeholder="2024-A" required />
          </FormField>
          {mutError && <p className="text-red-500 text-sm">{mutError}</p>}
          <button type="submit" disabled={enrollMut.isPending} className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">Inscribir</button>
        </form>
      </Modal>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsService } from '../../../services/students.service';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { FormField, inputClass } from '../../../components/ui/FormField';
import { Student } from '../../../types';

function StudentForm({ onSubmit, loading, error, initial }: {
  onSubmit: (data: any) => void;
  loading: boolean;
  error: string;
  initial?: Partial<Student>;
}) {
  const [form, setForm] = useState({
    nombre: initial?.user?.nombre ?? '',
    email: initial?.user?.email ?? '',
    password: '',
    curp: initial?.curp ?? '',
    fecha_nacimiento: initial?.fecha_nacimiento ?? '',
    telefono: initial?.telefono ?? '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <FormField label="Nombre completo">
        <input className={inputClass} value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
      </FormField>
      <FormField label="Email">
        <input type="email" className={inputClass} value={form.email} onChange={(e) => set('email', e.target.value)} required />
      </FormField>
      {!initial && (
        <FormField label="Contraseña">
          <input type="password" className={inputClass} value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={6} />
        </FormField>
      )}
      <FormField label="CURP">
        <input className={inputClass} value={form.curp} onChange={(e) => set('curp', e.target.value.toUpperCase())} required maxLength={18} minLength={18} />
      </FormField>
      <FormField label="Fecha de nacimiento">
        <input type="date" className={inputClass} value={form.fecha_nacimiento ?? ''} onChange={(e) => set('fecha_nacimiento', e.target.value)} />
      </FormField>
      <FormField label="Teléfono">
        <input className={inputClass} value={form.telefono ?? ''} onChange={(e) => set('telefono', e.target.value)} />
      </FormField>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}

export default function StudentsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ type: 'create' | 'edit'; student?: Student } | null>(null);
  const [mutError, setMutError] = useState('');

  const { data: students = [], isLoading } = useQuery({ queryKey: ['students'], queryFn: studentsService.getAll });

  const createMut = useMutation({
    mutationFn: studentsService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setModal(null); },
    onError: (e: any) => setMutError(e.response?.data?.message || 'Error al crear alumno'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => studentsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setModal(null); },
    onError: (e: any) => setMutError(e.response?.data?.message || 'Error al actualizar'),
  });

  const deleteMut = useMutation({
    mutationFn: studentsService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });

  const columns = [
    { key: 'nombre', header: 'Nombre', render: (r: Student) => r.user.nombre },
    { key: 'email', header: 'Email', render: (r: Student) => r.user.email },
    { key: 'curp', header: 'CURP' },
    { key: 'telefono', header: 'Teléfono', render: (r: Student) => r.telefono ?? '—' },
    {
      key: 'actions', header: 'Acciones',
      render: (r: Student) => (
        <div className="flex gap-2">
          <button onClick={() => { setMutError(''); setModal({ type: 'edit', student: r }); }}
            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">Editar</button>
          <button onClick={() => { if (confirm('¿Eliminar alumno?')) deleteMut.mutate(r.id); }}
            className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Eliminar</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Alumnos</h2>
        <button onClick={() => { setMutError(''); setModal({ type: 'create' }); }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
          + Nuevo alumno
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <DataTable columns={columns} data={students} loading={isLoading} emptyMessage="No hay alumnos registrados" />
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.type === 'create' ? 'Nuevo alumno' : 'Editar alumno'}>
        <StudentForm
          initial={modal?.student}
          loading={createMut.isPending || updateMut.isPending}
          error={mutError}
          onSubmit={(data) => {
            setMutError('');
            if (modal?.type === 'create') createMut.mutate(data);
            else if (modal?.student) updateMut.mutate({ id: modal.student.id, data });
          }}
        />
      </Modal>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teachersService } from '../../../services/teachers.service';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { FormField, inputClass } from '../../../components/ui/FormField';
import { Teacher } from '../../../types';

function TeacherForm({ onSubmit, loading, error, initial }: {
  onSubmit: (data: any) => void;
  loading: boolean;
  error: string;
  initial?: Partial<Teacher>;
}) {
  const [form, setForm] = useState({
    nombre: initial?.user?.nombre ?? '',
    email: initial?.user?.email ?? '',
    password: '',
    especialidad: initial?.especialidad ?? '',
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
      <FormField label="Especialidad">
        <input className={inputClass} value={form.especialidad} onChange={(e) => set('especialidad', e.target.value)} />
      </FormField>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}

export default function TeachersPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ type: 'create' | 'edit'; teacher?: Teacher } | null>(null);
  const [mutError, setMutError] = useState('');

  const { data: teachers = [], isLoading } = useQuery({ queryKey: ['teachers'], queryFn: teachersService.getAll });

  const createMut = useMutation({
    mutationFn: teachersService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); setModal(null); },
    onError: (e: any) => setMutError(e.response?.data?.message || 'Error al crear maestro'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => teachersService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); setModal(null); },
    onError: (e: any) => setMutError(e.response?.data?.message || 'Error al actualizar'),
  });

  const deleteMut = useMutation({
    mutationFn: teachersService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teachers'] }),
  });

  const columns = [
    { key: 'nombre', header: 'Nombre', render: (r: Teacher) => r.user.nombre },
    { key: 'email', header: 'Email', render: (r: Teacher) => r.user.email },
    { key: 'especialidad', header: 'Especialidad', render: (r: Teacher) => r.especialidad ?? '—' },
    {
      key: 'actions', header: 'Acciones',
      render: (r: Teacher) => (
        <div className="flex gap-2">
          <button onClick={() => { setMutError(''); setModal({ type: 'edit', teacher: r }); }}
            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">Editar</button>
          <button onClick={() => { if (confirm('¿Eliminar maestro?')) deleteMut.mutate(r.id); }}
            className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Eliminar</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Maestros</h2>
        <button onClick={() => { setMutError(''); setModal({ type: 'create' }); }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
          + Nuevo maestro
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm">
        <DataTable columns={columns} data={teachers} loading={isLoading} emptyMessage="No hay maestros registrados" />
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.type === 'create' ? 'Nuevo maestro' : 'Editar maestro'}>
        <TeacherForm
          initial={modal?.teacher}
          loading={createMut.isPending || updateMut.isPending}
          error={mutError}
          onSubmit={(data) => {
            setMutError('');
            if (modal?.type === 'create') createMut.mutate(data);
            else if (modal?.teacher) updateMut.mutate({ id: modal.teacher.id, data });
          }}
        />
      </Modal>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { teachersService } from '../../../services/teachers.service';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { FormField, inputClass } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
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
        <input className={inputClass} value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required placeholder="Lic. María García López" />
      </FormField>
      <FormField label="Correo electrónico">
        <input type="email" className={inputClass} value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="maestro@escuela.com" />
      </FormField>
      {!initial && (
        <FormField label="Contraseña">
          <input type="password" className={inputClass} value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" />
        </FormField>
      )}
      <FormField label="Especialidad">
        <input className={inputClass} value={form.especialidad} onChange={(e) => set('especialidad', e.target.value)} placeholder="Matemáticas, Ciencias..." />
      </FormField>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Guardando...' : 'Guardar'}
      </Button>
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
    { key: 'nombre', header: 'Nombre', render: (r: Teacher) => <span className="font-medium">{r.user.nombre}</span> },
    { key: 'email', header: 'Correo', render: (r: Teacher) => <span className="text-muted-foreground">{r.user.email}</span> },
    {
      key: 'especialidad', header: 'Especialidad',
      render: (r: Teacher) => r.especialidad
        ? <Badge variant="secondary">{r.especialidad}</Badge>
        : <span className="text-muted-foreground">—</span>
    },
    {
      key: 'actions', header: '',
      render: (r: Teacher) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => { setMutError(''); setModal({ type: 'edit', teacher: r }); }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => { if (confirm('¿Eliminar maestro?')) deleteMut.mutate(r.id); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Maestros</h2>
          <p className="text-sm text-muted-foreground">{teachers.length} maestro{teachers.length !== 1 ? 's' : ''} registrado{teachers.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => { setMutError(''); setModal({ type: 'create' }); }} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Nuevo maestro
        </Button>
      </div>

      <DataTable columns={columns} data={teachers} loading={isLoading} emptyMessage="No hay maestros registrados" />

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.type === 'create' ? 'Nuevo maestro' : 'Editar maestro'}
      >
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

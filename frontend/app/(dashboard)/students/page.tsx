'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { studentsService } from '../../../services/students.service';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { FormField, inputClass } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
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
        <input className={inputClass} value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required placeholder="Juan Perez Garcia" />
      </FormField>
      <FormField label="Correo electrónico">
        <input type="email" className={inputClass} value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="juan@escuela.com" />
      </FormField>
      {!initial && (
        <FormField label="Contraseña">
          <input type="password" className={inputClass} value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" />
        </FormField>
      )}
      <FormField label="CURP">
        <input className={inputClass} value={form.curp} onChange={(e) => set('curp', e.target.value.toUpperCase())} required maxLength={18} minLength={18} placeholder="18 caracteres" />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Fecha de nacimiento">
          <input type="date" className={inputClass} value={form.fecha_nacimiento ?? ''} onChange={(e) => set('fecha_nacimiento', e.target.value)} />
        </FormField>
        <FormField label="Teléfono">
          <input className={inputClass} value={form.telefono ?? ''} onChange={(e) => set('telefono', e.target.value)} placeholder="10 dígitos" />
        </FormField>
      </div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Guardando...' : 'Guardar'}
      </Button>
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
    { key: 'nombre', header: 'Nombre', render: (r: Student) => <span className="font-medium">{r.user.nombre}</span> },
    { key: 'email', header: 'Correo', render: (r: Student) => <span className="text-muted-foreground">{r.user.email}</span> },
    { key: 'curp', header: 'CURP', render: (r: Student) => <span className="font-mono text-xs">{r.curp}</span> },
    { key: 'telefono', header: 'Teléfono', render: (r: Student) => r.telefono ?? <span className="text-muted-foreground">—</span> },
    {
      key: 'actions', header: '',
      render: (r: Student) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => { setMutError(''); setModal({ type: 'edit', student: r }); }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => { if (confirm('¿Eliminar alumno?')) deleteMut.mutate(r.id); }}
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
          <h2 className="text-2xl font-bold tracking-tight">Alumnos</h2>
          <p className="text-sm text-muted-foreground">{students.length} alumno{students.length !== 1 ? 's' : ''} registrado{students.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => { setMutError(''); setModal({ type: 'create' }); }} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Nuevo alumno
        </Button>
      </div>

      <DataTable columns={columns} data={students} loading={isLoading} emptyMessage="No hay alumnos registrados" />

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.type === 'create' ? 'Nuevo alumno' : 'Editar alumno'}
      >
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

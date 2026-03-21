'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { studentsService } from '../../../services/students.service';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { FormField, inputClass } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Spinner } from '../../../components/ui/Spinner';
import { Student } from '../../../types';

type FilterActivo = 'all' | 'true' | 'false';

function StudentForm({ onSubmit, loading, initial }: {
  onSubmit: (data: any) => void;
  loading: boolean;
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
      <Button type="submit" disabled={loading} className="w-full gap-2">
        {loading && <Spinner size="xs" />}
        {loading ? 'Guardando...' : 'Guardar'}
      </Button>
    </form>
  );
}

function StudentInfoModal({ student, onClose }: { student: Student; onClose: () => void }) {
  const row = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[55%] break-all">{value}</span>
    </div>
  );
  return (
    <Modal open onClose={onClose} title="Información del alumno">
      <div className="space-y-0.5">
        {row('Nombre', student.user.nombre)}
        {row('Correo', student.user.email)}
        {row('CURP', <span className="font-mono">{student.curp}</span>)}
        {row('Fecha de nacimiento', student.fecha_nacimiento ?? <span className="text-muted-foreground">—</span>)}
        {row('Teléfono', student.telefono ?? <span className="text-muted-foreground">—</span>)}
        {row('Estado', student.user.activo
          ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">Activo</Badge>
          : <Badge className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-0">Inactivo</Badge>
        )}
        {row('Rol', student.user.role?.name ?? '—')}
        {row('Registrado', new Date(student.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }))}
      </div>
    </Modal>
  );
}

export default function StudentsPage() {
  const qc = useQueryClient();
  const [filterActivo, setFilterActivo] = useState<FilterActivo>('all');
  const [modal, setModal] = useState<{ type: 'create' | 'edit'; student?: Student } | null>(null);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const activoParam = filterActivo === 'all' ? undefined : filterActivo === 'true';

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', filterActivo],
    queryFn: () => studentsService.getAll(activoParam),
  });

  const createMut = useMutation({
    mutationFn: studentsService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setModal(null); toast.success('Alumno creado correctamente'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al crear alumno'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => studentsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setModal(null); toast.success('Alumno actualizado correctamente'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al actualizar'),
  });

  const deleteMut = useMutation({
    mutationFn: studentsService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setDeleteTarget(null); toast.success('Alumno eliminado'); },
    onError: (e: any) => { setDeleteTarget(null); toast.error(e.response?.data?.message || 'Error al eliminar'); },
  });

  const columns = [
    { key: 'nombre', header: 'Nombre', render: (r: Student) => <span className="font-medium">{r.user.nombre}</span> },
    { key: 'email', header: 'Correo', render: (r: Student) => <span className="text-muted-foreground">{r.user.email}</span> },
    { key: 'curp', header: 'CURP', render: (r: Student) => <span className="font-mono text-xs">{r.curp}</span> },
    { key: 'telefono', header: 'Teléfono', render: (r: Student) => r.telefono ?? <span className="text-muted-foreground">—</span> },
    {
      key: 'activo', header: 'Estado',
      render: (r: Student) => r.user.activo
        ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">Activo</Badge>
        : <Badge className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-0">Inactivo</Badge>
    },
    {
      key: 'actions', header: '',
      render: (r: Student) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setViewStudent(r)} title="Ver detalle">
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setModal({ type: 'edit', student: r })} title="Editar">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(r)} title="Eliminar">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const filterBtnClass = (val: FilterActivo) =>
    `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterActivo === val ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Alumnos</h2>
          <p className="text-sm text-muted-foreground">{students.length} alumno{students.length !== 1 ? 's' : ''} registrado{students.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setModal({ type: 'create' })} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />Nuevo alumno
        </Button>
      </div>

      <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 w-fit border border-border">
        <button className={filterBtnClass('all')} onClick={() => setFilterActivo('all')}>Todos</button>
        <button className={filterBtnClass('true')} onClick={() => setFilterActivo('true')}>Activos</button>
        <button className={filterBtnClass('false')} onClick={() => setFilterActivo('false')}>Inactivos</button>
      </div>

      <DataTable columns={columns} data={students} loading={isLoading} emptyMessage="No hay alumnos registrados" />

      {viewStudent && <StudentInfoModal student={viewStudent} onClose={() => setViewStudent(null)} />}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.type === 'create' ? 'Nuevo alumno' : 'Editar alumno'}>
        <StudentForm
          initial={modal?.student}
          loading={createMut.isPending || updateMut.isPending}
          onSubmit={(data) => {
            if (modal?.type === 'create') createMut.mutate(data);
            else if (modal?.student) updateMut.mutate({ id: modal.student.id, data });
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="¿Eliminar alumno?"
        description={`Esto eliminará a "${deleteTarget?.user.nombre}" de forma permanente.`}
        confirmLabel="Eliminar"
        loading={deleteMut.isPending}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

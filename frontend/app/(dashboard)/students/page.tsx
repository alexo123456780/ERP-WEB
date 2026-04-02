'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { studentsService } from '../../../services/students.service';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { FormField, inputClass } from '../../../components/ui/FormField';
import { PasswordStrengthInput, isPasswordValid } from '../../../components/ui/PasswordStrengthInput';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Spinner } from '../../../components/ui/Spinner';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { validationMessages as vm } from '../../../lib/validationMessages';
import { useRole } from '../../../hooks/useRole';
import { can } from '../../../lib/permissions';
import { FilterStatusToggle, FilterActivo } from '../../../components/ui/FilterStatusToggle';
import { Student } from '../../../types';

function StudentForm({ onSubmit, loading, initial }: {
  onSubmit: (data: any) => void;
  loading: boolean;
  initial?: Partial<Student>;
}) {
  const { values, handleChange, handleBlur, validate, fieldError, submitDisabled } = useFormValidation(
    {
      nombre: initial?.user?.nombre ?? '',
      email: initial?.user?.email ?? '',
      password: '',
      curp: initial?.curp ?? '',
      fecha_nacimiento: initial?.fecha_nacimiento ?? '',
      telefono: initial?.telefono ?? '',
    },
    {
      nombre: [{ type: 'required' }],
      email: [{ type: 'required' }, { type: 'email' }],
      curp: [{ type: 'required' }, { type: 'exactLength', value: 18 }],
      telefono: [{ type: 'phone' }],
    },
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!validate()) return;
        if (!initial && !isPasswordValid(values.password)) {
          toast.error(vm.passwordWeak);
          return;
        }
        onSubmit(values);
      }}
      className="space-y-4"
    >
      <FormField label="Nombre completo" error={fieldError('nombre')}>
        <input
          className={inputClass}
          value={values.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          onBlur={() => handleBlur('nombre')}
          placeholder="Juan Perez Garcia"
        />
      </FormField>
      <FormField label="Correo electrónico" error={fieldError('email')}>
        <input
          type="email"
          className={inputClass}
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="juan@escuela.com"
        />
      </FormField>
      {!initial && (
        <FormField label="Contraseña">
          <PasswordStrengthInput
            value={values.password}
            onChange={(v) => handleChange('password', v)}
            required
          />
        </FormField>
      )}
      <FormField label="CURP" error={fieldError('curp')}>
        <input
          className={inputClass}
          value={values.curp}
          onChange={(e) => handleChange('curp', e.target.value.toUpperCase())}
          onBlur={() => handleBlur('curp')}
          maxLength={18}
          placeholder="18 caracteres"
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Fecha de nacimiento">
          <input
            type="date"
            className={inputClass}
            value={values.fecha_nacimiento ?? ''}
            onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
          />
        </FormField>
        <FormField label="Teléfono" error={fieldError('telefono')}>
          <input
            className={inputClass}
            value={values.telefono ?? ''}
            onChange={(e) => handleChange('telefono', e.target.value)}
            onBlur={() => handleBlur('telefono')}
            placeholder="10 dígitos"
          />
        </FormField>
      </div>
      <Button type="submit" disabled={loading || submitDisabled} className="w-full gap-2">
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
  const role = useRole();
  const qc = useQueryClient();
  const [filterActivo, setFilterActivo] = useState<FilterActivo>('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ type: 'create' | 'edit'; student?: Student } | null>(null);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const activoParam = filterActivo === 'all' ? undefined : filterActivo === 'true';

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', filterActivo, search],
    queryFn: () => studentsService.getAll(activoParam, search),
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

  const restoreMut = useMutation({
    mutationFn: (id: number) => studentsService.restore(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Alumno restaurado correctamente'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al restaurar'),
  });

  const deleteMut = useMutation({
    mutationFn: studentsService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setDeleteTarget(null); toast.success('Alumno desactivado'); },
    onError: (e: any) => { setDeleteTarget(null); toast.error(e.response?.data?.message || 'Error al desactivar'); },
  });

  const isInactiveView = filterActivo === 'false';

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
          {!isInactiveView && role && can.editStudent(role) && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setModal({ type: 'edit', student: r })} title="Editar">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {isInactiveView && role && can.editStudent(role) && (
            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              onClick={() => restoreMut.mutate(r.id)}
              disabled={restoreMut.isPending}
              title="Restaurar alumno"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
          {!isInactiveView && role && can.deleteStudent(role) && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(r)} title="Desactivar">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
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
        {role && can.createStudent(role) && (
          <Button onClick={() => setModal({ type: 'create' })} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />Nuevo alumno
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre, correo o CURP..."
          className="sm:max-w-xs"
        />
        <FilterStatusToggle
          value={filterActivo}
          onChange={(v) => { setFilterActivo(v); setSearch(''); }}
          hasInactiveRecords={filterActivo === 'false' && students.length > 0}
          onRestore={() => setFilterActivo('all')}
        />
      </div>

      <DataTable columns={columns} data={students} loading={isLoading} emptyMessage="No hay alumnos registrados" />

      {viewStudent && <StudentInfoModal student={viewStudent} onClose={() => setViewStudent(null)} />}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.type === 'create' ? 'Nuevo alumno' : 'Editar alumno'}>
        <StudentForm
          initial={modal?.student}
          loading={createMut.isPending || updateMut.isPending}
          onSubmit={(data) => {
            if (modal?.type === 'create') {
              createMut.mutate(data);
            } else if (modal?.student) {
              const { password, ...updateData } = data;
              updateMut.mutate({ id: modal.student.id, data: updateData });
            }
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="¿Desactivar alumno?"
        description={`"${deleteTarget?.user.nombre}" quedará inactivo pero sus datos se conservarán.`}
        confirmLabel="Desactivar"
        loading={deleteMut.isPending}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

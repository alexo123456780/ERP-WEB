'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { teachersService } from '../../../services/teachers.service';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { FormField, inputClass } from '../../../components/ui/FormField';
import { PasswordStrengthInput, isPasswordValid } from '../../../components/ui/PasswordStrengthInput';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Spinner } from '../../../components/ui/Spinner';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { validationMessages as vm } from '../../../lib/validationMessages';
import { useRole } from '../../../hooks/useRole';
import { can } from '../../../lib/permissions';
import { FilterStatusToggle, FilterActivo } from '../../../components/ui/FilterStatusToggle';
import { Teacher } from '../../../types';

function TeacherForm({ onSubmit, loading, initial }: {
  onSubmit: (data: any) => void;
  loading: boolean;
  initial?: Partial<Teacher>;
}) {
  const { values, handleChange, handleBlur, validate, fieldError, submitDisabled } = useFormValidation(
    {
      nombre: initial?.user?.nombre ?? '',
      email: initial?.user?.email ?? '',
      password: '',
      especialidad: initial?.especialidad ?? '',
    },
    {
      nombre: [{ type: 'required' }],
      email: [{ type: 'required' }, { type: 'email' }],
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
          placeholder="Lic. María García López"
        />
      </FormField>
      <FormField label="Correo electrónico" error={fieldError('email')}>
        <input
          type="email"
          className={inputClass}
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="maestro@escuela.com"
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
      <FormField label="Especialidad">
        <input
          className={inputClass}
          value={values.especialidad}
          onChange={(e) => handleChange('especialidad', e.target.value)}
          placeholder="Matemáticas, Ciencias..."
        />
      </FormField>
      <Button type="submit" disabled={loading || submitDisabled} className="w-full gap-2">
        {loading && <Spinner size="xs" />}
        {loading ? 'Guardando...' : 'Guardar'}
      </Button>
    </form>
  );
}

function TeacherInfoModal({ teacher, onClose }: { teacher: Teacher; onClose: () => void }) {
  const row = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[55%] break-all">{value}</span>
    </div>
  );
  return (
    <Modal open onClose={onClose} title="Información del maestro">
      <div className="space-y-0.5">
        {row('Nombre', teacher.user.nombre)}
        {row('Correo', teacher.user.email)}
        {row('Especialidad', teacher.especialidad ?? <span className="text-muted-foreground">—</span>)}
        {row('Estado', teacher.user.activo
          ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">Activo</Badge>
          : <Badge className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-0">Inactivo</Badge>
        )}
        {row('Rol', teacher.user.role?.name ?? '—')}
        {row('Registrado', new Date(teacher.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }))}
      </div>
    </Modal>
  );
}

export default function TeachersPage() {
  const role = useRole();
  const qc = useQueryClient();
  const [filterActivo, setFilterActivo] = useState<FilterActivo>('all');
  const [modal, setModal] = useState<{ type: 'create' | 'edit'; teacher?: Teacher } | null>(null);
  const [viewTeacher, setViewTeacher] = useState<Teacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  const activoParam = filterActivo === 'all' ? undefined : filterActivo === 'true';

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers', filterActivo],
    queryFn: () => teachersService.getAll(activoParam),
  });

  const createMut = useMutation({
    mutationFn: teachersService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); setModal(null); toast.success('Maestro creado correctamente'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al crear maestro'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => teachersService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); setModal(null); toast.success('Maestro actualizado correctamente'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al actualizar'),
  });

  const deleteMut = useMutation({
    mutationFn: teachersService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); setDeleteTarget(null); toast.success('Maestro desactivado'); },
    onError: (e: any) => { setDeleteTarget(null); toast.error(e.response?.data?.message || 'Error al desactivar'); },
  });

  const columns = [
    { key: 'nombre', header: 'Nombre', render: (r: Teacher) => <span className="font-medium">{r.user.nombre}</span> },
    { key: 'email', header: 'Correo', render: (r: Teacher) => <span className="text-muted-foreground">{r.user.email}</span> },
    {
      key: 'especialidad', header: 'Especialidad',
      render: (r: Teacher) => r.especialidad ? <Badge variant="secondary">{r.especialidad}</Badge> : <span className="text-muted-foreground">—</span>
    },
    {
      key: 'activo', header: 'Estado',
      render: (r: Teacher) => r.user.activo
        ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">Activo</Badge>
        : <Badge className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-0">Inactivo</Badge>
    },
    {
      key: 'actions', header: '',
      render: (r: Teacher) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setViewTeacher(r)} title="Ver detalle">
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {role && can.editTeacher(role) && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setModal({ type: 'edit', teacher: r })} title="Editar">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {role && can.deleteTeacher(role) && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(r)} title="Eliminar">
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
          <h2 className="text-2xl font-bold tracking-tight">Maestros</h2>
          <p className="text-sm text-muted-foreground">{teachers.length} maestro{teachers.length !== 1 ? 's' : ''} registrado{teachers.length !== 1 ? 's' : ''}</p>
        </div>
        {role && can.createTeacher(role) && (
          <Button onClick={() => setModal({ type: 'create' })} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />Nuevo maestro
          </Button>
        )}
      </div>

      <FilterStatusToggle
        value={filterActivo}
        onChange={setFilterActivo}
        hasInactiveRecords={filterActivo === 'false' && teachers.length > 0}
        onRestore={() => setFilterActivo('all')}
      />

      <DataTable columns={columns} data={teachers} loading={isLoading} emptyMessage="No hay maestros registrados" />

      {viewTeacher && <TeacherInfoModal teacher={viewTeacher} onClose={() => setViewTeacher(null)} />}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.type === 'create' ? 'Nuevo maestro' : 'Editar maestro'}>
        <TeacherForm
          initial={modal?.teacher}
          loading={createMut.isPending || updateMut.isPending}
          onSubmit={(data) => {
            if (modal?.type === 'create') {
              createMut.mutate(data);
            } else if (modal?.teacher) {
              const { password, ...updateData } = data;
              updateMut.mutate({ id: modal.teacher.id, data: updateData });
            }
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="¿Desactivar maestro?"
        description={`"${deleteTarget?.user.nombre}" quedará inactivo pero sus datos se conservarán.`}
        confirmLabel="Desactivar"
        loading={deleteMut.isPending}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

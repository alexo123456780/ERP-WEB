'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, UserPlus } from 'lucide-react';
import { subjectsService } from '../../../services/subjects.service';
import { teachersService } from '../../../services/teachers.service';
import { studentsService } from '../../../services/students.service';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { FormField, inputClass } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
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
    { key: 'nombre', header: 'Materia', render: (r: Subject) => <span className="font-medium">{r.nombre}</span> },
    {
      key: 'creditos', header: 'Créditos',
      render: (r: Subject) => <Badge variant="secondary">{r.creditos} cr.</Badge>
    },
    {
      key: 'teacher', header: 'Maestro',
      render: (r: Subject) => r.teacher?.user?.nombre
        ? <span>{r.teacher.user.nombre}</span>
        : <span className="text-muted-foreground">Sin asignar</span>
    },
    {
      key: 'actions', header: '',
      render: (r: Subject) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            onClick={() => { setSelected(r); setMutError(''); setModal('enroll'); }}
          >
            <UserPlus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => { if (confirm('¿Eliminar materia?')) deleteMut.mutate(r.id); }}
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
          <h2 className="text-2xl font-bold tracking-tight">Materias</h2>
          <p className="text-sm text-muted-foreground">{subjects.length} materia{subjects.length !== 1 ? 's' : ''} registrada{subjects.length !== 1 ? 's' : ''}</p>
        </div>
        <Button
          onClick={() => { setForm({ nombre: '', descripcion: '', creditos: '0', teacher_id: '' }); setMutError(''); setModal('create'); }}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Nueva materia
        </Button>
      </div>

      <DataTable columns={columns} data={subjects} loading={isLoading} emptyMessage="No hay materias registradas" />

      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'create' ? 'Nueva materia' : 'Editar materia'}>
        <form onSubmit={(e) => {
          e.preventDefault(); setMutError('');
          const data = { nombre: form.nombre, descripcion: form.descripcion, creditos: Number(form.creditos), teacher_id: form.teacher_id ? Number(form.teacher_id) : undefined };
          if (modal === 'create') createMut.mutate(data);
          else if (selected) updateMut.mutate({ id: selected.id, data });
        }} className="space-y-4">
          <FormField label="Nombre de la materia">
            <input className={inputClass} value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} required placeholder="Matemáticas I" />
          </FormField>
          <FormField label="Descripción">
            <textarea className={inputClass + ' min-h-[72px] py-2'} value={form.descripcion} onChange={(e) => setField('descripcion', e.target.value)} rows={2} placeholder="Descripción opcional..." />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Créditos">
              <input type="number" className={inputClass} value={form.creditos} onChange={(e) => setField('creditos', e.target.value)} min={0} />
            </FormField>
            <FormField label="Maestro asignado">
              <select className={inputClass} value={form.teacher_id} onChange={(e) => setField('teacher_id', e.target.value)}>
                <option value="">Sin maestro</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.user.nombre}</option>)}
              </select>
            </FormField>
          </div>
          {mutError && <Alert variant="destructive"><AlertDescription>{mutError}</AlertDescription></Alert>}
          <Button type="submit" disabled={createMut.isPending || updateMut.isPending} className="w-full">
            {createMut.isPending || updateMut.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </form>
      </Modal>

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
          {mutError && <Alert variant="destructive"><AlertDescription>{mutError}</AlertDescription></Alert>}
          <Button type="submit" disabled={enrollMut.isPending} className="w-full">
            {enrollMut.isPending ? 'Inscribiendo...' : 'Inscribir alumno'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

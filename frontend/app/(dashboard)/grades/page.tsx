'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { gradesService } from '../../../services/grades.service';
import { studentsService } from '../../../services/students.service';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { FormField, inputClass } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Spinner } from '../../../components/ui/Spinner';
import { useRole } from '../../../hooks/useRole';
import { can } from '../../../lib/permissions';
import { ExportButton } from '../../../components/ui/ExportButton';
import { Grade, Student } from '../../../types';

export default function GradesPage() {
  const role = useRole();
  const qc = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ enrollment_id: '', parcial: '1', calificacion: '', fecha: '' });

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => studentsService.getAll() });

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
      setForm({ enrollment_id: '', parcial: '1', calificacion: '', fecha: '' });
      toast.success('Calificación registrada correctamente');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al registrar calificación'),
  });

  const columns = [
    { key: 'subject', header: 'Materia', render: (r: Grade) => <span className="font-medium">{r.enrollment?.subject?.nombre ?? '—'}</span>, exportValue: (r: Grade) => r.enrollment?.subject?.nombre ?? '' },
    { key: 'ciclo', header: 'Ciclo', render: (r: Grade) => <Badge variant="outline">{r.enrollment?.ciclo ?? '—'}</Badge>, exportValue: (r: Grade) => r.enrollment?.ciclo ?? '' },
    { key: 'parcial', header: 'Parcial', render: (r: Grade) => `Parcial ${r.parcial}`, exportValue: (r: Grade) => `Parcial ${r.parcial}` },
    {
      key: 'calificacion', header: 'Calificación',
      render: (r: Grade) => {
        const val = Number(r.calificacion);
        return (
          <Badge className={val >= 60
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0'
          }>
            {r.calificacion}
          </Badge>
        );
      },
      exportValue: (r: Grade) => r.calificacion,
    },
    { key: 'fecha', header: 'Fecha', render: (r: Grade) => r.fecha ?? <span className="text-muted-foreground">—</span>, exportValue: (r: Grade) => r.fecha ?? '' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Calificaciones</h2>
          <p className="text-sm text-muted-foreground">Consulta y registra calificaciones por alumno</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={grades} columns={columns} filename="calificaciones" disabled={isLoading || !selectedStudent} />
          {role && can.createGrade(role) && (
            <Button onClick={() => setModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-1.5" />Registrar calificación
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <FormField label="Seleccionar alumno">
          <select className={inputClass} value={selectedStudent ?? ''} onChange={(e) => setSelectedStudent(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Buscar por alumno...</option>
            {students.map((s: Student) => <option key={s.id} value={s.id}>{s.user.nombre} — {s.curp}</option>)}
          </select>
        </FormField>
      </div>

      {selectedStudent && avg && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Promedio general</p>
                <p className="text-2xl font-bold">{avg.average}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-muted-foreground">Total de calificaciones</p>
                <p className="text-lg font-semibold">{avg.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedStudent && (
        <DataTable columns={columns} data={grades} loading={isLoading} emptyMessage="Sin calificaciones registradas" />
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Registrar calificación">
        <form onSubmit={(e) => {
          e.preventDefault();
          createMut.mutate({
            enrollment_id: Number(form.enrollment_id),
            parcial: Number(form.parcial),
            calificacion: Number(form.calificacion),
            fecha: form.fecha || undefined,
          });
        }} className="space-y-4">
          <FormField label="ID de inscripción (enrollment_id)">
            <input type="number" className={inputClass} value={form.enrollment_id} onChange={(e) => setForm((f) => ({ ...f, enrollment_id: e.target.value }))} required min={1} placeholder="ID numérico" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Parcial">
              <input type="number" className={inputClass} value={form.parcial} onChange={(e) => setForm((f) => ({ ...f, parcial: e.target.value }))} required min={1} max={10} />
            </FormField>
            <FormField label="Calificación (0-100)">
              <input type="number" className={inputClass} value={form.calificacion} onChange={(e) => setForm((f) => ({ ...f, calificacion: e.target.value }))} required min={0} max={100} step={0.01} />
            </FormField>
          </div>
          <FormField label="Fecha">
            <input type="date" className={inputClass} value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} />
          </FormField>
          <Button type="submit" disabled={createMut.isPending} className="w-full gap-2">
            {createMut.isPending && <Spinner size="xs" />}
            {createMut.isPending ? 'Registrando...' : 'Registrar calificación'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

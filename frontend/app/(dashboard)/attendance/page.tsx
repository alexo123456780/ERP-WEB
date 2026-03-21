'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { attendanceService } from '../../../services/attendance.service';
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
import { Attendance, Student } from '../../../types';
import { cn } from '../../../lib/utils';

export default function AttendancePage() {
  const role = useRole();
  const qc = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ enrollment_id: '', fecha: new Date().toISOString().split('T')[0], presente: true, justificado: false });

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => studentsService.getAll() });

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance', selectedStudent],
    queryFn: () => selectedStudent ? attendanceService.getByStudent(selectedStudent) : Promise.resolve(null),
    enabled: !!selectedStudent,
  });

  const createMut = useMutation({
    mutationFn: (d: any) => attendanceService.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      setModal(false);
      setForm({ enrollment_id: '', fecha: new Date().toISOString().split('T')[0], presente: true, justificado: false });
      toast.success('Asistencia registrada correctamente');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al registrar asistencia'),
  });

  const resumen = attendanceData?.resumen;

  const columns = [
    { key: 'subject', header: 'Materia', render: (r: Attendance) => <span className="font-medium">{r.enrollment?.subject?.nombre ?? '—'}</span> },
    { key: 'fecha', header: 'Fecha' },
    {
      key: 'presente', header: 'Asistencia',
      render: (r: Attendance) => (
        <Badge className={r.presente
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0'
          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0'
        }>
          {r.presente ? 'Presente' : 'Ausente'}
        </Badge>
      )
    },
    {
      key: 'justificado', header: 'Justificado',
      render: (r: Attendance) => r.justificado ? <Badge variant="outline">Justificado</Badge> : <span className="text-muted-foreground text-sm">No</span>
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Asistencias</h2>
          <p className="text-sm text-muted-foreground">Control de asistencias por alumno</p>
        </div>
        {role && can.createAttendance(role) && (
          <Button onClick={() => setModal(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />Registrar asistencia
          </Button>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <FormField label="Seleccionar alumno">
          <select className={inputClass} value={selectedStudent ?? ''} onChange={(e) => setSelectedStudent(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Buscar por alumno...</option>
            {students.map((s: Student) => <option key={s.id} value={s.id}>{s.user.nombre} — {s.curp}</option>)}
          </select>
        </FormField>
      </div>

      {resumen && (
        <Card className={cn(resumen.alerta && 'border-destructive/50 bg-destructive/5')}>
          <CardContent className="p-4">
            {resumen.alerta && (
              <div className="flex items-center gap-2 text-destructive mb-3">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Porcentaje de asistencia bajo</span>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{resumen.total}</p>
                <p className="text-xs text-muted-foreground">Total clases</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{resumen.presentes}</p>
                <p className="text-xs text-muted-foreground">Presentes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{resumen.ausentes}</p>
                <p className="text-xs text-muted-foreground">Ausentes</p>
              </div>
              <div className="text-center">
                <p className={cn('text-2xl font-bold', resumen.alerta ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400')}>
                  {resumen.porcentaje_asistencia}%
                </p>
                <p className="text-xs text-muted-foreground">Asistencia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedStudent && (
        <DataTable columns={columns} data={attendanceData?.records ?? []} loading={isLoading} emptyMessage="Sin registros de asistencia" />
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Registrar asistencia">
        <form onSubmit={(e) => {
          e.preventDefault();
          createMut.mutate({ enrollment_id: Number(form.enrollment_id), fecha: form.fecha, presente: form.presente, justificado: form.justificado });
        }} className="space-y-4">
          <FormField label="ID de inscripción (enrollment_id)">
            <input type="number" className={inputClass} value={form.enrollment_id} onChange={(e) => setForm((f) => ({ ...f, enrollment_id: e.target.value }))} required min={1} placeholder="ID numérico" />
          </FormField>
          <FormField label="Fecha">
            <input type="date" className={inputClass} value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} required />
          </FormField>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
              <input type="checkbox" checked={form.presente} onChange={(e) => setForm((f) => ({ ...f, presente: e.target.checked }))} className="h-4 w-4 rounded border-input accent-primary" />
              Presente
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
              <input type="checkbox" checked={form.justificado} onChange={(e) => setForm((f) => ({ ...f, justificado: e.target.checked }))} className="h-4 w-4 rounded border-input accent-primary" />
              Justificado
            </label>
          </div>
          <Button type="submit" disabled={createMut.isPending} className="w-full gap-2">
            {createMut.isPending && <Spinner size="xs" />}
            {createMut.isPending ? 'Registrando...' : 'Registrar asistencia'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

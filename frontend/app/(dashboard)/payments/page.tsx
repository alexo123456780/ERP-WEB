'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle } from 'lucide-react';
import { paymentsService } from '../../../services/payments.service';
import { studentsService } from '../../../services/students.service';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { FormField, inputClass } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Payment, Student } from '../../../types';

export default function PaymentsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'pending' | 'student'>('pending');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [modal, setModal] = useState(false);
  const [mutError, setMutError] = useState('');
  const [form, setForm] = useState({ student_id: '', concepto: '', monto: '', fecha_pago: '', estado: 'pendiente', ciclo: '' });

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: studentsService.getAll });

  const { data: pending = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['payments-pending'],
    queryFn: paymentsService.getPending,
    enabled: tab === 'pending',
  });

  const { data: studentPayments = [], isLoading: studentLoading } = useQuery({
    queryKey: ['payments-student', selectedStudent],
    queryFn: () => selectedStudent ? paymentsService.getByStudent(selectedStudent) : Promise.resolve([]),
    enabled: tab === 'student' && !!selectedStudent,
  });

  const createMut = useMutation({
    mutationFn: (d: any) => paymentsService.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); setModal(false); },
    onError: (e: any) => setMutError(e.response?.data?.message || 'Error'),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, estado }: any) => paymentsService.updateStatus(id, estado, estado === 'pagado' ? new Date().toISOString().split('T')[0] : undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments-pending'] });
      qc.invalidateQueries({ queryKey: ['payments-student'] });
    },
  });

  const columns = [
    { key: 'student', header: 'Alumno', render: (r: Payment) => <span className="font-medium">{r.student?.user?.nombre ?? '—'}</span> },
    { key: 'concepto', header: 'Concepto' },
    { key: 'monto', header: 'Monto', render: (r: Payment) => <span className="font-semibold">${Number(r.monto).toFixed(2)}</span> },
    { key: 'ciclo', header: 'Ciclo', render: (r: Payment) => <Badge variant="outline">{r.ciclo}</Badge> },
    { key: 'fecha_pago', header: 'Fecha pago', render: (r: Payment) => r.fecha_pago ?? <span className="text-muted-foreground">—</span> },
    {
      key: 'estado', header: 'Estado',
      render: (r: Payment) => (
        <Badge className={r.estado === 'pagado'
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0'
        }>
          {r.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
        </Badge>
      )
    },
    {
      key: 'actions', header: '',
      render: (r: Payment) => r.estado === 'pendiente' ? (
        <Button
          variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          onClick={() => statusMut.mutate({ id: r.id, estado: 'pagado' })}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Marcar pagado
        </Button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pagos</h2>
          <p className="text-sm text-muted-foreground">Gestión de pagos y colegiaturas</p>
        </div>
        <Button onClick={() => { setMutError(''); setModal(true); }} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Registrar pago
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'pending' | 'student')}>
        <TabsList>
          <TabsTrigger value="pending">Pagos pendientes</TabsTrigger>
          <TabsTrigger value="student">Por alumno</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === 'student' && (
        <div className="bg-card rounded-lg border border-border p-4">
          <FormField label="Seleccionar alumno">
            <select className={inputClass} value={selectedStudent ?? ''} onChange={(e) => setSelectedStudent(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Buscar por alumno...</option>
              {students.map((s: Student) => <option key={s.id} value={s.id}>{s.user.nombre}</option>)}
            </select>
          </FormField>
        </div>
      )}

      <DataTable
        columns={columns}
        data={tab === 'pending' ? pending : studentPayments}
        loading={tab === 'pending' ? pendingLoading : studentLoading}
        emptyMessage={tab === 'pending' ? 'No hay pagos pendientes' : 'Sin pagos registrados para este alumno'}
      />

      <Modal open={modal} onClose={() => setModal(false)} title="Registrar pago">
        <form onSubmit={(e) => {
          e.preventDefault(); setMutError('');
          createMut.mutate({
            student_id: Number(form.student_id),
            concepto: form.concepto,
            monto: Number(form.monto),
            fecha_pago: form.fecha_pago || undefined,
            estado: form.estado,
            ciclo: form.ciclo,
          });
        }} className="space-y-4">
          <FormField label="Alumno">
            <select className={inputClass} value={form.student_id} onChange={(e) => setForm((f) => ({ ...f, student_id: e.target.value }))} required>
              <option value="">Seleccionar alumno</option>
              {students.map((s: Student) => <option key={s.id} value={s.id}>{s.user.nombre}</option>)}
            </select>
          </FormField>
          <FormField label="Concepto">
            <input className={inputClass} value={form.concepto} onChange={(e) => setForm((f) => ({ ...f, concepto: e.target.value }))} required placeholder="Colegiatura, inscripción..." />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Monto ($)">
              <input type="number" className={inputClass} value={form.monto} onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))} required min={0} step={0.01} placeholder="0.00" />
            </FormField>
            <FormField label="Ciclo">
              <input className={inputClass} value={form.ciclo} onChange={(e) => setForm((f) => ({ ...f, ciclo: e.target.value }))} required placeholder="2024-A" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Estado">
              <select className={inputClass} value={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}>
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
              </select>
            </FormField>
            <FormField label="Fecha de pago">
              <input type="date" className={inputClass} value={form.fecha_pago} onChange={(e) => setForm((f) => ({ ...f, fecha_pago: e.target.value }))} />
            </FormField>
          </div>
          {mutError && <Alert variant="destructive"><AlertDescription>{mutError}</AlertDescription></Alert>}
          <Button type="submit" disabled={createMut.isPending} className="w-full">
            {createMut.isPending ? 'Guardando...' : 'Registrar pago'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

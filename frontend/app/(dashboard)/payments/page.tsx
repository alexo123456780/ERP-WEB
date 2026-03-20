'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '../../../services/payments.service';
import { studentsService } from '../../../services/students.service';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { FormField, inputClass } from '../../../components/ui/FormField';
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments-pending'] }); qc.invalidateQueries({ queryKey: ['payments-student'] }); },
  });

  const columns = [
    { key: 'student', header: 'Alumno', render: (r: Payment) => r.student?.user?.nombre ?? '—' },
    { key: 'concepto', header: 'Concepto' },
    { key: 'monto', header: 'Monto', render: (r: Payment) => `$${Number(r.monto).toFixed(2)}` },
    { key: 'ciclo', header: 'Ciclo' },
    { key: 'fecha_pago', header: 'Fecha pago', render: (r: Payment) => r.fecha_pago ?? '—' },
    {
      key: 'estado', header: 'Estado', render: (r: Payment) => (
        <span className={r.estado === 'pagado' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
          {r.estado === 'pagado' ? '✓ Pagado' : '⏳ Pendiente'}
        </span>
      )
    },
    {
      key: 'actions', header: 'Acción',
      render: (r: Payment) => r.estado === 'pendiente' ? (
        <button onClick={() => statusMut.mutate({ id: r.id, estado: 'pagado' })}
          className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100">Marcar pagado</button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Pagos</h2>
        <button onClick={() => { setMutError(''); setModal(true); }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">+ Registrar pago</button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('pending')} className={`text-sm px-4 py-2 rounded-lg transition-colors ${tab === 'pending' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
          Pagos pendientes
        </button>
        <button onClick={() => setTab('student')} className={`text-sm px-4 py-2 rounded-lg transition-colors ${tab === 'student' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
          Por alumno
        </button>
      </div>

      {tab === 'student' && (
        <div className="bg-white rounded-xl border p-4">
          <select className={inputClass} value={selectedStudent ?? ''} onChange={(e) => setSelectedStudent(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Seleccionar alumno</option>
            {students.map((s: Student) => <option key={s.id} value={s.id}>{s.user.nombre}</option>)}
          </select>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <DataTable
          columns={columns}
          data={tab === 'pending' ? pending : studentPayments}
          loading={tab === 'pending' ? pendingLoading : studentLoading}
          emptyMessage="Sin pagos"
        />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Registrar pago">
        <form onSubmit={(e) => {
          e.preventDefault(); setMutError('');
          createMut.mutate({ student_id: Number(form.student_id), concepto: form.concepto, monto: Number(form.monto), fecha_pago: form.fecha_pago || undefined, estado: form.estado, ciclo: form.ciclo });
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
          <FormField label="Monto">
            <input type="number" className={inputClass} value={form.monto} onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))} required min={0} step={0.01} />
          </FormField>
          <FormField label="Ciclo">
            <input className={inputClass} value={form.ciclo} onChange={(e) => setForm((f) => ({ ...f, ciclo: e.target.value }))} required placeholder="2024-A" />
          </FormField>
          <FormField label="Estado">
            <select className={inputClass} value={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
            </select>
          </FormField>
          <FormField label="Fecha de pago">
            <input type="date" className={inputClass} value={form.fecha_pago} onChange={(e) => setForm((f) => ({ ...f, fecha_pago: e.target.value }))} />
          </FormField>
          {mutError && <p className="text-red-500 text-sm">{mutError}</p>}
          <button type="submit" disabled={createMut.isPending} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">Guardar</button>
        </form>
      </Modal>
    </div>
  );
}

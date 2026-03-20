'use client';
import { useQuery } from '@tanstack/react-query';
import { studentsService } from '../../../services/students.service';
import { teachersService } from '../../../services/teachers.service';
import { subjectsService } from '../../../services/subjects.service';
import { paymentsService } from '../../../services/payments.service';
import { StatCard } from '../../../components/ui/StatCard';

export default function DashboardPage() {
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: studentsService.getAll });
  const { data: teachers } = useQuery({ queryKey: ['teachers'], queryFn: teachersService.getAll });
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: subjectsService.getAll });
  const { data: pending } = useQuery({ queryKey: ['payments-pending'], queryFn: paymentsService.getPending });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Resumen del sistema escolar</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Alumnos" value={students?.length ?? '—'} icon="🎓" color="blue" />
        <StatCard title="Maestros" value={teachers?.length ?? '—'} icon="👨‍🏫" color="green" />
        <StatCard title="Materias" value={subjects?.length ?? '—'} icon="📚" color="purple" />
        <StatCard title="Pagos pendientes" value={pending?.length ?? '—'} icon="💰" color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Últimos alumnos registrados</h3>
          {students?.slice(0, 5).map((s) => (
            <div key={s.id} className="flex justify-between py-2 border-b border-gray-50 text-sm">
              <span className="text-gray-700">{s.user.nombre}</span>
              <span className="text-gray-400">{s.curp}</span>
            </div>
          ))}
          {!students?.length && <p className="text-gray-400 text-sm">Sin alumnos</p>}
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Pagos pendientes</h3>
          {pending?.slice(0, 5).map((p) => (
            <div key={p.id} className="flex justify-between py-2 border-b border-gray-50 text-sm">
              <span className="text-gray-700">{p.student?.user?.nombre}</span>
              <span className="text-yellow-600 font-medium">${Number(p.monto).toFixed(2)}</span>
            </div>
          ))}
          {!pending?.length && <p className="text-gray-400 text-sm">Sin pagos pendientes</p>}
        </div>
      </div>
    </div>
  );
}

'use client';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, BookUser, BookOpen, CreditCard } from 'lucide-react';
import { studentsService } from '../../../services/students.service';
import { teachersService } from '../../../services/teachers.service';
import { subjectsService } from '../../../services/subjects.service';
import { paymentsService } from '../../../services/payments.service';
import { StatCard } from '../../../components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { Badge } from '../../../components/ui/badge';

export default function DashboardPage() {
  const { data: students, isLoading: loadingStudents } = useQuery({ queryKey: ['students'], queryFn: studentsService.getAll });
  const { data: teachers, isLoading: loadingTeachers } = useQuery({ queryKey: ['teachers'], queryFn: teachersService.getAll });
  const { data: subjects, isLoading: loadingSubjects } = useQuery({ queryKey: ['subjects'], queryFn: subjectsService.getAll });
  const { data: pending, isLoading: loadingPending } = useQuery({ queryKey: ['payments-pending'], queryFn: paymentsService.getPending });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Resumen del sistema escolar</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingStudents ? (
          <Card><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
        ) : (
          <StatCard title="Alumnos" value={students?.length ?? 0} icon={GraduationCap} variant="blue" />
        )}
        {loadingTeachers ? (
          <Card><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
        ) : (
          <StatCard title="Maestros" value={teachers?.length ?? 0} icon={BookUser} variant="green" />
        )}
        {loadingSubjects ? (
          <Card><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
        ) : (
          <StatCard title="Materias" value={subjects?.length ?? 0} icon={BookOpen} variant="purple" />
        )}
        {loadingPending ? (
          <Card><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
        ) : (
          <StatCard title="Pagos pendientes" value={pending?.length ?? 0} icon={CreditCard} variant="yellow" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Ultimos alumnos registrados</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingStudents ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : students?.length ? (
              <div className="divide-y divide-border">
                {students.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex justify-between items-center py-2.5 text-sm">
                    <span className="font-medium truncate">{s.user.nombre}</span>
                    <span className="text-muted-foreground text-xs ml-2 shrink-0">{s.curp}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">Sin alumnos registrados</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Pagos pendientes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingPending ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : pending?.length ? (
              <div className="divide-y divide-border">
                {pending.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex justify-between items-center py-2.5 text-sm">
                    <span className="truncate">{p.student?.user?.nombre}</span>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className="font-semibold">${Number(p.monto).toFixed(2)}</span>
                      <Badge variant="secondary" className="text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border-0 text-xs">
                        Pendiente
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">Sin pagos pendientes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

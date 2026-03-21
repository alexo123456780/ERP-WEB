export type Role = 'admin' | 'maestro' | 'alumno' | 'padre';

/** Permisos por acción, derivados directamente de los @Roles() del backend. */
export const can = {
  // Alumnos
  viewStudentsList: (r: Role) => r === 'admin' || r === 'maestro',
  createStudent:    (r: Role) => r === 'admin',
  editStudent:      (r: Role) => r === 'admin' || r === 'maestro',
  deleteStudent:    (r: Role) => r === 'admin',

  // Maestros
  viewTeachersList: (r: Role) => r === 'admin' || r === 'maestro',
  createTeacher:    (r: Role) => r === 'admin',
  editTeacher:      (r: Role) => r === 'admin',
  deleteTeacher:    (r: Role) => r === 'admin',

  // Materias
  viewSubjectsList: (r: Role) => r === 'admin' || r === 'maestro' || r === 'alumno',
  createSubject:    (r: Role) => r === 'admin',
  editSubject:      (r: Role) => r === 'admin',
  deleteSubject:    (r: Role) => r === 'admin',
  enrollStudent:    (r: Role) => r === 'admin' || r === 'maestro',

  // Calificaciones
  viewGrades:   (r: Role) => true,
  createGrade:  (r: Role) => r === 'admin' || r === 'maestro',

  // Asistencias
  viewAttendance:   (r: Role) => true,
  createAttendance: (r: Role) => r === 'admin' || r === 'maestro',

  // Dashboard
  viewDashboardCharts: (r: Role) => r === 'admin',

  // Pagos
  viewPayments:        (r: Role) => r === 'admin' || r === 'alumno' || r === 'padre',
  createPayment:       (r: Role) => r === 'admin',
  updatePaymentStatus: (r: Role) => r === 'admin',
  viewPendingPayments: (r: Role) => r === 'admin',
};

/** Determina si un rol puede acceder a una ruta del nav. */
export function canAccessNav(href: string, role: Role): boolean {
  switch (href) {
    case '/dashboard':   return true;
    case '/students':    return can.viewStudentsList(role);
    case '/teachers':    return can.viewTeachersList(role);
    case '/subjects':    return can.viewSubjectsList(role);
    case '/grades':      return can.viewGrades(role);
    case '/attendance':  return can.viewAttendance(role);
    case '/payments':    return can.viewPayments(role);
    default:             return false;
  }
}

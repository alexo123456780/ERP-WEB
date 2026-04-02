export interface Role {
  id: number;
  name: 'admin' | 'maestro' | 'alumno' | 'padre';
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  role: Role;
  activo: boolean;
  created_at: string;
}

export interface Student {
  id: number;
  user: User;
  curp: string;
  fecha_nacimiento: string | null;
  telefono: string | null;
  created_at: string;
}

export interface Teacher {
  id: number;
  user: User;
  especialidad: string | null;
  created_at: string;
}

export interface Subject {
  id: number;
  nombre: string;
  descripcion: string | null;
  creditos: number;
  activo: boolean;
  teacher: Teacher | null;
  created_at: string;
}

export interface Enrollment {
  id: number;
  student: Student;
  subject: Subject;
  ciclo: string;
  created_at: string;
}

export interface Grade {
  id: number;
  enrollment: Enrollment;
  parcial: number;
  calificacion: number;
  fecha: string;
}

export interface Attendance {
  id: number;
  enrollment: Enrollment;
  fecha: string;
  presente: boolean;
  justificado: boolean;
}

export interface Payment {
  id: number;
  student: Student;
  concepto: string;
  monto: number;
  fecha_pago: string | null;
  estado: 'pagado' | 'pendiente';
  ciclo: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface AuthData {
  access_token: string;
  user: {
    id: number;
    nombre: string;
    email: string;
    role: string;
    foto_url: string | null;
  };
}

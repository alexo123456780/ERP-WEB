# 📘 PRD - Sistema ERP Escolar

## 🧾 1. Overview del Producto

### 📌 Nombre del sistema

**EduCore ERP**

### 🎯 Objetivo

Desarrollar un sistema ERP escolar modular que permita gestionar de forma eficiente alumnos, maestros, materias, calificaciones, asistencia y pagos, con acceso diferenciado por roles (admin, maestro, alumno y padres).

### 👥 Usuarios objetivo

* Administradores escolares
* Maestros
* Alumnos
* Padres de familia

---

## 🧠 2. Problema a Resolver

Las instituciones educativas suelen manejar múltiples procesos manuales o sistemas fragmentados:

* Control de alumnos en Excel
* Calificaciones en sistemas aislados
* Pagos sin seguimiento digital
* Comunicación deficiente con padres

👉 Resultado: desorganización, errores y pérdida de información.

---

## 🚀 3. Propuesta de Solución

Sistema web centralizado que:

* Integra todos los módulos escolares
* Automatiza procesos clave
* Permite acceso por roles
* Ofrece dashboards claros

---

## 🧩 4. Módulos del Sistema

### 👨‍🎓 4.1 Alumnos

* CRUD de alumnos
* Inscripción a materias
* Historial académico

### 👨‍🏫 4.2 Maestros

* CRUD de maestros
* Asignación a materias
* Gestión de grupos

### 📚 4.3 Materias

* CRUD de materias
* Relación con maestros y alumnos

### 📝 4.4 Calificaciones

* Registro de calificaciones
* Promedios automáticos
* Historial por alumno

### 📅 4.5 Asistencia

* Registro diario
* Reportes por alumno
* Alertas de inasistencia

### 💳 4.6 Pagos

* Registro de pagos
* Estado (pagado / pendiente)
* Historial de colegiaturas

---

## ⭐ 5. Funcionalidades Clave (Plus)

### 👪 Dashboard para padres

* Ver calificaciones
* Ver asistencia
* Ver pagos pendientes

### 🔐 Roles y permisos

* Admin: control total
* Maestro: gestiona alumnos y materias
* Alumno: consulta
* Padre: monitoreo

---

## 🏗️ 6. Arquitectura del Sistema

### 🔹 Backend: NestJS (Arquitectura limpia)

#### 🧠 Patrón utilizado:

* Clean Architecture
* SOLID principles
* DRY
* Modular architecture

### 🔹 Capas:

```
src/
│
├── modules/
│   ├── students/
│   ├── teachers/
│   ├── subjects/
│   ├── grades/
│   ├── attendance/
│   ├── payments/
│   └── auth/
│
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   └── interceptors/
│
├── config/
├── database/
└── main.ts
```

---

## 🧱 7. Estructura por módulo (Ejemplo: Students)

```
students/
│
├── domain/
│   ├── entities/
│   │   └── student.entity.ts
│   ├── interfaces/
│   └── repositories/
│
├── application/
│   ├── use-cases/
│   │   ├── create-student.usecase.ts
│   │   ├── update-student.usecase.ts
│   │   └── get-students.usecase.ts
│
├── infrastructure/
│   ├── database/
│   │   └── student.repository.impl.ts
│
├── presentation/
│   ├── controllers/
│   │   └── student.controller.ts
│   ├── dtos/
│   └── validators/
│
└── students.module.ts
```

---

## 🧼 8. Principios de Código

### ✅ DRY (Don't Repeat Yourself)

* Reutilizar servicios comunes
* Helpers globales

### ✅ Código limpio

* Métodos pequeños y claros
* Nombres descriptivos
* Separación de responsabilidades

### ❌ Código legacy (evitar)

* Lógica en controllers
* Funciones gigantes
* Duplicación de lógica

---

## 🔐 9. Validaciones

### 🔹 Backend (NestJS)

Uso de:

* class-validator
* DTOs

Ejemplo:

```ts
export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;
}
```

### 🔹 Reglas de negocio:

* No duplicar alumnos por CURP/email
* No registrar calificaciones sin materia
* Pagos no negativos

---

## 🔑 10. Autenticación y Seguridad

* JWT Authentication
* Guards por roles
* Hash de contraseñas (bcrypt)
* Rate limiting

---

## 🗄️ 11. Base de Datos (MySQL)

### Tablas principales:

* users
* roles
* students
* teachers
* subjects
* enrollments
* grades
* attendance
* payments

### Relaciones:

* 1:N (maestro → materias)
* N:M (alumnos ↔ materias)
* 1:N (alumno → pagos)

---

## 🎨 12. Frontend (Next.js)

### 📁 Estructura:

```
/app
  /dashboard
  /students
  /teachers
  /subjects
  /payments

/components
/services
/hooks
/types
```

### 🔹 Características:

* SSR para dashboards
* Formularios con validación
* UI modular (cards, tables)

---

## 🐳 13. Dockerización

### Servicios:

* backend (NestJS)
* frontend (Next.js)
* database (MySQL)

Ejemplo:

```yaml
services:
  backend:
    build: ./backend

  frontend:
    build: ./frontend

  db:
    image: mysql:8
```

---

## 📊 14. KPIs del Sistema

* Tiempo de registro de alumnos ↓
* Errores administrativos ↓
* Acceso de padres ↑
* Automatización de procesos ↑

---

## 🚀 15. Roadmap de Desarrollo

### Fase 1:

* Auth + roles
* CRUD alumnos

### Fase 2:

* Materias + maestros

### Fase 3:

* Calificaciones + asistencia

### Fase 4:

* Pagos + dashboard padres

### Fase 5:

* Optimización + UX

---

## 🧠 16. Escalabilidad (Futuro)

* Multi-tenant (varias escuelas)
* Microservicios (NestJS)
* Notificaciones en tiempo real (WebSockets)
* App móvil (React Native / Flutter)

---

## 🏁 17. Conclusión

Este ERP escolar está diseñado con:

* Arquitectura limpia
* Código mantenible
* Escalabilidad real

👉 Ideal para portafolio o producto comercial.

---

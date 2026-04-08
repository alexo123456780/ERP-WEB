# Auditoría de Cambios — ERP-WEB

## Fecha: 2026-04-07

---

## Problema detectado

Los formularios de **Asistencia** y **Calificaciones** solicitaban al usuario ingresar manualmente un `enrollment_id` numérico (ID interno de la tabla `enrollments`). Esto era inoperable en producción porque:

- Los usuarios no conocen los IDs internos de la base de datos.
- No había forma de consultarlos desde la interfaz.
- Cualquier número incorrecto causaba error silencioso o excepción en el servidor.

---

## Archivos modificados

### 1. `backend/src/modules/students/presentation/controllers/student.controller.ts`

**Tipo de cambio:** Nuevo endpoint REST

**Descripción:** Se agregó el endpoint `GET /students/:id/enrollments` que retorna todas las inscripciones (`enrollments`) de un alumno específico, incluyendo el `id` de la inscripción, el nombre de la materia y el ciclo escolar. El resultado viene ordenado por ciclo descendente.

**Fragmento agregado:**
```typescript
@Get(':id/enrollments')
@Roles('admin', 'maestro', 'alumno', 'padre')
async getEnrollments(@Param('id', ParseIntPipe) id: number) {
  const student = await this.studentRepo.findOne({ where: { id } });
  if (!student) throw new NotFoundException('Alumno no encontrado');

  return this.enrollmentRepo.find({
    where: { student: { id } },
    relations: ['subject'],
    order: { ciclo: 'DESC' },
  });
}
```

---

### 2. `frontend/services/students.service.ts`

**Tipo de cambio:** Nuevo método en el servicio

**Descripción:** Se agregó el método `getEnrollments(id)` que consume el nuevo endpoint del backend y retorna la lista de inscripciones tipadas.

**Fragmento agregado:**
```typescript
async getEnrollments(id: number): Promise<{ id: number; ciclo: string; subject: { id: number; nombre: string } }[]> {
  const res = await api.get<ApiResponse<any[]>>(`/students/${id}/enrollments`);
  return res.data.data;
},
```

---

### 3. `frontend/app/(dashboard)/attendance/page.tsx`

**Tipo de cambio:** Modificación de formulario modal

**Descripción:** Se reemplazó el campo `<input type="number">` de `enrollment_id` por dos selectores en cascada dentro del modal "Registrar asistencia":

1. **Selector de Alumno** — lista todos los alumnos con nombre y CURP. Se pre-llena con el alumno actualmente seleccionado en la tabla principal.
2. **Selector de Materia** — carga las inscripciones del alumno elegido y muestra `"Nombre Materia — Ciclo"`. Permanece deshabilitado hasta que se elija un alumno.

**Estado agregado:**
- `modalStudent: number | null` — controla el alumno seleccionado dentro del modal.

**Query agregada:**
- `useQuery(['enrollments', modalStudent])` — obtiene inscripciones del alumno seleccionado en el modal.

**Comportamiento:**
- Al abrir el modal, `modalStudent` se inicializa con el alumno ya seleccionado en la tabla (si existe).
- Al cambiar de alumno en el modal, el selector de materia se reinicia.
- Al cerrar el modal (éxito o cancelación), `modalStudent` se limpia.

---

### 4. `frontend/app/(dashboard)/grades/page.tsx`

**Tipo de cambio:** Modificación de formulario modal

**Descripción:** Se aplicó el mismo cambio que en Asistencia. Se reemplazó el campo `<input type="number">` de `enrollment_id` por dos selectores en cascada dentro del modal "Registrar calificación":

1. **Selector de Alumno** — lista todos los alumnos con nombre y CURP. Se pre-llena con el alumno actualmente seleccionado en la tabla principal.
2. **Selector de Materia** — carga las inscripciones del alumno elegido y muestra `"Nombre Materia — Ciclo"`. Permanece deshabilitado hasta que se elija un alumno.

**Estado agregado:**
- `modalStudent: number | null` — controla el alumno seleccionado dentro del modal.

**Query agregada:**
- `useQuery(['enrollments', modalStudent])` — obtiene inscripciones del alumno seleccionado en el modal.

**Comportamiento:** idéntico al de Asistencia.

---

## Resumen de impacto

| Archivo | Tipo | Cambio |
|---|---|---|
| `backend/.../student.controller.ts` | Backend | Nuevo endpoint `GET /students/:id/enrollments` |
| `frontend/services/students.service.ts` | Servicio | Nuevo método `getEnrollments(id)` |
| `frontend/.../attendance/page.tsx` | Frontend | Input numérico → 2 selects en cascada |
| `frontend/.../grades/page.tsx` | Frontend | Input numérico → 2 selects en cascada |

**Módulos NO modificados:** Pagos (`payments/page.tsx`) — ya usaba un selector de alumno correctamente.

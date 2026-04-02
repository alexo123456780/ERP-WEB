export const validationMessages = {
  required: 'Este campo es obligatorio.',
  email: 'Ingresa un correo electrónico válido.',
  onlyNumbers: 'Solo se permiten números.',
  maxLength: (max: number) => `Máximo ${max} caracteres.`,
  minLength: (min: number) => `Mínimo ${min} caracteres.`,
  exactLength: (n: number) => `Debe tener exactamente ${n} caracteres.`,
  phone: 'Ingresa un número de teléfono válido (10 dígitos).',
  curp: 'Ingresa un CURP válido (18 caracteres alfanuméricos).',
  passwordWeak: 'La contraseña no cumple los requisitos de seguridad.',
  passwordMismatch: 'Las contraseñas no coinciden.',
  url: 'Ingresa una URL válida.',
  date: 'Ingresa una fecha válida.',
} as const;

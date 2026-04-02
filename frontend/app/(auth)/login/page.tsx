'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { FieldError } from '../../../components/ui/FieldError';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { Spinner } from '../../../components/ui/Spinner';

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { values, handleChange, handleBlur, validate, fieldError, submitDisabled } = useFormValidation(
    { email: '', password: '' },
    {
      email: [{ type: 'required' }, { type: 'email' }],
      password: [{ type: 'required' }],
    },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    setLoading(true);
    try {
      await login(values.email, values.password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel: branding + Tux ── */}
      <div
        aria-hidden="true"
        className="hidden lg:flex lg:w-[55%] relative flex-col items-center justify-center overflow-hidden select-none"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f2744 70%, #0c1a2e 100%)',
        }}
      >
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          {/* Tux logo */}
          <Image
            src="/Tux.svg.png"
            alt="Tux, mascota oficial de Linux"
            width={180}
            height={214}
            priority
            className="drop-shadow-2xl"
          />

          {/* Branding */}
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              EduCore ERP
            </h1>
            <p className="text-lg text-indigo-200 font-medium">
              Sistema de gestión escolar
            </p>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Administra alumnos, maestros, calificaciones y pagos desde una sola plataforma.
            </p>
          </div>
        </div>

      </div>

      {/* ── Right panel: login form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">

        {/* Mobile branding (only visible < lg) */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
          <Image src="/Tux.svg.png" alt="" aria-hidden="true" width={64} height={76} className="opacity-80" />
          <h1 className="text-2xl font-bold tracking-tight">EduCore ERP</h1>
          <p className="text-sm text-muted-foreground">Sistema de gestión escolar</p>
        </div>

        {/* Card-like form container */}
        <div className="w-full max-w-sm">
          <div className="mb-6 hidden lg:block">
            <h2 className="text-2xl font-bold tracking-tight">Bienvenido</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                aria-invalid={!!fieldError('email')}
                placeholder="admin@escuela.com"
                autoComplete="email"
                className="h-10"
              />
              <FieldError message={fieldError('email')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={values.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                aria-invalid={!!fieldError('password')}
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-10"
              />
              <FieldError message={fieldError('password')} />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading || submitDisabled}
              className="w-full h-10 gap-2"
            >
              {loading && <Spinner size="xs" />}
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            EduCore ERP &mdash; Sistema de gestión escolar
          </p>
        </div>
      </div>
    </div>
  );
}

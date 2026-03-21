'use client';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { authService } from '../../../services/auth.service';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Spinner } from '../../../components/ui/Spinner';
import { FieldError } from '../../../components/ui/FieldError';
import { Camera, Save, KeyRound, User } from 'lucide-react';
import { PasswordStrengthInput, isPasswordValid } from '../../../components/ui/PasswordStrengthInput';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { validationMessages as vm } from '../../../lib/validationMessages';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api').replace('/api', '');

function getAvatarUrl(fotoUrl: string | null | undefined) {
  if (!fotoUrl) return undefined;
  if (fotoUrl.startsWith('http')) return fotoUrl;
  return `${API_BASE}${fotoUrl}`;
}

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  // Initialize synchronously from localStorage to avoid an empty-form flash
  const [user, setUser] = useState<any>(() =>
    typeof window !== 'undefined' ? authService.getUser() : null,
  );
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(() =>
    typeof window !== 'undefined' ? getAvatarUrl(authService.getUser()?.foto_url) : undefined,
  );
  const [uploadLoading, setUploadLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // --- Info form ---
  const {
    values: infoValues,
    handleChange: infoChange,
    handleBlur: infoBlur,
    validate: infoValidate,
    fieldError: infoFieldError,
    submitDisabled: infoSubmitDisabled,
  } = useFormValidation(
    { nombre: user?.nombre || '', email: user?.email || '' },
    {
      nombre: [{ type: 'required' }],
      email: [{ type: 'required' }, { type: 'email' }],
    },
  );

  // --- Password form ---
  // pwRef keeps the current password value accessible inside the confirm rule closure
  const pwRef = useRef('');
  const {
    values: passValues,
    handleChange: passChange,
    handleBlur: passBlur,
    validate: passValidate,
    fieldError: passFieldError,
    submitDisabled: passSubmitDisabled,
    reset: passReset,
  } = useFormValidation(
    { password: '', confirm: '' },
    {
      password: [
        { type: 'required' },
        { type: 'custom', validate: (v) => (isPasswordValid(v) ? undefined : vm.passwordWeak) },
      ],
      confirm: [
        { type: 'required' },
        { type: 'custom', validate: (v) => (v !== pwRef.current ? vm.passwordMismatch : undefined) },
      ],
    },
  );
  // Keep pwRef in sync with the latest password value
  pwRef.current = passValues.password;

  const initials = user?.nombre
    ? user.nombre.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
    : 'U';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploadLoading(true);
    const tid = toast.loading('Subiendo foto de perfil...');
    try {
      const { foto_url } = await authService.uploadAvatar(file);
      const updatedUser = { ...user, foto_url };
      setUser(updatedUser);
      authService.saveUser(updatedUser);
      setAvatarPreview(getAvatarUrl(foto_url));
      toast.success('Foto de perfil actualizada', { id: tid });
    } catch {
      setAvatarPreview(getAvatarUrl(user?.foto_url));
      toast.error('No se pudo subir la foto', { id: tid });
    } finally {
      setUploadLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!infoValidate()) return;
    setInfoLoading(true);
    const tid = toast.loading('Guardando cambios...');
    try {
      const updated = await authService.updateMe({ nombre: infoValues.nombre, email: infoValues.email });
      const updatedUser = { ...user, nombre: updated.nombre, email: updated.email };
      setUser(updatedUser);
      authService.saveUser(updatedUser);
      toast.success('Información actualizada correctamente', { id: tid });
    } catch {
      toast.error('No se pudo actualizar la información', { id: tid });
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passValidate()) return;
    setPassLoading(true);
    const tid = toast.loading('Actualizando contraseña...');
    try {
      await authService.updateMe({ password: passValues.password });
      passReset();
      toast.success('Contraseña actualizada correctamente', { id: tid });
    } catch {
      toast.error('No se pudo actualizar la contraseña', { id: tid });
    } finally {
      setPassLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-40">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Avatar card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                {avatarPreview && <AvatarImage src={avatarPreview} alt={user.nombre} />}
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadLoading}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
                title="Cambiar foto"
              >
                {uploadLoading ? <Spinner size="xs" /> : <Camera className="h-3.5 w-3.5" />}
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user.nombre}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <span className="inline-block mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                {user.role}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />Información personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                value={infoValues.nombre}
                onChange={(e) => infoChange('nombre', e.target.value)}
                onBlur={() => infoBlur('nombre')}
                aria-invalid={!!infoFieldError('nombre')}
              />
              <FieldError message={infoFieldError('nombre')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={infoValues.email}
                onChange={(e) => infoChange('email', e.target.value)}
                onBlur={() => infoBlur('email')}
                aria-invalid={!!infoFieldError('email')}
              />
              <FieldError message={infoFieldError('email')} />
            </div>
            <Button type="submit" disabled={infoLoading || infoSubmitDisabled} className="gap-2">
              {infoLoading ? <Spinner size="xs" /> : <Save className="h-4 w-4" />}
              {infoLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" />Cambiar contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePassSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Nueva contraseña</Label>
              <PasswordStrengthInput
                id="password"
                value={passValues.password}
                onChange={(v) => passChange('password', v)}
                required
              />
              <FieldError message={passFieldError('password')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Repite la contraseña"
                value={passValues.confirm}
                onChange={(e) => passChange('confirm', e.target.value)}
                onBlur={() => passBlur('confirm')}
                aria-invalid={!!passFieldError('confirm')}
              />
              <FieldError message={passFieldError('confirm')} />
            </div>
            <Button type="submit" disabled={passLoading || passSubmitDisabled} className="gap-2">
              {passLoading ? <Spinner size="xs" /> : <KeyRound className="h-4 w-4" />}
              {passLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { authService } from '../../../services/auth.service';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Spinner } from '../../../components/ui/Spinner';
import { Camera, Save, KeyRound, User } from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api').replace('/api', '');

function getAvatarUrl(fotoUrl: string | null | undefined) {
  if (!fotoUrl) return undefined;
  if (fotoUrl.startsWith('http')) return fotoUrl;
  return `${API_BASE}${fotoUrl}`;
}

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [uploadLoading, setUploadLoading] = useState(false);

  const [infoForm, setInfoForm] = useState({ nombre: '', email: '' });
  const [infoLoading, setInfoLoading] = useState(false);

  const [passForm, setPassForm] = useState({ password: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    const u = authService.getUser();
    if (u) {
      setUser(u);
      setInfoForm({ nombre: u.nombre || '', email: u.email || '' });
      setAvatarPreview(getAvatarUrl(u.foto_url));
    }
  }, []);

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
    setInfoLoading(true);
    const tid = toast.loading('Guardando cambios...');
    try {
      const updated = await authService.updateMe({ nombre: infoForm.nombre, email: infoForm.email });
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
    if (passForm.password !== passForm.confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passForm.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setPassLoading(true);
    const tid = toast.loading('Actualizando contraseña...');
    try {
      await authService.updateMe({ password: passForm.password });
      setPassForm({ password: '', confirm: '' });
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
              <Input id="nombre" value={infoForm.nombre} onChange={(e) => setInfoForm((f) => ({ ...f, nombre: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" value={infoForm.email} onChange={(e) => setInfoForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>
            <Button type="submit" disabled={infoLoading} className="gap-2">
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
              <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={passForm.password} onChange={(e) => setPassForm((f) => ({ ...f, password: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <Input id="confirm" type="password" placeholder="Repite la contraseña" value={passForm.confirm} onChange={(e) => setPassForm((f) => ({ ...f, confirm: e.target.value }))} required />
            </div>
            <Button type="submit" disabled={passLoading} className="gap-2">
              {passLoading ? <Spinner size="xs" /> : <KeyRound className="h-4 w-4" />}
              {passLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

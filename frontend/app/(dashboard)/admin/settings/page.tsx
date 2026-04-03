'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { Separator } from '../../../../components/ui/separator';
import { authService } from '../../../../services/auth.service';
import { systemConfigService, type SystemConfig } from '../../../../services/system-config.service';
import { Spinner } from '../../../../components/ui/Spinner';

const ICON_SETS = [
  { value: 'lucide', label: 'Lucide (predeterminado)' },
];

const THEME_OPTIONS = [
  { value: 'system', label: 'Sistema (automático)' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];

const DEFAULT_CONFIG: SystemConfig = {
  primary_color: '#16a34a',
  login_bg_url: null,
  theme_mode: 'system',
  icon_set: 'lucide',
};

export default function SettingsPage() {
  const router = useRouter();
  const { setTheme } = useTheme();

  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [bgPreview, setBgPreview] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guard: solo admin
  useEffect(() => {
    const user = authService.getUser();
    if (!user || user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [router]);

  // Cargar configuración actual
  useEffect(() => {
    systemConfigService
      .getConfig()
      .then((data) => {
        setConfig({ ...DEFAULT_CONFIG, ...data });
        const bgUrl = systemConfigService.getLoginBgUrl(data.login_bg_url);
        setBgPreview(bgUrl);
      })
      .catch(() => toast.error('No se pudo cargar la configuración'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await systemConfigService.updateConfig({
        primary_color: config.primary_color,
        theme_mode: config.theme_mode,
        icon_set: config.icon_set,
      });
      systemConfigService.applyConfig(saved);
      if (saved.theme_mode && saved.theme_mode !== 'system') {
        setTheme(saved.theme_mode);
      } else {
        setTheme('system');
      }
      toast.success('Configuración guardada correctamente');
    } catch {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      const saved = await systemConfigService.updateConfig(DEFAULT_CONFIG);
      setConfig({ ...DEFAULT_CONFIG, ...saved });
      systemConfigService.applyConfig(DEFAULT_CONFIG);
      setTheme('system');
      toast.success('Configuración restaurada a valores predeterminados');
    } catch {
      toast.error('Error al restaurar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('La imagen no puede superar 5 MB');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setBgPreview(localPreview);
    setUploadingBg(true);
    try {
      const result = await systemConfigService.uploadLoginBg(file);
      const url = systemConfigService.getLoginBgUrl(result.login_bg_url);
      setBgPreview(url);
      setConfig((prev) => ({ ...prev, login_bg_url: result.login_bg_url }));
      toast.success('Imagen de fondo actualizada');
    } catch {
      toast.error('Error al subir la imagen');
      setBgPreview(systemConfigService.getLoginBgUrl(config.login_bg_url));
    } finally {
      setUploadingBg(false);
    }
  };

  const handleRemoveBg = async () => {
    setSaving(true);
    try {
      await systemConfigService.updateConfig({ login_bg_url: null });
      setBgPreview(undefined);
      setConfig((prev) => ({ ...prev, login_bg_url: null }));
      toast.success('Imagen de fondo eliminada');
    } catch {
      toast.error('Error al eliminar la imagen');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Configuración del Sistema</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Personaliza la apariencia de la aplicación para todos los usuarios.
        </p>
      </div>

      {/* ── Paleta de colores ── */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-medium">Paleta de colores</h3>
          <p className="text-sm text-muted-foreground">
            El color primario se aplica en botones, sidebar, badges y elementos destacados.
          </p>
        </div>
        <Separator />
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-lg border border-border shadow-sm"
            style={{ backgroundColor: config.primary_color ?? '#16a34a' }}
          />
          <div className="space-y-1">
            <Label htmlFor="primary_color">Color primario</Label>
            <div className="flex items-center gap-2">
              <input
                id="primary_color"
                type="color"
                value={config.primary_color ?? '#16a34a'}
                onChange={(e) => {
                  const color = e.target.value;
                  setConfig((prev) => ({ ...prev, primary_color: color }));
                  // Vista previa en tiempo real
                  document.documentElement.style.setProperty('--primary', color);
                  document.documentElement.style.setProperty('--ring', color);
                  document.documentElement.style.setProperty('--sidebar-primary', color);
                  document.documentElement.style.setProperty('--sidebar-ring', color);
                }}
                className="h-9 w-20 cursor-pointer rounded border border-input bg-background p-1"
              />
              <span className="text-sm text-muted-foreground font-mono">
                {config.primary_color ?? '#16a34a'}
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Sugerencias: verde (#16a34a), azul (#2563eb), morado (#7c3aed), naranja (#ea580c)
        </p>
      </section>

      {/* ── Fondo del Login ── */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-medium">Fondo del Login</h3>
          <p className="text-sm text-muted-foreground">
            Imagen de fondo para el panel izquierdo de la pantalla de inicio de sesión. JPG, PNG o WebP, máx. 5 MB.
          </p>
        </div>
        <Separator />
        <div className="flex items-start gap-4">
          {bgPreview ? (
            <div className="relative h-28 w-44 rounded-lg overflow-hidden border border-border flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bgPreview} alt="Fondo del login" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-28 w-44 rounded-lg border-2 border-dashed border-border flex items-center justify-center flex-shrink-0 bg-muted">
              <span className="text-xs text-muted-foreground text-center px-2">Sin imagen</span>
            </div>
          )}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleBgUpload}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={uploadingBg}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingBg && <Spinner size="xs" />}
              {bgPreview ? 'Cambiar imagen' : 'Subir imagen'}
            </Button>
            {bgPreview && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={saving}
                onClick={handleRemoveBg}
              >
                Eliminar imagen
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ── Tema ── */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-medium">Tema</h3>
          <p className="text-sm text-muted-foreground">
            Define el esquema de color claro/oscuro para todos los usuarios.
          </p>
        </div>
        <Separator />
        <div className="flex flex-wrap gap-3">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setConfig((prev) => ({ ...prev, theme_mode: opt.value }))}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                config.theme_mode === opt.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Iconos ── */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-medium">Iconos del sistema</h3>
          <p className="text-sm text-muted-foreground">
            Set de iconos utilizado en toda la aplicación.
          </p>
        </div>
        <Separator />
        <div className="flex flex-wrap gap-3">
          {ICON_SETS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setConfig((prev) => ({ ...prev, icon_set: opt.value }))}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                config.icon_set === opt.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Acciones ── */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Spinner size="xs" />}
          Guardar cambios
        </Button>
        <Button variant="outline" onClick={handleReset} disabled={saving}>
          Restaurar valores predeterminados
        </Button>
      </div>
    </div>
  );
}

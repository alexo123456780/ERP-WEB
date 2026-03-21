'use client';
import { useState, useCallback } from 'react';
import { Eye, EyeOff, RefreshCw, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inputClass } from './FormField';

const CRITERIA = [
  { key: 'minLength', label: 'Al menos 8 caracteres', test: (v: string) => v.length >= 8 },
  { key: 'hasUpper', label: 'Una letra mayúscula (A-Z)', test: (v: string) => /[A-Z]/.test(v) },
  { key: 'hasLower', label: 'Una letra minúscula (a-z)', test: (v: string) => /[a-z]/.test(v) },
  { key: 'hasNumber', label: 'Un número (0-9)', test: (v: string) => /\d/.test(v) },
  {
    key: 'hasSpecial',
    label: 'Un carácter especial (!@#$...)',
    test: (v: string) => /[!@#$%^&*()\-_=+[\]{};':",.<>/?\\|`~]/.test(v),
  },
];

function getStrength(value: string) {
  const score = CRITERIA.filter((c) => c.test(value)).length;
  if (score <= 2) return { score, label: 'Débil', colorClass: 'bg-destructive', textClass: 'text-destructive' };
  if (score <= 4) return { score, label: 'Media', colorClass: 'bg-yellow-500', textClass: 'text-yellow-600 dark:text-yellow-400' };
  return { score, label: 'Fuerte', colorClass: 'bg-emerald-500', textClass: 'text-emerald-600 dark:text-emerald-400' };
}

const CHARS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  special: '!@#$%^&*()-_=+[]{};\':\",./<>?',
};

function generatePassword(length = 14): string {
  const all = CHARS.upper + CHARS.lower + CHARS.digits + CHARS.special;
  const required = [
    CHARS.upper[Math.floor(Math.random() * CHARS.upper.length)],
    CHARS.lower[Math.floor(Math.random() * CHARS.lower.length)],
    CHARS.digits[Math.floor(Math.random() * CHARS.digits.length)],
    CHARS.special[Math.floor(Math.random() * CHARS.special.length)],
  ];
  const rest = Array.from({ length: length - 4 }, () => all[Math.floor(Math.random() * all.length)]);
  return [...required, ...rest].sort(() => Math.random() - 0.5).join('');
}

export function isPasswordValid(value: string): boolean {
  return CRITERIA.every((c) => c.test(value));
}

interface PasswordStrengthInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  showGenerator?: boolean;
}

export function PasswordStrengthInput({
  id,
  value,
  onChange,
  placeholder = 'Mínimo 8 caracteres',
  required,
  showGenerator = true,
}: PasswordStrengthInputProps) {
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState(false);

  const strength = value ? getStrength(value) : null;

  const handleGenerate = useCallback(() => {
    onChange(generatePassword(14));
    setShowPass(true);
  }, [onChange]);

  const handleCopy = useCallback(() => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <input
            id={id}
            type={showPass ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className={cn(inputClass, 'pr-9')}
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            title={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        {showGenerator && (
          <>
            <button
              type="button"
              onClick={handleGenerate}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Generar contraseña segura"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Generar
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!value}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Copiar contraseña"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </>
        )}
      </div>

      {value && strength && (
        <>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 flex-1">
              {CRITERIA.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all duration-300',
                    i < strength.score ? strength.colorClass : 'bg-muted'
                  )}
                />
              ))}
            </div>
            <span className={cn('text-xs font-medium', strength.textClass)}>{strength.label}</span>
          </div>
          <ul className="space-y-0.5">
            {CRITERIA.map((c) => {
              const met = c.test(value);
              return (
                <li
                  key={c.key}
                  className={cn(
                    'flex items-center gap-1.5 text-xs transition-colors',
                    met ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 flex-shrink-0 rounded-full',
                      met ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                    )}
                  />
                  {c.label}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {copied && <p className="text-xs text-emerald-600 dark:text-emerald-400">¡Copiado al portapapeles!</p>}
    </div>
  );
}

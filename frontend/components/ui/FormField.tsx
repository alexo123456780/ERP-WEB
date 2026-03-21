import { Label } from './label';
import { FieldError } from './FieldError';
import { cn } from '../../lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className={cn(error && '[&_input]:border-destructive [&_input]:focus-visible:ring-destructive/20')}>
        {children}
      </div>
      <FieldError message={error} />
    </div>
  );
}

export const inputClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

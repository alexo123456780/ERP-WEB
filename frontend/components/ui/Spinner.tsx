import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-2',
};

export function Spinner({ size = 'sm', className }: SpinnerProps) {
  return (
    <span
      aria-label="Cargando"
      className={cn(
        'inline-block rounded-full border-current border-t-transparent animate-spin',
        sizes[size],
        className
      )}
    />
  );
}

/** Full-page centered loader */
export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
      <Spinner size="lg" className="text-primary" />
      <p className="text-sm text-muted-foreground">Cargando...</p>
    </div>
  );
}

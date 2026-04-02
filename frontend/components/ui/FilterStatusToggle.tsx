import { RotateCcw } from 'lucide-react';
import { Button } from './button';

export type FilterActivo = 'all' | 'true' | 'false';

interface FilterStatusToggleProps {
  value: FilterActivo;
  onChange: (val: FilterActivo) => void;
  hasInactiveRecords: boolean;
  onRestore: () => void;
}

export function FilterStatusToggle({ value, onChange, hasInactiveRecords, onRestore }: FilterStatusToggleProps) {
  const btnClass = (val: FilterActivo) =>
    `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
      value === val
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
    }`;

  const showRestore = value === 'false' && hasInactiveRecords;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 w-fit border border-border">
        <button className={btnClass('all')} onClick={() => onChange('all')}>Todos</button>
        <button className={btnClass('true')} onClick={() => onChange('true')}>Activos</button>
        <button className={btnClass('false')} onClick={() => onChange('false')}>Inactivos</button>
      </div>
      {showRestore && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRestore}
          className="gap-1.5 text-xs h-8"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restaurar vista
        </Button>
      )}
    </div>
  );
}

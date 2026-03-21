interface Option {
  value: string;
  label: string;
}

export function FilterToggle({ value, options, onChange }: {
  value: string;
  options: Option[];
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 w-fit border border-border">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            value === opt.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

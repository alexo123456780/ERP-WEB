import { Card, CardContent } from './card';
import { type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const variantStyles: Record<string, { icon: string }> = {
  default: { icon: 'bg-primary/10 text-primary' },
  blue:    { icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  green:   { icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  yellow:  { icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  red:     { icon: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  purple:  { icon: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
};

export function StatCard({ title, value, icon: Icon, description, variant = 'default' }: StatCardProps) {
  const styles = variantStyles[variant] ?? variantStyles.default;
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', styles.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

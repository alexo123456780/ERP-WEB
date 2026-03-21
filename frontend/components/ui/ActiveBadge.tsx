import { Badge } from './badge';

export function ActiveBadge({ active }: { active: boolean }) {
  return active
    ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">Activo</Badge>
    : <Badge className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-0">Inactivo</Badge>;
}

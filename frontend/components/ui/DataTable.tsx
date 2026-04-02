import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { Skeleton } from './skeleton';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  exportValue?: (row: T) => string | number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  defaultPageSize?: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  emptyMessage = 'Sin datos',
  defaultPageSize = 10,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageData = data.slice(start, end);

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const showFooter = !loading && total > 0;
  const skeletonRows = pageSize > 5 ? 5 : pageSize;

  return (
    <div className="rounded-lg border border-border overflow-hidden">

      {/* ── Mobile: card layout ── */}
      <div className="md:hidden divide-y divide-border">
        {loading ? (
          Array.from({ length: skeletonRows }).map((_, i) => (
            <div key={i} className="p-4 space-y-3">
              {columns.map((col) => (
                <div key={col.key} className="flex justify-between gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
          ))
        ) : pageData.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
            {emptyMessage}
          </div>
        ) : (
          pageData.map((row, idx) => (
            <div key={start + idx} className="p-4 space-y-2">
              {columns.map((col) => (
                <div key={col.key} className="flex justify-between gap-2 text-sm">
                  <span className="font-semibold text-xs uppercase tracking-wide text-muted-foreground shrink-0">
                    {col.header}
                  </span>
                  <span className="text-right break-words min-w-0">
                    {col.render ? col.render(row) : row[col.key]}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* ── Desktop: table layout ── */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className="text-xs font-semibold uppercase tracking-wide">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : pageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((row, idx) => (
                <TableRow key={start + idx}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination (shared mobile + desktop) ── */}
      {showFooter && (
        <div className="border-t border-border px-4 py-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs">Filas por página:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSize(Number(e.target.value))}
                className="h-7 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs">{start + 1}–{end} de {total}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './button';
import { Spinner } from './Spinner';
import type { Column } from './DataTable';

interface ExportButtonProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  filename: string;
  disabled?: boolean;
}

function getPlainValue<T extends Record<string, any>>(row: T, col: Column<T>): string {
  if (col.exportValue) return String(col.exportValue(row));
  const val = row[col.key];
  if (val === null || val === undefined) return '';
  return String(val);
}

export function ExportButton<T extends Record<string, any>>({
  data,
  columns,
  filename,
  disabled,
}: ExportButtonProps<T>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<'excel' | 'pdf' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const exportColumns = columns.filter((c) => c.key !== 'actions');
  const today = new Date().toISOString().split('T')[0];
  const safeFilename = `${filename}_${today}`;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const exportExcel = async () => {
    setLoading('excel');
    setOpen(false);
    try {
      const XLSX = await import('xlsx');
      const headers = exportColumns.map((c) => c.header);
      const rows = data.map((row) => exportColumns.map((col) => getPlainValue(row, col)));
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

      const colWidths = exportColumns.map((col) => {
        const maxLen = Math.max(
          col.header.length,
          ...data.map((row) => String(getPlainValue(row, col)).length),
        );
        return { wch: Math.min(maxLen + 2, 40) };
      });
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, filename.slice(0, 31));
      XLSX.writeFile(wb, `${safeFilename}.xlsx`);
      toast.success(`Archivo Excel generado: ${safeFilename}.xlsx`);
    } catch {
      toast.error('Error al generar el archivo Excel');
    } finally {
      setLoading(null);
    }
  };

  const exportPDF = async () => {
    setLoading('pdf');
    setOpen(false);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const orientation = exportColumns.length > 5 ? 'landscape' : 'portrait';
      const doc = new jsPDF({ orientation });

      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text(filename.charAt(0).toUpperCase() + filename.slice(1), 14, 16);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Generado el ${today}  •  ${data.length} registro${data.length !== 1 ? 's' : ''}`, 14, 22);

      autoTable(doc, {
        head: [exportColumns.map((c) => c.header)],
        body: data.map((row) => exportColumns.map((col) => getPlainValue(row, col))),
        startY: 27,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
      });

      doc.save(`${safeFilename}.pdf`);
      toast.success(`PDF generado: ${safeFilename}.pdf`);
    } catch {
      toast.error('Error al generar el PDF');
    } finally {
      setLoading(null);
    }
  };

  const isDisabled = disabled || !!loading || data.length === 0;

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        disabled={isDisabled}
        onClick={() => setOpen((o) => !o)}
        className="gap-1.5"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {loading ? <Spinner size="xs" /> : <Download className="h-3.5 w-3.5" />}
        Exportar
        <ChevronDown className="h-3 w-3 opacity-60" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[168px] rounded-lg border border-border bg-popover py-1 shadow-md">
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-muted"
            onClick={exportExcel}
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Excel (.xlsx)
          </button>
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-muted"
            onClick={exportPDF}
          >
            <FileText className="h-4 w-4 text-red-500" />
            PDF
          </button>
        </div>
      )}
    </div>
  );
}

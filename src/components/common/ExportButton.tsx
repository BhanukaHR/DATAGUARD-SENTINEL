import { Download } from "lucide-react";

interface ExportButtonProps {
  onExport: () => void;
  label?: string;
  isLoading?: boolean;
}

export function ExportButton({ onExport, label = "Export", isLoading = false }: ExportButtonProps) {
  return (
    <button
      onClick={onExport}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
    >
      <Download className="h-3.5 w-3.5" />
      {isLoading ? "Exporting..." : label}
    </button>
  );
}

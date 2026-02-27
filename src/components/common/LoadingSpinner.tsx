import { Loader2 } from "lucide-react";

export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
      <p className="mt-3 text-sm text-slate-500">{text}</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title = "No data",
  description = "There's nothing to show here yet.",
}: {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
      {icon && <div className="text-slate-300 mb-3">{icon}</div>}
      <h3 className="text-sm font-medium text-slate-600">{title}</h3>
      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
  );
}

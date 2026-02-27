interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

export function RiskLevelBadge({ level }: { level: string }) {
  const colorMap: Record<string, string> = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-orange-100 text-orange-800",
    Critical: "bg-red-100 text-red-800",
  };
  return <Badge className={colorMap[level] || "bg-slate-100 text-slate-700"}>{level}</Badge>;
}

export function SensitivityBadge({ level }: { level: string }) {
  const colorMap: Record<string, string> = {
    Public: "bg-green-100 text-green-800",
    Internal: "bg-blue-100 text-blue-800",
    Confidential: "bg-orange-100 text-orange-800",
    Restricted: "bg-red-100 text-red-800",
  };
  return <Badge className={colorMap[level] || "bg-slate-100 text-slate-700"}>{level}</Badge>;
}

export function AlertTypeBadge({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    Info: "bg-blue-100 text-blue-800",
    Warning: "bg-yellow-100 text-yellow-800",
    Block: "bg-orange-100 text-orange-800",
    Critical: "bg-red-100 text-red-800",
  };
  return <Badge className={colorMap[type] || "bg-slate-100 text-slate-700"}>{type}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    online: "bg-green-100 text-green-800",
    inactive: "bg-slate-100 text-slate-700",
    offline: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    uninstalled: "bg-red-100 text-red-600",
    removed: "bg-red-100 text-red-800",
  };
  return <Badge className={colorMap[status] || "bg-slate-100 text-slate-700"}>{status}</Badge>;
}

export function ChannelBadge({ channel }: { channel: string }) {
  const colorMap: Record<string, string> = {
    Browser: "bg-blue-100 text-blue-800",
    Clipboard: "bg-purple-100 text-purple-800",
    USB: "bg-orange-100 text-orange-800",
    AiApplication: "bg-red-100 text-red-800",
    FileSystem: "bg-slate-100 text-slate-700",
    Email: "bg-teal-100 text-teal-800",
    FTP: "bg-yellow-100 text-yellow-800",
    CloudSync: "bg-cyan-100 text-cyan-800",
  };
  return <Badge className={colorMap[channel] || "bg-slate-100 text-slate-700"}>{channel}</Badge>;
}

export function BooleanBadge({ value, trueLabel = "Yes", falseLabel = "No" }: { value: boolean; trueLabel?: string; falseLabel?: string }) {
  return value
    ? <Badge className="bg-red-100 text-red-800">{trueLabel}</Badge>
    : <Badge className="bg-green-100 text-green-800">{falseLabel}</Badge>;
}

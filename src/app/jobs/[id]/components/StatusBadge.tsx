interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  };

  const statusVariant = status === 'active' ? 'success' : variant;

  return (
    <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full border text-sm ${variants[statusVariant]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
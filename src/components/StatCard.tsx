interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: React.ReactNode;
  trend?: string;
}

export function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-[20px] border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            {icon}
          </div>
        )}
        {trend && (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
            {trend}
          </span>
        )}
      </div>
      <div className="text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-600 mb-1">{title}</div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}
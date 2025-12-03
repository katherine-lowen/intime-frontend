import { FileText } from "lucide-react";

interface TemplateItemProps {
  name: string;
  department: string;
  role: string;
  taskCount: number;
  isDefault?: boolean;
}

export function TemplateItem({
  name,
  department,
  role,
  taskCount,
  isDefault,
}: TemplateItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
      <div className="mt-0.5 text-indigo-600">
        <FileText className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-900 truncate">{name}</span>
          {isDefault && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
              Default
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {department} · {role} · {taskCount} tasks
        </p>
      </div>
    </div>
  );
}

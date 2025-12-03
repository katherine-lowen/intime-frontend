import { FileText, Users } from "lucide-react";

export function PayrollTablePreview() {
  const hasData = false; // Toggle for empty state

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[24px] shadow-sm border border-white/60 overflow-hidden mb-6">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-slate-900">Payroll export preview</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              This is the same data your provider will receive in the export file.
            </p>
          </div>
        </div>
      </div>

      {hasData ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-slate-600">Employee Name</th>
                <th className="px-6 py-3 text-left text-xs text-slate-600">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs text-slate-600">Provider</th>
                <th className="px-6 py-3 text-left text-xs text-slate-600">Base Pay</th>
                <th className="px-6 py-3 text-left text-xs text-slate-600">Pay Type</th>
                <th className="px-6 py-3 text-left text-xs text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Table rows would go here */}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-12">
          <div className="max-w-lg mx-auto text-center space-y-6">
            {/* Icon with gradient orb */}
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl scale-150" />
              <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-blue-100/50">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-slate-900">No payroll data to preview</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                Configure employee compensation and link payroll providers to see your export preview here.
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                Add employee data
              </button>
              <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 text-sm">
                View documentation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

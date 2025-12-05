import { Calendar, TrendingUp, Download, ExternalLink } from 'lucide-react';

interface Employee {
  name: string;
  department: string;
  accrued: number;
  used: number;
  remaining: number;
  utilizationRate: number;
}

export function PTOInsightsCard() {
  const employees: Employee[] = [
    { name: 'Alex Chen', department: 'Engineering', accrued: 20, used: 8, remaining: 12, utilizationRate: 40 },
    { name: 'Maria Garcia', department: 'Product', accrued: 20, used: 15, remaining: 5, utilizationRate: 75 },
    { name: 'James Wilson', department: 'Sales', accrued: 18, used: 3, remaining: 15, utilizationRate: 17 },
    { name: 'Sarah Kim', department: 'Design', accrued: 20, used: 18, remaining: 2, utilizationRate: 90 },
    { name: 'David Park', department: 'Engineering', accrued: 20, used: 10, remaining: 10, utilizationRate: 50 }
  ];

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-red-400 bg-red-500/10';
    if (rate >= 60) return 'text-amber-400 bg-amber-500/10';
    return 'text-emerald-400 bg-emerald-500/10';
  };

  return (
    <div className="ai-card rounded-3xl p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Calendar className="w-5 h-5 text-indigo-400" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-slate-50 text-[17px] mb-2">
              PTO Balances & Insights
            </h3>
            <p className="text-slate-400 text-[14px] leading-relaxed max-w-xl">
              Current year accruals and usage. Note: 3 employees have used &gt;75% of their PTO — consider encouraging time off.
            </p>
          </div>
        </div>
        <button className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 text-slate-300 border border-slate-700/50 transition-all">
          <Download className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* Mini Bar Graph - Usage Overview */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-700/30">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-indigo-400" strokeWidth={2} />
          <span className="text-slate-300 text-[14px]">Team Utilization</span>
        </div>
        <div className="space-y-3">
          {employees.map((emp, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400 text-[13px]">{emp.name}</span>
                <span className="text-slate-500 text-[12px]">{emp.utilizationRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    emp.utilizationRate >= 80 ? 'bg-red-500' :
                    emp.utilizationRate >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${emp.utilizationRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-700/30">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/30 bg-slate-900/30">
              <th className="text-left py-3.5 px-4 text-slate-400 text-[13px]">Employee</th>
              <th className="text-left py-3.5 px-4 text-slate-400 text-[13px]">Department</th>
              <th className="text-right py-3.5 px-4 text-slate-400 text-[13px]">Accrued</th>
              <th className="text-right py-3.5 px-4 text-slate-400 text-[13px]">Used</th>
              <th className="text-right py-3.5 px-4 text-slate-400 text-[13px]">Remaining</th>
              <th className="text-right py-3.5 px-4 text-slate-400 text-[13px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {employees.map((emp, idx) => (
              <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                <td className="py-3.5 px-4 text-slate-200 text-[14px]">{emp.name}</td>
                <td className="py-3.5 px-4 text-slate-400 text-[13px]">{emp.department}</td>
                <td className="py-3.5 px-4 text-right text-slate-300 text-[14px]">{emp.accrued}d</td>
                <td className="py-3.5 px-4 text-right text-slate-300 text-[14px]">{emp.used}d</td>
                <td className="py-3.5 px-4 text-right text-slate-100 text-[14px]">{emp.remaining}d</td>
                <td className="py-3.5 px-4 text-right">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[12px] ${getUtilizationColor(emp.utilizationRate)}`}>
                    {emp.utilizationRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      {/* Actions */}
      <div className="flex gap-3">
        <button className="btn-primary flex items-center gap-2">
          <span>Open People Directory</span>
          <ExternalLink className="w-4 h-4" strokeWidth={2} />
        </button>
        <button className="btn-secondary">
          Export Insights
        </button>
      </div>
    </div>
  );
}
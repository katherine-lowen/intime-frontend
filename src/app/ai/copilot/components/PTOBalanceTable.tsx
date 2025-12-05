import { Calendar, Download } from 'lucide-react';

interface PTOBalance {
  name: string;
  role: string;
  accrued: number;
  used: number;
  remaining: number;
  status: 'healthy' | 'warning' | 'critical';
}

export function PTOBalanceTable() {
  const balances: PTOBalance[] = [
    { name: 'Alex Chen', role: 'Engineering', accrued: 20, used: 8, remaining: 12, status: 'healthy' },
    { name: 'Maria Garcia', role: 'Product', accrued: 20, used: 15, remaining: 5, status: 'warning' },
    { name: 'James Wilson', role: 'Sales', accrued: 18, used: 3, remaining: 15, status: 'healthy' },
    { name: 'Sarah Kim', role: 'Design', accrued: 20, used: 18, remaining: 2, status: 'critical' },
    { name: 'David Park', role: 'Engineering', accrued: 20, used: 10, remaining: 10, status: 'healthy' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-slate-50">PTO Balances</h3>
            <p className="text-slate-400">Current year accruals and usage</p>
          </div>
        </div>
        <button className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-colors">
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-slate-400">Employee</th>
              <th className="text-left py-3 px-4 text-slate-400">Department</th>
              <th className="text-right py-3 px-4 text-slate-400">Accrued</th>
              <th className="text-right py-3 px-4 text-slate-400">Used</th>
              <th className="text-right py-3 px-4 text-slate-400">Remaining</th>
              <th className="text-center py-3 px-4 text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((balance, index) => (
              <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                <td className="py-3 px-4 text-slate-200">{balance.name}</td>
                <td className="py-3 px-4 text-slate-400">{balance.role}</td>
                <td className="py-3 px-4 text-right text-slate-300">{balance.accrued}d</td>
                <td className="py-3 px-4 text-right text-slate-300">{balance.used}d</td>
                <td className="py-3 px-4 text-right text-slate-200">{balance.remaining}d</td>
                <td className="py-3 px-4">
                  <div className="flex justify-center">
                    <span className={`px-2 py-1 rounded-md border text-xs ${getStatusColor(balance.status)}`}>
                      {balance.status}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 pt-2">
        <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">
          View All Balances
        </button>
        <button className="px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-colors">
          Request PTO
        </button>
      </div>
    </div>
  );
}

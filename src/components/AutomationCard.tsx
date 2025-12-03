import { Shield } from "lucide-react";

export function AutomationCard() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 backdrop-blur-xl rounded-[20px] border border-slate-200/60 p-6 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl p-2.5 text-white shadow-lg shadow-purple-500/20 opacity-40">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-slate-700">Automation Status</h3>
              <span className="px-2.5 py-1 bg-white/80 border border-slate-200/60 text-slate-600 rounded-lg text-xs">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-slate-500">Payroll auto-sync with providers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Sparkles, Wand2 } from 'lucide-react';

interface InputPanelProps {
  roleInput: string;
  setRoleInput: (value: string) => void;
  seniority: string;
  setSeniority: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  onGenerate: () => void;
  isLoading?: boolean;
  isFocused?: boolean;
  setIsFocused?: (value: boolean) => void;
}

export function InputPanel({
  roleInput,
  setRoleInput,
  seniority,
  setSeniority,
  department,
  setDepartment,
  onGenerate,
  isLoading = false,
  isFocused = false,
  setIsFocused
}: InputPanelProps) {
  const canGenerate = roleInput.trim().length > 10;
  const hasContent = roleInput.length > 0;

  return (
    <div className="p-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
          <h2 className="text-slate-900">Describe the role</h2>
        </div>
        <p className="text-slate-500 text-sm ml-3">
          Provide any details you have — the AI will structure everything beautifully.
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Main Text Input with Floating Label */}
        <div className="relative">
          <label
            className={`absolute left-4 transition-all duration-200 pointer-events-none ${
              hasContent || isFocused
                ? 'top-3 text-xs text-indigo-600'
                : 'top-6 text-sm text-slate-400'
            }`}
          >
            {hasContent || isFocused ? 'Role Description' : ''}
          </label>
          <textarea
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            onFocus={() => setIsFocused?.(true)}
            onBlur={() => setIsFocused?.(false)}
            placeholder="e.g., We need a backend engineer to own APIs, data pipelines, and platform reliability. Should have strong Python skills and experience scaling systems…"
            className={`w-full h-48 px-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 border-2 rounded-2xl resize-none focus:outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-inner ${
              isFocused
                ? 'border-indigo-500 ring-4 ring-indigo-500/10 pt-9 pb-4'
                : 'border-slate-200 pt-4 pb-4'
            } ${hasContent && !isFocused ? 'pt-9' : ''}`}
            disabled={isLoading}
          />
        </div>

        {/* Secondary Inputs */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-slate-600 mb-2.5 ml-1 tracking-wide uppercase">
              Seniority Level
            </label>
            <div className="relative">
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className="w-full px-5 py-3.5 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 appearance-none cursor-pointer shadow-sm hover:shadow-md"
                disabled={isLoading}
              >
                <option value="">Select level</option>
                <option value="Entry-Level">Entry-Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Principal">Principal</option>
                <option value="Executive">Executive</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-2.5 ml-1 tracking-wide uppercase">
              Department
            </label>
            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-5 py-3.5 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 appearance-none cursor-pointer shadow-sm hover:shadow-md"
                disabled={isLoading}
              >
                <option value="">Select department</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Customer Success">Customer Success</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="People & HR">People & HR</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-4">
          <button
            onClick={onGenerate}
            disabled={!canGenerate || isLoading}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 disabled:shadow-none overflow-hidden"
          >
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:200%_100%]" />
            </div>
            
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="relative">Generating your JD...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 relative group-hover:rotate-12 transition-transform" />
                <span className="relative">Generate JD</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
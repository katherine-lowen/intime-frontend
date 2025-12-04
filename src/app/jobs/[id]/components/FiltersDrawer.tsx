import { X, SlidersHorizontal } from 'lucide-react';

interface FiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FiltersDrawer({ isOpen, onClose }: FiltersDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-white shadow-2xl z-50 border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-5 text-slate-600" />
            <h2 className="text-slate-900">Filters</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="size-5 text-slate-500" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-6 overflow-y-auto h-[calc(100vh-88px)]">
          <div className="space-y-6">
            {/* Stage Filter */}
            <div>
              <label className="block text-slate-700 mb-2.5">Stage</label>
              <div className="space-y-2">
                {['Applied', 'Screen', 'Interview', 'Offer', 'Hired'].map((stage) => (
                  <label key={stage} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="size-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                    />
                    <span className="text-slate-700 group-hover:text-slate-900">{stage}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Source Filter */}
            <div className="pt-6 border-t border-slate-200">
              <label className="block text-slate-700 mb-2.5">Source</label>
              <div className="space-y-2">
                {['LinkedIn', 'Referral', 'Internal', 'Indeed', 'Job Board'].map((source) => (
                  <label key={source} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="size-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                    />
                    <span className="text-slate-700 group-hover:text-slate-900">{source}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Score Range */}
            <div className="pt-6 border-t border-slate-200">
              <label className="block text-slate-700 mb-2.5">AI Fit Score</label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400"
                  />
                  <span className="text-slate-400">—</span>
                  <input 
                    type="number" 
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  className="w-full"
                />
              </div>
            </div>

            {/* Tags Filter */}
            <div className="pt-6 border-t border-slate-200">
              <label className="block text-slate-700 mb-2.5">Tags</label>
              <div className="space-y-2">
                {['Strong match', 'Culture fit', 'Risk candidate', 'Fast track'].map((tag) => (
                  <label key={tag} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="size-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                    />
                    <span className="text-slate-700 group-hover:text-slate-900">{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Recruiter Filter */}
            <div className="pt-6 border-t border-slate-200">
              <label className="block text-slate-700 mb-2.5">Assigned Recruiter</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 cursor-pointer">
                <option>All recruiters</option>
                <option>Sarah Martinez</option>
                <option>John Anderson</option>
                <option>Emily Chen</option>
              </select>
            </div>

            {/* Date Filters */}
            <div className="pt-6 border-t border-slate-200">
              <label className="block text-slate-700 mb-2.5">Application Date</label>
              <div className="space-y-2">
                {['Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom range'].map((range) => (
                  <label key={range} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="date-range"
                      className="size-4 border-slate-300 text-indigo-600 cursor-pointer"
                    />
                    <span className="text-slate-700 group-hover:text-slate-900">{range}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Last Activity */}
            <div className="pt-6 border-t border-slate-200">
              <label className="block text-slate-700 mb-2.5">Last Activity</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 cursor-pointer">
                <option>Anytime</option>
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-200 flex items-center gap-3">
          <button className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Apply Filters
          </button>
          <button className="px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
            Reset
          </button>
        </div>
      </div>
    </>
  );
}

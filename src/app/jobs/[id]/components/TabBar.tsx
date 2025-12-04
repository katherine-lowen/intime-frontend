import { Filter, MoreHorizontal, LayoutGrid, List, Sparkles } from 'lucide-react';

interface TabBarProps {
  activeTab: 'pipeline' | 'ai-insights' | 'job-details';
  onTabChange: (tab: 'pipeline' | 'ai-insights' | 'job-details') => void;
  viewMode: 'board' | 'list' | 'triage';
  onViewModeChange: (mode: 'board' | 'list' | 'triage') => void;
  onToggleFilters: () => void;
}

export function TabBar({ activeTab, onTabChange, viewMode, onViewModeChange, onToggleFilters }: TabBarProps) {
  const tabs = [
    { id: 'pipeline' as const, label: 'Pipeline' },
    { id: 'ai-insights' as const, label: 'AI Insights' },
    { id: 'job-details' as const, label: 'Job Details' }
  ];

  const showViewSwitcher = activeTab === 'pipeline';

  return (
    <div className="sticky top-[113px] z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="mx-auto px-8">
        <div className="flex items-center justify-between">
          {/* Tier 3 - Tab Navigation */}
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  py-3 border-b-2 transition-all text-sm
                  ${activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right-aligned Action Cluster */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            {showViewSwitcher && (
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mr-2">
                <button
                  onClick={() => onViewModeChange('board')}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all
                    ${viewMode === 'board' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                    }
                  `}
                >
                  <LayoutGrid className="size-4" />
                  <span>Board</span>
                </button>
                <button
                  onClick={() => onViewModeChange('list')}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all
                    ${viewMode === 'list' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                    }
                  `}
                >
                  <List className="size-4" />
                  <span>List</span>
                </button>
                <button
                  onClick={() => onViewModeChange('triage')}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all
                    ${viewMode === 'triage' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                    }
                  `}
                >
                  <Sparkles className="size-4" />
                  <span>AI Triage</span>
                </button>
              </div>
            )}

            <button 
              onClick={onToggleFilters}
              className="flex items-center gap-2 px-3.5 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Filter className="size-4" />
              <span className="text-sm">Filters</span>
            </button>
            <button className="flex items-center justify-center size-9 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
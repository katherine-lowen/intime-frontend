import { ChevronRight, Calendar, MapPin, Briefcase, Hash } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PublishToggle } from './PublishToggle';

interface HeaderProps {
  jobData: {
    id: string;
    title: string;
    status: string;
    department: string;
    location: string;
    createdDate: string;
  };
  onToggleFilters: () => void;
}

export function Header({ jobData, onToggleFilters }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="mx-auto px-8 py-5">
        {/* Tier 1 - Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-4 text-slate-500 text-xs">
          <span className="hover:text-slate-700 cursor-pointer transition-colors">Hiring</span>
          <ChevronRight className="size-3" />
          <span className="hover:text-slate-700 cursor-pointer transition-colors">Requisition</span>
          <ChevronRight className="size-3" />
          <span className="text-slate-700">{jobData.id}</span>
        </div>

        {/* Tier 2 - Job Overview */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-slate-900 text-2xl">{jobData.title}</h1>
              <StatusBadge status={jobData.status} />
              <PublishToggle />
            </div>

            {/* Inline Metadata Chips */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                <Briefcase className="size-3.5 text-slate-500" />
                <span className="text-slate-700 text-sm">{jobData.department}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                <MapPin className="size-3.5 text-slate-500" />
                <span className="text-slate-700 text-sm">{jobData.location}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                <Calendar className="size-3.5 text-slate-500" />
                <span className="text-slate-700 text-sm">Opened {jobData.createdDate}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                <Hash className="size-3.5 text-slate-500" />
                <span className="text-slate-700 text-sm">{jobData.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
import { useState } from 'react';
import { ArrowUpDown, FileText, Check, X, Archive, UserPlus } from 'lucide-react';

interface ListViewTabProps {
  jobId: string;
}

interface Candidate {
  id: string;
  name: string;
  avatar: string;
  email: string;
  source: string;
  stage: string;
  fitScore: number;
  timeInStage: string;
  totalTime: string;
  lastActivity: string;
  status: 'Active' | 'Ghosted' | 'Unresponsive';
}

export function ListViewTab({ jobId }: ListViewTabProps) {
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string>('fitScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Generate sample candidates
  const candidates: Candidate[] = [
    { id: '1', name: 'Sarah Chen', avatar: 'SC', email: 'sarah.chen@email.com', source: 'LinkedIn', stage: 'Applied', fitScore: 94, timeInStage: '2d', totalTime: '2d', lastActivity: '2h ago', status: 'Active' },
    { id: '2', name: 'Robert Taylor', avatar: 'RT', email: 'robert.t@email.com', source: 'Referral', stage: 'Offer', fitScore: 91, timeInStage: '3d', totalTime: '21d', lastActivity: '5h ago', status: 'Active' },
    { id: '3', name: 'Lisa Anderson', avatar: 'LA', email: 'lisa.a@email.com', source: 'LinkedIn', stage: 'Interview', fitScore: 88, timeInStage: '5d', totalTime: '14d', lastActivity: '1d ago', status: 'Active' },
    { id: '4', name: 'James Wilson', avatar: 'JW', email: 'james.w@email.com', source: 'Referral', stage: 'Interview', fitScore: 85, timeInStage: '12d', totalTime: '19d', lastActivity: '3d ago', status: 'Unresponsive' },
    { id: '5', name: 'David Kim', avatar: 'DK', email: 'david.kim@email.com', source: 'LinkedIn', stage: 'Screen', fitScore: 82, timeInStage: '7d', totalTime: '14d', lastActivity: '1h ago', status: 'Active' },
    { id: '6', name: 'Aisha Patel', avatar: 'AP', email: 'aisha.p@email.com', source: 'Internal', stage: 'Screen', fitScore: 79, timeInStage: '8d', totalTime: '15d', lastActivity: '6h ago', status: 'Active' },
    { id: '7', name: 'Marcus Johnson', avatar: 'MJ', email: 'marcus.j@email.com', source: 'Referral', stage: 'Applied', fitScore: 76, timeInStage: '3d', totalTime: '3d', lastActivity: '8h ago', status: 'Active' },
    { id: '8', name: 'Emily Rodriguez', avatar: 'ER', email: 'emily.r@email.com', source: 'Indeed', stage: 'Applied', fitScore: 71, timeInStage: '5d', totalTime: '5d', lastActivity: '2d ago', status: 'Ghosted' },
    { id: '9', name: 'Michael Chang', avatar: 'MC', email: 'michael.c@email.com', source: 'LinkedIn', stage: 'Screen', fitScore: 87, timeInStage: '4d', totalTime: '11d', lastActivity: '4h ago', status: 'Active' },
    { id: '10', name: 'Jennifer Lee', avatar: 'JL', email: 'jennifer.l@email.com', source: 'Referral', stage: 'Interview', fitScore: 90, timeInStage: '6d', totalTime: '17d', lastActivity: '12h ago', status: 'Active' },
  ];

  const toggleSelectAll = () => {
    if (selectedCandidates.size === candidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(candidates.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedCandidates);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCandidates(newSelected);
  };

  const sourceColors: Record<string, string> = {
    LinkedIn: 'bg-blue-50 text-blue-700 border-blue-200',
    Referral: 'bg-purple-50 text-purple-700 border-purple-200',
    Internal: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Indeed: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  const statusColors: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700',
    Ghosted: 'bg-slate-100 text-slate-600',
    Unresponsive: 'bg-amber-50 text-amber-700'
  };

  const stageColors: Record<string, string> = {
    Applied: 'bg-slate-50 text-slate-700',
    Screen: 'bg-blue-50 text-blue-700',
    Interview: 'bg-indigo-50 text-indigo-700',
    Offer: 'bg-purple-50 text-purple-700',
    Hired: 'bg-emerald-50 text-emerald-700'
  };

  return (
    <div className="max-w-[1800px] mx-auto">
      {/* Bulk Actions Bar */}
      {selectedCandidates.size > 0 && (
        <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-indigo-900">{selectedCandidates.size} candidate{selectedCandidates.size > 1 ? 's' : ''} selected</span>
            <div className="h-4 w-px bg-indigo-200" />
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors text-indigo-700 text-sm">
              <UserPlus className="size-4" />
              <span>Move Stage</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors text-indigo-700 text-sm">
              <Check className="size-4" />
              <span>Assign Recruiter</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-700 text-sm">
              <X className="size-4" />
              <span>Reject</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors text-indigo-700 text-sm">
              <Archive className="size-4" />
              <span>Archive</span>
            </button>
          </div>
          <button 
            onClick={() => setSelectedCandidates(new Set())}
            className="text-indigo-600 hover:text-indigo-800 text-sm"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.size === candidates.length}
                    onChange={toggleSelectAll}
                    className="size-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-left text-slate-600 text-sm">
                  <button className="flex items-center gap-2 hover:text-slate-900">
                    <span>Candidate</span>
                    <ArrowUpDown className="size-3.5" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-slate-600 text-sm">
                  <button className="flex items-center gap-2 hover:text-slate-900">
                    <span>Email</span>
                    <ArrowUpDown className="size-3.5" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-slate-600 text-sm">
                  <button className="flex items-center gap-2 hover:text-slate-900">
                    <span>Source</span>
                    <ArrowUpDown className="size-3.5" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-slate-600 text-sm">
                  <button className="flex items-center gap-2 hover:text-slate-900">
                    <span>Stage</span>
                    <ArrowUpDown className="size-3.5" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-slate-600 text-sm">
                  <button className="flex items-center gap-2 hover:text-slate-900">
                    <span>AI Fit Score</span>
                    <ArrowUpDown className="size-3.5" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-slate-600 text-sm">
                  <button className="flex items-center gap-2 hover:text-slate-900">
                    <span>Time in Stage</span>
                    <ArrowUpDown className="size-3.5" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-slate-600 text-sm">
                  <button className="flex items-center gap-2 hover:text-slate-900">
                    <span>Total Time</span>
                    <ArrowUpDown className="size-3.5" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-slate-600 text-sm">
                  <button className="flex items-center gap-2 hover:text-slate-900">
                    <span>Last Activity</span>
                    <ArrowUpDown className="size-3.5" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-slate-600 text-sm">Resume</th>
                <th className="px-6 py-4 text-left text-slate-600 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr
                  key={candidate.id}
                  className={`
                    border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer
                    ${selectedCandidates.has(candidate.id) ? 'bg-indigo-50/50' : ''}
                  `}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.has(candidate.id)}
                      onChange={() => toggleSelect(candidate.id)}
                      className="size-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm shrink-0">
                        {candidate.avatar}
                      </div>
                      <span className="text-slate-900">{candidate.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{candidate.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs border ${sourceColors[candidate.source]}`}>
                      {candidate.source}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs ${stageColors[candidate.stage]}`}>
                      {candidate.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[80px]">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              candidate.fitScore >= 90 ? 'bg-emerald-500' :
                              candidate.fitScore >= 80 ? 'bg-indigo-500' :
                              candidate.fitScore >= 70 ? 'bg-blue-500' :
                              'bg-slate-400'
                            }`}
                            style={{ width: `${candidate.fitScore}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-slate-900 min-w-[40px]">{candidate.fitScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{candidate.timeInStage}</td>
                  <td className="px-6 py-4 text-slate-600">{candidate.totalTime}</td>
                  <td className="px-6 py-4 text-slate-500">{candidate.lastActivity}</td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors group">
                      <FileText className="size-4 text-slate-400 group-hover:text-slate-600" />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs ${statusColors[candidate.status]}`}>
                      {candidate.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        <div className="p-6 border-t border-slate-200 text-center">
          <button className="text-indigo-600 hover:text-indigo-700 text-sm">
            Load next 50 candidates →
          </button>
        </div>
      </div>
    </div>
  );
}

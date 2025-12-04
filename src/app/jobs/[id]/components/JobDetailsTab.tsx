import { Edit3, Briefcase, MapPin, DollarSign, FileText, Hash, Globe } from 'lucide-react';

interface JobDetailsTabProps {
  jobData: {
    id: string;
    title: string;
    department: string;
    location: string;
    roleOverview: string;
    compensationBand: string;
    description: string;
    boardStatus: string;
  };
}

export function JobDetailsTab({ jobData }: JobDetailsTabProps) {
  return (
    <div className="max-w-[1000px] mx-auto">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-slate-900 mb-1">Job Information</h2>
          <p className="text-slate-600">Complete details about this role</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
          <Edit3 className="size-4" />
          <span>Edit Job</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Quick Details Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-slate-900 mb-4">Quick Details</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <Briefcase className="size-5" />
              </div>
              <div>
                <div className="text-slate-500 text-sm mb-1">Department</div>
                <div className="text-slate-900">{jobData.department}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <MapPin className="size-5" />
              </div>
              <div>
                <div className="text-slate-500 text-sm mb-1">Location</div>
                <div className="text-slate-900">{jobData.location}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <DollarSign className="size-5" />
              </div>
              <div>
                <div className="text-slate-500 text-sm mb-1">Compensation Band</div>
                <div className="text-slate-900">{jobData.compensationBand}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <Hash className="size-5" />
              </div>
              <div>
                <div className="text-slate-500 text-sm mb-1">Requisition ID</div>
                <div className="text-slate-900">{jobData.id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Overview Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="size-5 text-slate-600" />
            <h3 className="text-slate-900">Role Overview</h3>
          </div>
          <p className="text-slate-700 leading-relaxed">{jobData.roleOverview}</p>
        </div>

        {/* Full Job Description Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-slate-900 mb-4">Full Job Description</h3>
          <div className="text-slate-700 leading-relaxed space-y-4 whitespace-pre-line">
            {jobData.description}
          </div>
        </div>

        {/* Job Board Status Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="size-5 text-slate-600" />
            <h3 className="text-slate-900">Job Board Status</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500" />
            <span className="text-slate-700">{jobData.boardStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

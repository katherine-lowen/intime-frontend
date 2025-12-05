import { FileText } from 'lucide-react';

export function GeneratedPlaceholder() {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-[20px] border-2 border-dashed border-slate-200 overflow-hidden">
      <div className="px-10 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <h2 className="text-slate-400">Your AI-Generated Job Description</h2>
        </div>
        
        <div className="space-y-6 max-w-3xl">
          {/* Placeholder document structure */}
          <div className="space-y-3">
            <div className="h-8 bg-slate-100 rounded-lg w-2/3" />
            <div className="h-4 bg-slate-50 rounded w-full" />
            <div className="h-4 bg-slate-50 rounded w-11/12" />
            <div className="h-4 bg-slate-50 rounded w-10/12" />
          </div>
          
          <div className="space-y-3 pt-4">
            <div className="h-5 bg-slate-100 rounded w-1/4" />
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-slate-200 rounded-full mt-1.5" />
                <div className="h-3 bg-slate-50 rounded flex-1" />
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-slate-200 rounded-full mt-1.5" />
                <div className="h-3 bg-slate-50 rounded flex-1" />
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-slate-200 rounded-full mt-1.5" />
                <div className="h-3 bg-slate-50 rounded w-3/4" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3 pt-4">
            <div className="h-5 bg-slate-100 rounded w-1/4" />
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-slate-200 rounded-full mt-1.5" />
                <div className="h-3 bg-slate-50 rounded flex-1" />
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-slate-200 rounded-full mt-1.5" />
                <div className="h-3 bg-slate-50 rounded flex-1" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Encouragement message */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <p className="text-slate-500 text-center text-sm">
            Fill in the details above and click Generate to see your AI-crafted job description
          </p>
        </div>
      </div>
    </div>
  );
}

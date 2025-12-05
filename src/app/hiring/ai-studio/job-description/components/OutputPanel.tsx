interface OutputPanelProps {
  generatedJD: {
    title: string;
    summary: string;
    responsibilities: string[];
    requirements: string[];
    niceToHave: string[];
    teamStructure: string;
  };
}

export function OutputPanel({ generatedJD }: OutputPanelProps) {
  return (
    <div className="relative">
      {/* AI Generated Badge */}
      <div className="absolute top-8 right-8 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full text-xs border border-indigo-200/50 shadow-sm">
          <div className="relative flex items-center justify-center">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-75" />
          </div>
          <span>AI generated • editable</span>
        </div>
      </div>

      {/* Output Content */}
      <div className="px-10 py-10 max-h-[700px] overflow-y-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-slate-900">Your AI-Generated Job Description</h2>
        </div>
        
        <div className="max-w-3xl space-y-10">
          {/* Title */}
          <div>
            <h1 className="text-slate-900 mb-2">{generatedJD.title}</h1>
          </div>

          {/* Role Summary */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
              <h3 className="text-slate-900">Role Summary</h3>
            </div>
            <p className="text-slate-700 leading-relaxed pl-3">{generatedJD.summary}</p>
          </section>

          {/* Responsibilities */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
              <h3 className="text-slate-900">Responsibilities</h3>
            </div>
            <ul className="space-y-3 pl-3">
              {generatedJD.responsibilities.map((item, index) => (
                <li key={index} className="flex items-start gap-3.5">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="text-slate-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Requirements */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
              <h3 className="text-slate-900">Requirements</h3>
            </div>
            <ul className="space-y-3 pl-3">
              {generatedJD.requirements.map((item, index) => (
                <li key={index} className="flex items-start gap-3.5">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="text-slate-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Nice-to-Haves */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-slate-300 rounded-full" />
              <h3 className="text-slate-700">Nice-to-Haves</h3>
            </div>
            <ul className="space-y-3 pl-3">
              {generatedJD.niceToHave.map((item, index) => (
                <li key={index} className="flex items-start gap-3.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="text-slate-600 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Team / Reporting Structure */}
          <section className="pb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
              <h3 className="text-slate-900">Team &amp; Reporting Structure</h3>
            </div>
            <p className="text-slate-700 leading-relaxed pl-3">{generatedJD.teamStructure}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
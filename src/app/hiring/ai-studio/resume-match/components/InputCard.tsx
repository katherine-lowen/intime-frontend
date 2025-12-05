import { useState, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { Loader2, Sparkles } from 'lucide-react';

interface InputCardProps {
  onSubmit: (data: {
    jobDescription: string;
    candidateNotes: string;
    resume: File | null;
  }) => void;
  isProcessing: boolean;
  selectedJob: string | null;
  onUseSelectedJob: () => void;
}

export function InputCard({ onSubmit, isProcessing, selectedJob, onUseSelectedJob }: InputCardProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [candidateNotes, setCandidateNotes] = useState('');
  const [resume, setResume] = useState<File | null>(null);

  useEffect(() => {
    if (selectedJob) {
      setJobDescription(selectedJob);
    }
  }, [selectedJob]);

  const handleSubmit = () => {
    onSubmit({ jobDescription, candidateNotes, resume });
  };

  const isValid = jobDescription.trim().length > 0 && 
    (candidateNotes.trim().length > 0 || resume !== null);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      {/* Job Description */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-slate-900">
            Job Description
          </label>
          {!selectedJob && (
            <button
              onClick={onUseSelectedJob}
              className="text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Use selected job
            </button>
          )}
        </div>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste or autofill from an existing job posting..."
          className="w-full h-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-900 placeholder:text-slate-400"
        />
        <p className="mt-2 text-slate-500">
          Paste or autofill from an existing job posting.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Left Column - Candidate Notes */}
        <div>
          <label className="block text-slate-900 mb-2">
            Candidate Notes
          </label>
          <textarea
            value={candidateNotes}
            onChange={(e) => setCandidateNotes(e.target.value)}
            placeholder="Add screening notes, observations, or candidate background..."
            className="w-full h-64 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Right Column - Resume Upload */}
        <div>
          <label className="block text-slate-900 mb-2">
            Resume Upload
          </label>
          <FileUpload resume={resume} onFileChange={setResume} />
        </div>
      </div>

      {/* Microcopy */}
      <p className="text-slate-500 mb-6">
        AI will combine both notes and files if provided.
      </p>

      {/* Action Row */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <button
          onClick={handleSubmit}
          disabled={!isValid || isProcessing}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isProcessing ? 'Processing...' : 'Run Resume Match'}
        </button>
        
        <p className="text-slate-400">
          All data stays within Intime. Secure and internal.
        </p>
      </div>
    </div>
  );
}

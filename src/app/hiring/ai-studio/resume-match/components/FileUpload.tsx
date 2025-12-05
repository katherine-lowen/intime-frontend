import { useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface FileUploadProps {
  resume: File | null;
  onFileChange: (file: File | null) => void;
}

export function FileUpload({ resume, onFileChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onFileChange(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  return (
    <div className="h-64">
      {resume ? (
        <div className="h-full border border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="mb-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="text-slate-900">{resume.name}</div>
            <button
              onClick={() => onFileChange(null)}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          
          <p className="text-slate-500">
            {(resume.size / 1024).toFixed(1)} KB
          </p>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="h-full border-2 border-dashed border-slate-200 bg-white rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
        >
          <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
            <Upload className="w-6 h-6 text-indigo-500" />
          </div>
          
          <p className="text-slate-700 mb-1">Drop or browse PDF</p>
          <p className="text-slate-400">Max 10MB</p>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

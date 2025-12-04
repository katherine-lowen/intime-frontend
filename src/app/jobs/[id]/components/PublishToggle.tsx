import { useState } from 'react';

export function PublishToggle() {
  const [isPublished, setIsPublished] = useState(true);

  return (
    <button
      onClick={() => setIsPublished(!isPublished)}
      className={`
        relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all
        ${isPublished 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
        }
      `}
    >
      <div className={`size-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      <span className="text-sm">{isPublished ? 'Published' : 'Draft'}</span>
    </button>
  );
}

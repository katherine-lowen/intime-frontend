interface FilterPillProps {
  label: string;
  count?: number;
  active?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}

export function FilterPill({ label, count, active, removable, onRemove, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm transition-all duration-200
        ${active 
          ? 'bg-[#2C6DF9] text-white shadow-md shadow-blue-100 hover:shadow-lg hover:shadow-blue-200 hover:bg-[#2459d6]' 
          : 'bg-white text-gray-700 border border-gray-200 shadow-sm hover:border-gray-300 hover:bg-gray-50 hover:shadow'
        }
      `}
    >
      <span className="font-medium">{label}</span>
      {count !== undefined && (
        <span className={`text-xs ${active ? 'text-white/90' : 'text-gray-500'}`}>
          {count}
        </span>
      )}
      {removable && (
        <svg 
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="w-3.5 h-3.5 cursor-pointer hover:opacity-70 transition-opacity" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </button>
  );
}
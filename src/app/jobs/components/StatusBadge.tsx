interface StatusBadgeProps {
  status: 'draft' | 'open' | 'paused' | 'closed';
  active: boolean;
  onClick: () => void;
}

const statusConfig = {
  draft: {
    label: 'Draft',
    activeClass: 'bg-gray-100 text-gray-700 border-gray-300',
    inactiveClass: 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
  },
  open: {
    label: 'Open',
    activeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    inactiveClass: 'bg-white text-gray-600 border-gray-200 hover:bg-emerald-50',
  },
  paused: {
    label: 'Paused',
    activeClass: 'bg-amber-100 text-amber-700 border-amber-300',
    inactiveClass: 'bg-white text-gray-600 border-gray-200 hover:bg-amber-50',
  },
  closed: {
    label: 'Closed',
    activeClass: 'bg-red-100 text-red-700 border-red-300',
    inactiveClass: 'bg-white text-gray-600 border-gray-200 hover:bg-red-50',
  },
};

export function StatusBadge({ status, active, onClick }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-5 py-2.5 rounded-full border-2 text-[13px] transition-all ${
        active ? config.activeClass : config.inactiveClass
      }`}
    >
      <span className={`w-2 h-2 rounded-full mr-2.5 ${
        active 
          ? status === 'open' ? 'bg-emerald-500' 
          : status === 'paused' ? 'bg-amber-500'
          : status === 'closed' ? 'bg-red-500'
          : 'bg-gray-500'
          : 'bg-gray-300'
      }`} />
      {config.label}
    </button>
  );
}

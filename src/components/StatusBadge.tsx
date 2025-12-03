interface StatusBadgeProps {
  status: 'Active' | 'Inactive';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === 'Active';
  
  return (
    <span 
      className={`
        inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium
        ${isActive 
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
          : 'bg-gray-100 text-gray-600 border border-gray-200'
        }
      `}
    >
      <span 
        className={`w-1.5 h-1.5 rounded-full mr-2 ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}
      />
      {status}
    </span>
  );
}
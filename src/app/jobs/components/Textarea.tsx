interface TextareaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  helper?: string;
  size?: 'default' | 'large';
}

export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  helper,
  size = 'default',
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {label && (
        <label className="text-[13px] text-gray-700">{label}</label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`px-4 bg-white border border-gray-300/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 resize-none ${
          size === 'large' ? 'py-3.5 text-[15px]' : 'py-3 text-[14px]'
        }`}
      />
      {helper && (
        <span className="text-xs text-gray-500">{helper}</span>
      )}
    </div>
  );
}

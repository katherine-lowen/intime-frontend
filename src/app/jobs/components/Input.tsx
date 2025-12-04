interface InputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  helper?: string;
  size?: 'default' | 'large';
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  helper,
  size = 'default',
}: InputProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[13px] text-gray-700">
        {label}
        {required && <span className="text-indigo-600 ml-1">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`px-4 bg-white border border-gray-300/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 ${
          size === 'large' ? 'py-3.5 text-[15px]' : 'py-3 text-[14px]'
        }`}
      />
      {helper && (
        <span className="text-xs text-gray-500">{helper}</span>
      )}
    </div>
  );
}

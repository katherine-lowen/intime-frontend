import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  icon,
  onClick,
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all';

  const variantStyles = {
    primary:
      'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-indigo-700 disabled:hover:shadow-sm',
    secondary:
      'bg-white text-gray-700 border border-gray-300/80 hover:bg-gray-50 hover:border-gray-400/80 shadow-sm',
    ghost:
      'bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]}`}
    >
      {icon}
      <span className="text-[14px]">{children}</span>
    </button>
  );
}

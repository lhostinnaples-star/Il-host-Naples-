import React from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-[#F5A623] text-[#0f172a] hover:bg-[#e09400] font-bold shadow-lg shadow-[#F5A623]/10',
    secondary: 'border border-[#334155] text-white hover:bg-[#1e293b]',
    outline: 'border border-[#334155] bg-transparent text-white hover:bg-[#1e293b]',
    ghost: 'bg-transparent text-[#94a3b8] hover:bg-white/5 hover:text-white'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5',
    lg: 'px-8 py-3.5 text-lg',
    icon: 'p-2'
  };

  return (
    <button 
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
  return (
    <input 
      className={cn(
        'w-full rounded-xl border border-[#334155] bg-[#1e293b] px-4 py-3 text-sm text-white placeholder:text-[#64748b] outline-none transition-all focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]',
        className
      )}
      {...props}
    />
  );
};

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => {
  return (
    <textarea 
      className={cn(
        'w-full rounded-xl border border-[#334155] bg-[#1e293b] px-4 py-4 text-sm text-white placeholder:text-[#64748b] outline-none transition-all focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] min-h-[120px] resize-none',
        className
      )}
      {...props}
    />
  );
};

export const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, className, ...props }) => {
  return (
    <label className={cn("flex items-center gap-3 cursor-pointer group", className)}>
      <div className="relative flex items-center">
        <input 
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <div className="h-5 w-5 rounded border-2 border-[#334155] bg-transparent transition-all peer-checked:bg-[#F5A623] peer-checked:border-[#F5A623]"></div>
        <svg 
          className="absolute h-3.5 w-3.5 text-black opacity-0 transition-opacity peer-checked:opacity-100 left-0.5 top-0.5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth="4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => {
  return (
    <select 
      className={cn(
        'w-full rounded-xl border border-[#334155] bg-[#1e293b] px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] appearance-none',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className, onClick }) => {
  return (
    <div onClick={onClick} className={cn('premium-card p-6 bg-[#1e293b] border border-[#334155] rounded-[2rem]', className)}>
      {children}
    </div>
  );
};

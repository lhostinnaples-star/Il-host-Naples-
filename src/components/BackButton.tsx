import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export const BackButton: React.FC<{ className?: string, variant?: 'light' | 'dark' | 'solid' }> = ({ className, variant = 'solid' }) => {
  const navigate = useNavigate();

  const variants = {
    light: "bg-white/10 hover:bg-white/20 text-white border-white/10",
    dark: "bg-black/5 hover:bg-black/10 text-neutral-800 border-black/10",
    solid: "bg-[#1e293b] hover:bg-[#0f172a] text-white border-[#1e293b]"
  };

  return (
    <button
      onClick={() => navigate(-1)}
      className={cn(
        "flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold backdrop-blur-md rounded-lg shadow border transition-all z-40",
        variants[variant],
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Back</span>
    </button>
  );
};

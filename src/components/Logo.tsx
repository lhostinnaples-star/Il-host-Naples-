import React from 'react';

interface LogoProps {
  height?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ height = 40, className }) => {
  return (
    <svg 
      viewBox="0 0 240 60" 
      height={height} 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="240" height="60" fill="#0f172a" rx="8" />
      <path d="M15 20 L25 10 L35 20 L35 40 L15 40 Z" fill="#F5A623" />
      <path d="M25 40 L25 30 L30 30 L30 40 Z" fill="#0f172a" />
      <text x="45" y="38" fontFamily="serif" fontSize="24" fontWeight="bold" fill="#F5A623">Il Host</text>
      <text x="115" y="37" fontFamily="sans-serif" fontSize="12" fill="#F5A623" opacity="0.8">in</text>
      <text x="135" y="38" fontFamily="serif" fontSize="24" fontWeight="bold" fill="white">Naples</text>
    </svg>
  );
};

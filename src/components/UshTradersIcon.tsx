import React from 'react';

interface UshTradersIconProps {
  className?: string;
  size?: number;
}

export const UshTradersIcon: React.FC<UshTradersIconProps> = ({
  className = 'w-9 h-9',
  size,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      fill="none"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="ushReactGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id="ushGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      
      {/* Squircle Base */}
      <rect x="8" y="8" width="112" height="112" rx="28" fill="url(#ushReactGrad)" />
      
      {/* Internal rim */}
      <rect x="9.5" y="9.5" width="109" height="109" rx="26.5" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      
      {/* Left Pillar (U) */}
      <path
        d="M34 40 V72 C34 81 41 88 50 88 C59 88 66 81 66 72 V58"
        stroke="#FFFFFF"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Growth Arrow (Traders Arrow) */}
      <path
        d="M62 48 L94 48 M94 48 L94 80 M94 48 L56 86"
        stroke="url(#ushGoldGrad)"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Trading balance node points */}
      <circle cx="34" cy="40" r="5" fill="#FFFFFF" />
      <circle cx="94" cy="48" r="5" fill="#FCD34D" />
      <circle cx="50" cy="88" r="4.5" fill="#10B981" />
      <circle cx="94" cy="80" r="4" fill="#F59E0B" />
    </svg>
  );
};

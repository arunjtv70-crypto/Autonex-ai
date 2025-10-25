import React from 'react';

const AutonexBrand: React.FC<{ className?: string, isDark?: boolean }> = ({ className, isDark = true }) => (
  <svg 
    viewBox="0 0 320 100" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg"
    fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif"
  >
    <defs>
      <linearGradient id="autonex-logo-green-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#6ee7b7" />
      </linearGradient>
       <linearGradient id="autonex-text-gradient-dark" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#a7f3d0" />
        <stop offset="100%" stopColor="#d1fae5" />
      </linearGradient>
       <linearGradient id="autonex-text-gradient-light" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#047857" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <filter id="autonex-logo-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
      </filter>
    </defs>
    
    <g transform="translate(5, 0) scale(0.9)" filter="url(#autonex-logo-shadow)">
      {/* Green Part - A thick arc */}
      <path 
        d="M 85,50 A 35,35 0 1 1 50,15"
        fill="none"
        stroke="url(#autonex-logo-green-gradient)"
        strokeWidth="20"
        strokeLinecap="round"
      />
      {/* Dark Part - An S-like curve */}
      <path 
        d="M 35,68 C 55,55 55,40 38,28"
        fill="none"
        stroke={isDark ? "#1f2937" : "#4b5563"}
        strokeWidth="22"
        strokeLinecap="round"
      />
      {/* White Part - Highlight on the S-curve */}
      <path 
        d="M 40,63 C 50,55 55,45 42,32"
        fill="none"
        stroke={isDark ? "#e5e7eb" : "#f9fafb"}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </g>

    <text 
      x="195" 
      y="62" 
      fontSize="40" 
      fontWeight="600" 
      letterSpacing="2"
      fill={`url(#autonex-text-gradient-${isDark ? 'dark' : 'light'})`}
      textAnchor="middle"
      filter="url(#autonex-logo-shadow)"
    >
      AUTONEX
    </text>
  </svg>
);

export default AutonexBrand;
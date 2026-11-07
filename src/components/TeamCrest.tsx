import React, { useState } from 'react';

interface TeamCrestProps {
  crest: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TeamCrest: React.FC<TeamCrestProps> = ({ crest, name, size = 'md' }) => {
  const [imageError, setImageError] = useState(false);

  const dimensions = {
    sm: 'w-6 h-6 text-[9px]',
    md: 'w-8 h-8 text-[10px]',
    lg: 'w-12 h-12 text-xs',
  }[size];

  // If real image URL from API-Sports
  if (crest && (crest.startsWith('http://') || crest.startsWith('https://')) && !imageError) {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 select-none transition-transform hover:scale-105 ${dimensions}`}
        title={name}
        aria-label={`${name} crest`}
      >
        <img
          src={crest}
          alt={name}
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain drop-shadow-sm"
          loading="lazy"
        />
      </div>
    );
  }

  // Parse shield descriptor: "shield:primaryColor:secondaryColor:ABC" or generate fallback
  let primary = '#3b82f6';
  let secondary = '#1e293b';
  let abbr = name.slice(0, 3).toUpperCase();

  if (crest && crest.startsWith('shield:')) {
    const parts = crest.split(':');
    if (parts.length >= 4) {
      primary = parts[1] || primary;
      secondary = parts[2] || secondary;
      abbr = parts[3] || abbr;
    }
  } else {
    // Generate deterministic colors from name hash
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      ['#ef4444', '#7f1d1d'],
      ['#3b82f6', '#1e3a8a'],
      ['#10b981', '#064e3b'],
      ['#f59e0b', '#78350f'],
      ['#8b5cf6', '#4c1d95'],
      ['#06b6d4', '#164e63'],
      ['#ec4899', '#831843'],
    ];
    const picked = colors[Math.abs(hash) % colors.length];
    primary = picked[0];
    secondary = picked[1];
  }

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 font-bold select-none transition-transform hover:scale-105 ${dimensions}`}
      title={name}
      aria-label={`${name} crest`}
    >
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`grad-${primary.replace('#', '')}-${secondary.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primary} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
        </defs>
        {/* Shield shape */}
        <path
          d="M 50 4 Q 85 4 92 25 Q 95 75 50 116 Q 5 75 8 25 Q 15 4 50 4 Z"
          fill={`url(#grad-${primary.replace('#', '')}-${secondary.replace('#', '')})`}
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="4"
        />
        {/* Inner heraldic chevron line */}
        <path
          d="M 16 35 L 50 65 L 84 35"
          fill="none"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="3"
        />
      </svg>
      <span className="absolute font-mono font-extrabold tracking-tighter text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {abbr}
      </span>
    </div>
  );
};

export function ClockAvatar() {
  return (
    <div className="relative inline-block">
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-30 blur-2xl"
        style={{
          background: 'linear-gradient(135deg, #2C6DF9 0%, #3B82F6 50%, #6366F1 100%)'
        }}
      />
      
      {/* Avatar container */}
      <div 
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-transform hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #2C6DF9 0%, #3B82F6 100%)'
        }}
      >
        {/* Clock face */}
        <svg 
          width="32" 
          height="32" 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative"
        >
          {/* Outer clock circle */}
          <circle 
            cx="16" 
            cy="16" 
            r="12" 
            stroke="white" 
            strokeWidth="2" 
            fill="rgba(255,255,255,0.1)"
          />
          
          {/* Center dot */}
          <circle 
            cx="16" 
            cy="16" 
            r="1.5" 
            fill="white"
          />
          
          {/* Hour hand (pointing to 10) */}
          <line 
            x1="16" 
            y1="16" 
            x2="16" 
            y2="10" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          
          {/* Minute hand (pointing to 2) */}
          <line 
            x1="16" 
            y1="16" 
            x2="21" 
            y2="14" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          
          {/* AI spark accent - top right */}
          <g className="animate-pulse">
            <path 
              d="M 24 8 L 25 10 L 27 9 L 26 11 L 28 12 L 26 12.5 L 27 14.5 L 25 13 L 24 15 L 23.5 13 L 21.5 14 L 22.5 12 L 20.5 11 L 22.5 10.5 L 21.5 8.5 L 23.5 10 Z" 
              fill="white"
              opacity="0.9"
            />
          </g>
          
          {/* Clock tick marks */}
          <circle cx="16" cy="6" r="0.8" fill="white" opacity="0.6" />
          <circle cx="16" cy="26" r="0.8" fill="white" opacity="0.6" />
          <circle cx="26" cy="16" r="0.8" fill="white" opacity="0.6" />
          <circle cx="6" cy="16" r="0.8" fill="white" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}

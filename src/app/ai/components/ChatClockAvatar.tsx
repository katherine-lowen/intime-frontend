export function ChatClockAvatar() {
  return (
    <div className="group relative inline-block">
      {/* Floating glow */}
      <div 
        className="absolute inset-0 scale-125 rounded-3xl opacity-30 blur-2xl transition-all group-hover:scale-150 group-hover:opacity-50"
        style={{
          background: 'linear-gradient(135deg, #2C6DF9 0%, #3B82F6 100%)',
          animation: 'pulse-glow 3s ease-in-out infinite',
        }}
      />

      {/* Avatar container with floating animation */}
      <div 
        className="relative flex h-16 w-16 items-center justify-center rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl transition-all group-hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, rgba(44,109,249,0.3) 0%, rgba(59,130,246,0.3) 100%)',
          animation: 'float-gentle 4s ease-in-out infinite',
        }}
      >
        {/* Inner shine */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-40"
          style={{
            background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 60%)',
          }}
        />

        {/* Clock SVG */}
        <svg 
          width="36" 
          height="36" 
          viewBox="0 0 36 36" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative"
        >
          {/* Main clock circle */}
          <circle 
            cx="18" 
            cy="18" 
            r="13" 
            stroke="white" 
            strokeWidth="2" 
            fill="rgba(255,255,255,0.08)"
            opacity="0.9"
          />

          {/* Clock markers */}
          <circle cx="18" cy="7" r="1" fill="white" opacity="0.7" />
          <circle cx="18" cy="29" r="1" fill="white" opacity="0.7" />
          <circle cx="29" cy="18" r="1" fill="white" opacity="0.7" />
          <circle cx="7" cy="18" r="1" fill="white" opacity="0.7" />

          {/* Center dot */}
          <circle 
            cx="18" 
            cy="18" 
            r="1.5" 
            fill="white"
          />

          {/* Hour hand */}
          <line 
            x1="18" 
            y1="18" 
            x2="18" 
            y2="11" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round"
          />

          {/* Minute hand - with subtle rotation */}
          <g style={{ transformOrigin: '18px 18px', animation: 'rotate-slow 40s linear infinite' }}>
            <line 
              x1="18" 
              y1="18" 
              x2="24" 
              y2="15" 
              stroke="white" 
              strokeWidth="1.5" 
              strokeLinecap="round"
              opacity="0.9"
            />
          </g>

          {/* AI sparkle accent */}
          <g className="animate-pulse">
            <circle cx="27" cy="9" r="1.5" fill="#EC4899" opacity="0.9" />
            <circle cx="29" cy="7" r="1" fill="#7C3AED" opacity="0.7" />
          </g>
        </svg>

        {/* Floating sparkle */}
        <div 
          className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-gradient-to-br from-blue-300 to-indigo-400 shadow-lg"
          style={{ animation: 'float-sparkle 2.5s ease-in-out infinite' }}
        />
      </div>

      {/* Soft shadow - hovering effect */}
      <div 
        className="absolute -bottom-4 left-1/2 h-2 w-12 -translate-x-1/2 rounded-full opacity-30 blur-lg transition-all group-hover:w-16 group-hover:opacity-50"
        style={{
          background: 'radial-gradient(ellipse, rgba(44,109,249,0.8) 0%, transparent 70%)',
        }}
      />

      {/* Animations */}
      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes float-sparkle {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-2px, -4px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

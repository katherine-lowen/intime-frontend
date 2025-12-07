export function HeroClockAvatar() {
  return (
    <div className="group relative">
      {/* Ambient glow - large */}
      <div 
        className="absolute inset-0 scale-150 rounded-full opacity-40 blur-3xl transition-opacity group-hover:opacity-60"
        style={{
          background: 'linear-gradient(135deg, #2C6DF9 0%, #4F46E5 50%, #7C3AED 100%)',
        }}
      />

      {/* Outer halo ring */}
      <div 
        className="absolute inset-0 -m-4 rounded-full border border-white/10 transition-all group-hover:scale-105 group-hover:border-white/20"
        style={{
          background: 'radial-gradient(circle, transparent 70%, rgba(79,70,229,0.1) 100%)',
          animation: 'spin-slow 20s linear infinite',
        }}
      />

      {/* Main avatar container */}
      <div 
        className="relative flex h-36 w-36 items-center justify-center rounded-[28px] border border-white/20 shadow-2xl backdrop-blur-xl transition-all group-hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, rgba(44,109,249,0.2) 0%, rgba(79,70,229,0.2) 50%, rgba(124,58,237,0.2) 100%)',
        }}
      >
        {/* Inner gradient glow */}
        <div 
          className="absolute inset-0 rounded-[28px] opacity-50"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)',
          }}
        />

        {/* Clock SVG */}
        <svg 
          width="80" 
          height="80" 
          viewBox="0 0 80 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative"
        >
          {/* Outer glow ring */}
          <circle 
            cx="40" 
            cy="40" 
            r="35" 
            stroke="url(#gradient-outer)" 
            strokeWidth="1" 
            opacity="0.3"
          />
          
          {/* Main clock circle */}
          <circle 
            cx="40" 
            cy="40" 
            r="28" 
            stroke="url(#gradient-main)" 
            strokeWidth="2.5" 
            fill="rgba(255,255,255,0.05)"
          />

          {/* Clock face markers - 12, 3, 6, 9 */}
          <circle cx="40" cy="15" r="2" fill="white" opacity="0.8" />
          <circle cx="40" cy="65" r="2" fill="white" opacity="0.8" />
          <circle cx="65" cy="40" r="2" fill="white" opacity="0.8" />
          <circle cx="15" cy="40" r="2" fill="white" opacity="0.8" />

          {/* Secondary markers */}
          <circle cx="56" cy="24" r="1.5" fill="white" opacity="0.5" />
          <circle cx="24" cy="24" r="1.5" fill="white" opacity="0.5" />
          <circle cx="56" cy="56" r="1.5" fill="white" opacity="0.5" />
          <circle cx="24" cy="56" r="1.5" fill="white" opacity="0.5" />

          {/* Center dot */}
          <circle 
            cx="40" 
            cy="40" 
            r="3" 
            fill="white"
            filter="url(#glow)"
          />

          {/* Hour hand - pointing to 10 */}
          <line 
            x1="40" 
            y1="40" 
            x2="40" 
            y2="22" 
            stroke="white" 
            strokeWidth="3" 
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))',
            }}
          />

          {/* Minute hand - pointing to 2 - with rotation animation */}
          <g style={{ transformOrigin: '40px 40px', animation: 'rotate-minute 60s linear infinite' }}>
            <line 
              x1="40" 
              y1="40" 
              x2="58" 
              y2="32" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round"
              opacity="0.9"
            />
          </g>

          {/* AI spark particles - animated */}
          <g className="animate-pulse" style={{ transformOrigin: '60px 20px' }}>
            <circle cx="60" cy="20" r="2" fill="#EC4899" opacity="0.9" filter="url(#glow)" />
            <circle cx="64" cy="18" r="1.5" fill="#7C3AED" opacity="0.7" filter="url(#glow)" />
          </g>

          <g className="animate-pulse" style={{ animationDelay: '0.5s', transformOrigin: '20px 60px' }}>
            <circle cx="20" cy="60" r="1.8" fill="#2C6DF9" opacity="0.8" filter="url(#glow)" />
            <circle cx="16" cy="58" r="1.2" fill="#4F46E5" opacity="0.6" filter="url(#glow)" />
          </g>

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient-outer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2C6DF9" />
              <stop offset="50%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="gradient-main" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Floating sparkles around avatar */}
        <div 
          className="absolute -right-2 -top-2 h-3 w-3 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 shadow-lg"
          style={{ animation: 'float 3s ease-in-out infinite' }}
        />
        <div 
          className="absolute -bottom-3 -left-3 h-2 w-2 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg"
          style={{ animation: 'float 4s ease-in-out infinite', animationDelay: '0.5s' }}
        />
      </div>

      {/* Soft shadow below - hovering effect */}
      <div 
        className="absolute -bottom-8 left-1/2 h-4 w-24 -translate-x-1/2 rounded-full opacity-40 blur-xl transition-all group-hover:w-28 group-hover:opacity-60"
        style={{
          background: 'radial-gradient(ellipse, rgba(79,70,229,0.6) 0%, transparent 70%)',
        }}
      />

      {/* Animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotate-minute {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

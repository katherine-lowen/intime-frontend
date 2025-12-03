export function BackgroundEffects() {
  return (
    <>
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
      
      {/* Subtle color wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-transparent to-purple-950/20" />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      
      {/* Floating orbs - darker, more subtle */}
      <div className="absolute top-20 left-[10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-40 right-[15%] w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 left-[20%] w-72 h-72 bg-violet-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
      
      {/* Neural pattern overlay - very subtle */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(139 92 246) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />
      
      {/* Noise texture for depth */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
      }} />
    </>
  );
}
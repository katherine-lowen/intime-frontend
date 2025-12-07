export function VolumetricLight() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Main volumetric light cone - behind hero */}
      <div 
        className="absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: '800px',
          height: '1200px',
          background: 'linear-gradient(180deg, rgba(79,70,229,0.08) 0%, rgba(79,70,229,0.04) 40%, transparent 100%)',
          clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
          filter: 'blur(40px)',
          opacity: 0.6,
        }}
      />

      {/* Secondary light cone - angled */}
      <div 
        className="absolute left-[30%] top-0"
        style={{
          width: '600px',
          height: '900px',
          background: 'linear-gradient(160deg, rgba(44,109,249,0.06) 0%, rgba(44,109,249,0.02) 50%, transparent 100%)',
          clipPath: 'polygon(30% 0%, 50% 0%, 90% 100%, 10% 100%)',
          filter: 'blur(50px)',
          opacity: 0.5,
          transform: 'rotate(-5deg)',
        }}
      />

      {/* Accent light beam - right side */}
      <div 
        className="absolute right-[20%] top-0"
        style={{
          width: '400px',
          height: '800px',
          background: 'linear-gradient(190deg, rgba(124,58,237,0.05) 0%, transparent 60%)',
          clipPath: 'polygon(45% 0%, 55% 0%, 80% 100%, 20% 100%)',
          filter: 'blur(30px)',
          opacity: 0.4,
          transform: 'rotate(10deg)',
        }}
      />

      {/* Ambient atmospheric layers */}
      <div 
        className="absolute left-0 top-[10%] h-[500px] w-full opacity-20"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
    </div>
  );
}

export function FloatingParticles() {
  return (
    <div className="pointer-events-none fixed inset-0">
      {/* Particle 1 - top left */}
      <div 
        className="absolute left-[15%] top-[20%] h-2 w-2 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 opacity-60 shadow-lg"
        style={{
          animation: 'particle-float-1 8s ease-in-out infinite',
          filter: 'blur(0.5px)',
        }}
      />

      {/* Particle 2 - top right */}
      <div 
        className="absolute right-[20%] top-[25%] h-1.5 w-1.5 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 opacity-50 shadow-lg"
        style={{
          animation: 'particle-float-2 10s ease-in-out infinite',
          animationDelay: '1s',
          filter: 'blur(0.5px)',
        }}
      />

      {/* Particle 3 - middle left */}
      <div 
        className="absolute left-[25%] top-[45%] h-1 w-1 rounded-full bg-gradient-to-br from-indigo-300 to-blue-400 opacity-70 shadow-md"
        style={{
          animation: 'particle-float-3 12s ease-in-out infinite',
          animationDelay: '2s',
          filter: 'blur(0.5px)',
        }}
      />

      {/* Particle 4 - center right */}
      <div 
        className="absolute right-[15%] top-[50%] h-2.5 w-2.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-40 shadow-lg"
        style={{
          animation: 'particle-float-4 9s ease-in-out infinite',
          animationDelay: '3s',
          filter: 'blur(1px)',
        }}
      />

      {/* Glint - sparkling effect near hero */}
      <div 
        className="absolute left-1/2 top-[15%] h-1 w-1 rounded-full bg-white opacity-80 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        style={{
          animation: 'glint 4s ease-in-out infinite',
          animationDelay: '0.5s',
        }}
      />

      <div 
        className="absolute left-[55%] top-[18%] h-1 w-1 rounded-full bg-white opacity-60 shadow-[0_0_6px_rgba(255,255,255,0.6)]"
        style={{
          animation: 'glint 5s ease-in-out infinite',
          animationDelay: '2s',
        }}
      />

      <style>{`
        @keyframes particle-float-1 {
          0%, 100% { transform: translate(0, 0); opacity: 0.6; }
          25% { transform: translate(10px, -20px); opacity: 0.8; }
          50% { transform: translate(-5px, -30px); opacity: 0.4; }
          75% { transform: translate(15px, -15px); opacity: 0.7; }
        }

        @keyframes particle-float-2 {
          0%, 100% { transform: translate(0, 0); opacity: 0.5; }
          30% { transform: translate(-15px, 25px); opacity: 0.7; }
          60% { transform: translate(10px, 15px); opacity: 0.3; }
        }

        @keyframes particle-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          33% { transform: translate(20px, -10px) scale(1.2); opacity: 0.9; }
          66% { transform: translate(-10px, 20px) scale(0.8); opacity: 0.5; }
        }

        @keyframes particle-float-4 {
          0%, 100% { transform: translate(0, 0); opacity: 0.4; }
          40% { transform: translate(-20px, -25px); opacity: 0.6; }
          80% { transform: translate(5px, -10px); opacity: 0.2; }
        }

        @keyframes glint {
          0%, 100% { opacity: 0; transform: scale(0); }
          10% { opacity: 1; transform: scale(1); }
          20%, 90% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

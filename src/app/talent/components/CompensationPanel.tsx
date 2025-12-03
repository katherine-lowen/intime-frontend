import { DollarSign, Sparkles } from 'lucide-react';

export function CompensationPanel() {
  return (
    <div
      className="bg-white rounded-xl border border-[#E8EAED] p-8 shadow-sm h-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2C6DF905 0%, #1F5EE608 100%)',
      }}
    >
      {/* Decorative background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #2C6DF9 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #2C6DF920 0%, #1F5EE615 100%)',
            }}
          >
            <DollarSign className="w-7 h-7 text-[#2C6DF9]" />
          </div>
          <Sparkles className="w-5 h-5 text-[#2C6DF9]" />
        </div>

        <h3 className="text-[#0F1419] mb-3">Compensation Bands</h3>
        
        <p className="text-sm text-[#5E6C84] leading-relaxed mb-6">
          Define salary ranges by role, level, and location. Built-in benchmarking against market data to ensure competitive and equitable compensation structures.
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-[#0F1419]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2C6DF9] mr-2" />
            Market benchmarking
          </div>
          <div className="flex items-center text-sm text-[#0F1419]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2C6DF9] mr-2" />
            Role-level banding
          </div>
          <div className="flex items-center text-sm text-[#0F1419]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2C6DF9] mr-2" />
            Equity calculator
          </div>
        </div>

        <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#2C6DF9]/10 to-[#1F5EE6]/10 border border-[#2C6DF9]/20 text-sm text-[#2C6DF9]">
          Roadmap – In design
        </div>
      </div>
    </div>
  );
}

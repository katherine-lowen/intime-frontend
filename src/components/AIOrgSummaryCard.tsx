import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function AIOrgSummaryCard() {
  const insights = [
    { 
      type: 'positive', 
      icon: TrendingUp, 
      title: 'Growth on Track',
      text: 'Headcount growth is on track with Q4 targets',
      metric: '+12 hires',
      color: '#68D391',
      bgColor: '#F0FDF4',
      sparkline: [65, 68, 72, 75, 78, 82, 87]
    },
    { 
      type: 'action', 
      icon: AlertCircle, 
      title: 'Action Required',
      text: '7 performance reviews due this week',
      metric: '7 pending',
      color: '#F6C853',
      bgColor: '#FFFBEB',
      sparkline: null
    },
    { 
      type: 'positive', 
      icon: CheckCircle2, 
      title: 'Onboarding Success',
      text: 'Onboarding completion rate improved by 12%',
      metric: '+12%',
      color: '#7A5CFA',
      bgColor: '#F5F3FF',
      sparkline: [58, 62, 65, 71, 76, 82, 88]
    },
  ];

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(122, 92, 250, 0.15)' }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden bg-white border border-[#E9D5FF] rounded-xl shadow-[0_2px_8px_rgba(122,92,250,0.08)]"
    >
      {/* Ambient Glow Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7A5CFA]/10 via-[#A78BFA]/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#A78BFA]/10 to-transparent rounded-full blur-2xl"></div>

      {/* Decorative sparkles */}
      <div className="absolute top-8 right-12 text-xl opacity-10">✨</div>
      <div className="absolute bottom-16 right-8 text-lg opacity-10">⚡</div>

      {/* Premium Header Bar */}
      <div className="relative bg-gradient-to-r from-[#F5F3FF] via-[#FAE8FF] to-[#F5F3FF] border-b border-[#E9D5FF] px-7 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* AI Icon with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7A5CFA] to-[#A78BFA] rounded-xl blur-md opacity-60"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-[#7A5CFA] to-[#A78BFA] rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-[#0F1419] flex items-center gap-2">
                AI Org Summary
                <Zap className="w-4 h-4 text-[#7A5CFA]" />
              </h2>
              <p className="text-[#5E6C84] text-sm">Powered by Intime Intelligence</p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm text-[#7A5CFA] rounded-full border border-[#E9D5FF] shadow-sm">
            Updated 2h ago
          </div>
        </div>
      </div>

      <div className="relative p-7">
        {/* Hero Summary Block */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 p-6 bg-gradient-to-br from-[#F5F3FF] via-white to-[#FAE8FF] rounded-2xl border border-[#E9D5FF] relative overflow-hidden"
        >
          {/* Decorative pattern */}
          <div className="absolute top-0 right-0 opacity-5">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="10" cy="10" r="2" fill="#7A5CFA" />
              <circle cx="30" cy="10" r="2" fill="#7A5CFA" />
              <circle cx="50" cy="10" r="2" fill="#7A5CFA" />
              <circle cx="70" cy="10" r="2" fill="#7A5CFA" />
              <circle cx="10" cy="30" r="2" fill="#7A5CFA" />
              <circle cx="30" cy="30" r="2" fill="#7A5CFA" />
              <circle cx="50" cy="30" r="2" fill="#7A5CFA" />
              <circle cx="70" cy="30" r="2" fill="#7A5CFA" />
              <circle cx="10" cy="50" r="2" fill="#7A5CFA" />
              <circle cx="30" cy="50" r="2" fill="#7A5CFA" />
              <circle cx="50" cy="50" r="2" fill="#7A5CFA" />
              <circle cx="70" cy="50" r="2" fill="#7A5CFA" />
            </svg>
          </div>

          <div className="relative">
            <div className="flex items-start gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#7A5CFA] mt-0.5 flex-shrink-0" />
              <h3 className="text-[#0F1419]">Executive Summary</h3>
            </div>
            <div className="space-y-3 text-[#0F1419] leading-relaxed">
              <p>
                <strong>Your organization is performing well this week.</strong> Headcount is stable with 12 new hires in the pipeline across Engineering and Product teams.
              </p>
              <p>
                Team coverage is healthy across most departments (87% overall), though Design may need attention next week due to planned leave.
              </p>
              <p className="text-[#5E6C84]">
                📊 Key metrics trending positively with onboarding completion up 12% and employee satisfaction maintaining strong scores.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Key Insights - Smart Tiles */}
        <div className="space-y-3 mb-7">
          <h3 className="text-[#0F1419] flex items-center gap-2">
            Key Insights
            <span className="px-2 py-0.5 bg-[#F5F3FF] text-[#7A5CFA] rounded-full text-xs">
              AI-powered
            </span>
          </h3>
          
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="group relative flex items-center gap-4 p-4 rounded-xl border border-[#E6E8EC] bg-white hover:border-[#7A5CFA]/30 hover:shadow-md transition-all"
              >
                {/* Icon */}
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border"
                  style={{ 
                    backgroundColor: insight.bgColor,
                    borderColor: insight.color + '40'
                  }}
                >
                  <insight.icon className="w-5 h-5" style={{ color: insight.color }} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#0F1419]">{insight.title}</span>
                    <span 
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ 
                        backgroundColor: insight.bgColor,
                        color: insight.color
                      }}
                    >
                      {insight.metric}
                    </span>
                  </div>
                  <p className="text-[#5E6C84] text-sm">{insight.text}</p>
                </div>

                {/* Sparkline (if available) */}
                {insight.sparkline && (
                  <div className="hidden lg:block">
                    <svg width="80" height="32" viewBox="0 0 80 32" className="opacity-60">
                      <path
                        d={`M ${insight.sparkline.map((val, i) => `${i * 13},${32 - (val / 100) * 32}`).join(' L ')}`}
                        fill="none"
                        stroke={insight.color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Dots */}
                      {insight.sparkline.map((val, i) => (
                        <circle
                          key={i}
                          cx={i * 13}
                          cy={32 - (val / 100) * 32}
                          r="2"
                          fill={insight.color}
                        />
                      ))}
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Premium Action Bar */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-6 py-4 bg-gradient-to-r from-[#7A5CFA] via-[#8B5CF6] to-[#A78BFA] text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          
          <Sparkles className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Get Detailed Analysis</span>
          
          {/* Floating stars */}
          <motion.div
            className="absolute top-1 right-4 text-xs"
            animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  );
}

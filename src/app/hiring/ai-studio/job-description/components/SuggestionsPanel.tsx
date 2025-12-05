import { Lightbulb, Sparkles, Code, Briefcase, TrendingUp, CheckCircle2 } from 'lucide-react';

interface SuggestionsPanelProps {
  onSelectPrompt: (prompt: string) => void;
}

const prompts = [
  {
    title: 'Software Engineer',
    description: 'Full-stack engineer for product development',
    icon: Code,
    prompt: 'We need a full-stack software engineer to build and maintain our web applications. The role involves working with React, Node.js, and PostgreSQL. Should collaborate with product and design teams, write clean code, and participate in code reviews.'
  },
  {
    title: 'Product Manager',
    description: 'PM to drive product roadmap and strategy',
    icon: Briefcase,
    prompt: 'Looking for a Product Manager to own the product roadmap and work cross-functionally with engineering, design, and sales. Responsibilities include defining features, prioritizing backlogs, analyzing metrics, and communicating with stakeholders.'
  },
  {
    title: 'Sales Lead',
    description: 'Lead generation and close enterprise deals',
    icon: TrendingUp,
    prompt: 'Seeking a Sales Lead to drive revenue growth through enterprise sales. Will manage the full sales cycle, build relationships with C-level executives, forecast pipeline, and mentor junior sales reps. Experience with SaaS sales required.'
  }
];

const tips = [
  'Be specific about technologies, tools, or methodologies',
  'Include details about team size and reporting structure',
  'Mention company stage and growth trajectory',
  'Describe the impact this role will have'
];

export function SuggestionsPanel({ onSelectPrompt }: SuggestionsPanelProps) {
  return (
    <div className="hidden lg:block w-[340px] flex-shrink-0">
      <div className="sticky top-8 space-y-6">
        {/* Prebuilt Prompts */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[20px] border border-slate-200/80 shadow-lg shadow-slate-200/30 p-7">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-slate-900">Quick Start</h3>
          </div>
          
          <div className="space-y-3">
            {prompts.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => onSelectPrompt(item.prompt)}
                  className="w-full text-left p-4 bg-gradient-to-br from-slate-50 to-white hover:from-indigo-50 hover:to-purple-50/30 rounded-xl border border-slate-200/50 hover:border-indigo-300/50 transition-all group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-slate-200/50 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all flex-shrink-0">
                      <IconComponent className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-900 text-sm mb-1 group-hover:text-indigo-700 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-slate-500 text-xs leading-relaxed">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[20px] p-7 shadow-lg shadow-indigo-500/20 overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          
          <div className="relative">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-white">Tips for Better JDs</h3>
            </div>
            
            <ul className="space-y-3.5">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-200" />
                  </div>
                  <span className="text-white/95 text-sm leading-relaxed">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
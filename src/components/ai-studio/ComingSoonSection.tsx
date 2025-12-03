import { ComingSoonCard } from './ComingSoonCard';
import { Search, MessageSquare, Heart, DollarSign } from 'lucide-react';

const comingSoonTools = [
  {
    icon: Search,
    title: 'AI sourcing assistant',
    description: 'Search talent pools with natural language and get ranked matches based on skills, experience, and culture fit.',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    icon: MessageSquare,
    title: 'AI interview question generator',
    description: 'Generate tailored interview questions based on role requirements, candidate background, and competency frameworks.',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    icon: Heart,
    title: 'AI culture add score',
    description: 'Evaluate how candidates complement and enhance your existing team culture using behavioral signals.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: DollarSign,
    title: 'AI compensation guidance',
    description: 'Get real-time market compensation recommendations based on role, location, experience, and equity considerations.',
    gradient: 'from-green-500 to-emerald-500'
  }
];

export function ComingSoonSection() {
  return (
    <section className="mb-24">
      {/* Section header */}
      <div className="mb-12">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-12" />
        
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-4xl text-white">Coming Soon to Intime AI Studio</h2>
            <span className="px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs text-indigo-300">
              Q1 2025
            </span>
          </div>
          <p className="text-lg text-gray-400 leading-relaxed">
            We're expanding AI Studio with powerful new workflows. Early access available for beta testers.
          </p>
        </div>
      </div>

      {/* Coming soon grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {comingSoonTools.map((tool, index) => (
          <ComingSoonCard key={index} {...tool} />
        ))}
      </div>
    </section>
  );
}
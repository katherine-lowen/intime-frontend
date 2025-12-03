import React from 'react';
import { Plus, Briefcase, Users, Calendar, Target } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="glass-surface rounded-3xl p-10 shadow-glass texture-overlay relative overflow-hidden group">
      {/* Subtle animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] via-transparent to-purple-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative space-y-10">
        {/* Main Content */}
        <div className="space-y-6">
          <h1 className="text-slate-900 text-5xl tracking-tight leading-tight max-w-4xl">
            One place for people, time, and hiring health.
          </h1>
          <p className="text-slate-600 text-xl leading-relaxed max-w-3xl">
            A unified hub for employees, hiring, time-aware events, and intelligent insights—scaled across your entire organization.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-5">
          <button className="btn-gradient-premium inline-flex items-center gap-3 px-7 py-4 text-white rounded-2xl group/btn">
            <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-300" />
            <span className="font-medium">Add first employee</span>
          </button>
          
          <button className="inline-flex items-center gap-3 px-7 py-4 glass-frost rounded-2xl hover:bg-white/70 transition-all shadow-glass hover:shadow-glass-lg hover:-translate-y-1 group/btn border border-white/60">
            <Briefcase className="w-5 h-5 text-slate-700 group-hover/btn:scale-110 transition-transform" />
            <span className="font-medium text-slate-700">Create a role</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-4">
          <button className="pill-premium group/pill inline-flex items-center gap-2.5 px-5 py-3 glass-frost rounded-full hover:bg-white/80 transition-all shadow-sm hover:shadow-glass hover:-translate-y-0.5 border border-blue-200/40">
            <Users className="w-4 h-4 text-blue-600 group-hover/pill:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-700">Employees & teams</span>
          </button>
          
          <button className="pill-premium group/pill inline-flex items-center gap-2.5 px-5 py-3 glass-frost rounded-full hover:bg-white/80 transition-all shadow-sm hover:shadow-glass hover:-translate-y-0.5 border border-purple-200/40">
            <Calendar className="w-4 h-4 text-purple-600 group-hover/pill:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-700">Events – Time off, hiring, changes</span>
          </button>
          
          <button className="pill-premium group/pill inline-flex items-center gap-2.5 px-5 py-3 glass-frost rounded-full hover:bg-white/80 transition-all shadow-sm hover:shadow-glass hover:-translate-y-0.5 border border-emerald-200/40">
            <Target className="w-4 h-4 text-emerald-600 group-hover/pill:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-700">AI – Narrative insights</span>
          </button>
        </div>
      </div>
    </div>
  );
}

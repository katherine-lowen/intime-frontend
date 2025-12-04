"use client";

import { useState } from 'react';
import { TrendingUp, Clock, Award, Sparkles, FileText, Check, X } from 'lucide-react';

interface AIInsightsTabProps {
  jobId: string;
  viewMode: 'insights' | 'triage';
}

export function AIInsightsTab({ jobId, viewMode }: AIInsightsTabProps) {
  if (viewMode === 'triage') {
    return <AITriageView />;
  }

  const candidates = [
    { id: '1', name: 'Sarah Chen', stage: 'Applied', score: 94, timeInStage: '2 days', source: 'LinkedIn', avatar: 'SC', email: 'sarah.chen@email.com' },
    { id: '2', name: 'Robert Taylor', stage: 'Offer', score: 91, timeInStage: '3 days', source: 'Referral', avatar: 'RT', email: 'robert.t@email.com' },
    { id: '3', name: 'Lisa Anderson', stage: 'Interview', score: 88, timeInStage: '5 days', source: 'LinkedIn', avatar: 'LA', email: 'lisa.a@email.com' },
    { id: '4', name: 'James Wilson', stage: 'Interview', score: 85, timeInStage: '12 days', source: 'Referral', avatar: 'JW', email: 'james.w@email.com' },
    { id: '5', name: 'David Kim', stage: 'Screen', score: 82, timeInStage: '7 days', source: 'LinkedIn', avatar: 'DK', email: 'david.kim@email.com' },
    { id: '6', name: 'Aisha Patel', stage: 'Screen', score: 79, timeInStage: '8 days', source: 'Internal', avatar: 'AP', email: 'aisha.p@email.com' },
    { id: '7', name: 'Marcus Johnson', stage: 'Applied', score: 76, timeInStage: '3 days', source: 'Referral', avatar: 'MJ', email: 'marcus.j@email.com' },
    { id: '8', name: 'Emily Rodriguez', stage: 'Applied', score: 71, timeInStage: '5 days', source: 'Indeed', avatar: 'ER', email: 'emily.r@email.com' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Top Ranked */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Award className="size-5" />
            <span className="text-indigo-100">Top-Ranked Candidate</span>
          </div>
          <div className="mb-1">Sarah Chen</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl">94%</span>
            <span className="text-indigo-100">Match Score</span>
          </div>
        </div>

        {/* Longest in Pipeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-slate-600">
            <Clock className="size-5" />
            <span>Longest Time in Pipeline</span>
          </div>
          <div className="text-slate-900 mb-1">James Wilson</div>
          <div className="flex items-baseline gap-2">
            <span className="text-slate-900 text-3xl">12</span>
            <span className="text-slate-600">days in Interview</span>
          </div>
        </div>

        {/* Quality Score */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-slate-600">
            <TrendingUp className="size-5" />
            <span>Predicted Quality Score</span>
          </div>
          <div className="text-slate-900 mb-1">Pipeline Average</div>
          <div className="flex items-baseline gap-2">
            <span className="text-slate-900 text-3xl">83%</span>
            <span className="text-emerald-600">+12% vs. last role</span>
          </div>
        </div>
      </div>

      {/* AI Screening Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-indigo-600" />
            <h2 className="text-slate-900">AI Screening Insights</h2>
          </div>
          <p className="text-slate-600 mt-1">Candidates ranked by AI-powered scoring algorithm</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-slate-600">Rank</th>
                <th className="px-6 py-4 text-left text-slate-600">Candidate</th>
                <th className="px-6 py-4 text-left text-slate-600">Current Stage</th>
                <th className="px-6 py-4 text-left text-slate-600">Match Score</th>
                <th className="px-6 py-4 text-left text-slate-600">Time in Stage</th>
                <th className="px-6 py-4 text-left text-slate-600">Source</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate, index) => (
                <tr
                  key={candidate.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center size-8 rounded-full bg-slate-100 text-slate-600">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                        {candidate.avatar}
                      </div>
                      <div>
                        <div className="text-slate-900">{candidate.name}</div>
                        <div className="text-slate-500 text-sm">{candidate.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                      {candidate.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[120px]">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              candidate.score >= 90 ? 'bg-emerald-500' :
                              candidate.score >= 80 ? 'bg-indigo-500' :
                              candidate.score >= 70 ? 'bg-blue-500' :
                              'bg-slate-400'
                            }`}
                            style={{ width: `${candidate.score}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-slate-900 min-w-[48px]`}>
                        {candidate.score}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{candidate.timeInStage}</td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center px-2.5 py-1 rounded-lg text-xs border
                      ${candidate.source === 'LinkedIn' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        candidate.source === 'Referral' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        candidate.source === 'Internal' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                        'bg-emerald-100 text-emerald-700 border-emerald-200'}
                    `}>
                      {candidate.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AITriageView() {
  const [sortBy, setSortBy] = useState<'score' | 'relevance' | 'waiting'>('score');
  const [showExplanations, setShowExplanations] = useState(true);

  const candidates = [
    { 
      id: '1', 
      name: 'Sarah Chen', 
      avatar: 'SC', 
      email: 'sarah.chen@email.com',
      fitScore: 94, 
      timeInPipeline: '2 days',
      badges: ['Strong match', 'Culture fit'],
      reasons: ['8+ years product design', 'B2B SaaS experience', 'Figma expert', 'Design systems'],
      risk: null
    },
    { 
      id: '2', 
      name: 'Robert Taylor', 
      avatar: 'RT', 
      email: 'robert.t@email.com',
      fitScore: 91, 
      timeInPipeline: '21 days',
      badges: ['Strong match'],
      reasons: ['Senior IC experience', 'Portfolio strength', 'User research skills'],
      risk: null
    },
    { 
      id: '3', 
      name: 'Lisa Anderson', 
      avatar: 'LA', 
      email: 'lisa.a@email.com',
      fitScore: 88, 
      timeInPipeline: '14 days',
      badges: ['Good match'],
      reasons: ['Relevant experience', 'Design leadership', 'Component libraries'],
      risk: null
    },
    { 
      id: '4', 
      name: 'James Wilson', 
      avatar: 'JW', 
      email: 'james.w@email.com',
      fitScore: 85, 
      timeInPipeline: '19 days',
      badges: ['Good match'],
      reasons: ['Strong portfolio', 'End-to-end design', 'Collaboration skills'],
      risk: 'Job hopping (3 roles in 2 years)'
    },
    { 
      id: '5', 
      name: 'David Kim', 
      avatar: 'DK', 
      email: 'david.kim@email.com',
      fitScore: 82, 
      timeInPipeline: '14 days',
      badges: ['Moderate match'],
      reasons: ['Design skills', 'Problem solving', 'Communication'],
      risk: 'Missing: B2B SaaS background'
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles className="size-5" />
            <h2 className="text-slate-900">AI Candidate Triage</h2>
          </div>
          <span className="text-slate-500">Ranked by intelligent scoring</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
            <span className="text-slate-600 text-sm">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-slate-900 text-sm cursor-pointer outline-none"
            >
              <option value="score">Score</option>
              <option value="relevance">Relevance</option>
              <option value="waiting">Time Waiting</option>
            </select>
          </div>

          {/* Explanations Toggle */}
          <button
            onClick={() => setShowExplanations(!showExplanations)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border
              ${showExplanations 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }
            `}
          >
            <Sparkles className="size-4" />
            <span>Show Explanations</span>
          </button>
        </div>
      </div>

      {/* Candidate List */}
      <div className="space-y-3">
        {candidates.map((candidate, index) => (
          <div
            key={candidate.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-6">
              {/* Rank Badge */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className={`
                  size-10 rounded-full flex items-center justify-center text-sm
                  ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                    'bg-slate-100 text-slate-600'}
                `}>
                  {index + 1}
                </div>
              </div>

              {/* Candidate Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                      {candidate.avatar}
                    </div>
                    <div>
                      <div className="text-slate-900 mb-1">{candidate.name}</div>
                      <div className="text-slate-500 text-sm">{candidate.email}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 text-sm">
                      <FileText className="size-4" />
                      <span>Resume</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                      <Check className="size-4" />
                      <span>Move to Screen</span>
                    </button>
                    <button className="flex items-center justify-center size-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <X className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  {/* Fit Score */}
                  <div className="flex items-center gap-3">
                    <div className="relative size-14">
                      <svg className="size-14 transform -rotate-90">
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-slate-100"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 24}`}
                          strokeDashoffset={`${2 * Math.PI * 24 * (1 - candidate.fitScore / 100)}`}
                          className={`
                            ${candidate.fitScore >= 90 ? 'text-emerald-500' :
                              candidate.fitScore >= 80 ? 'text-indigo-500' :
                              'text-blue-500'}
                          `}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-slate-900 text-sm">
                        {candidate.fitScore}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm">Fit Score</div>
                      <div className="text-slate-900">{candidate.fitScore}%</div>
                    </div>
                  </div>

                  {/* Time in Pipeline */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                    <Clock className="size-4 text-slate-500" />
                    <span className="text-slate-700 text-sm">{candidate.timeInPipeline} in pipeline</span>
                  </div>

                  {/* Summary Badges */}
                  {candidate.badges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm border border-indigo-200"
                    >
                      {badge}
                    </span>
                  ))}

                  {/* Risk Badge */}
                  {candidate.risk && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-200">
                      Risk: {candidate.risk}
                    </span>
                  )}
                </div>

                {/* AI Reasoning */}
                {showExplanations && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Sparkles className="size-4 text-indigo-600 mt-0.5" />
                      <div className="text-slate-600 text-sm">Why this candidate is a strong match:</div>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-6">
                      {candidate.reasons.map((reason) => (
                        <span
                          key={reason}
                          className="inline-flex items-center px-2.5 py-1 bg-white/80 text-slate-700 rounded-lg text-sm"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

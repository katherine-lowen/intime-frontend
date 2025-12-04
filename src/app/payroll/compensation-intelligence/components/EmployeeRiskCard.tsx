import React from 'react';
import { ArrowRight, DollarSign } from 'lucide-react';

interface EmployeeRiskCardProps {
  name: string;
  role: string;
  department: string;
  salary: number;
  marketMin: number;
  marketMax: number;
  recommendation: string;
  suggestedRaise: number;
  riskLevel: 'high' | 'medium' | 'low';
}

export function EmployeeRiskCard({
  name,
  role,
  department,
  salary,
  marketMin,
  marketMax,
  recommendation,
  suggestedRaise,
  riskLevel,
}: EmployeeRiskCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const riskConfig = {
    high: {
      label: 'High Risk',
      color: 'bg-rose-100 text-rose-700 border-rose-200',
    },
    medium: {
      label: 'Medium Risk',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    low: {
      label: 'Low Risk',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
  };

  // Calculate position in market range
  const range = marketMax - marketMin;
  const salaryPosition = ((salary - marketMin) / range) * 100;
  const clampedPosition = Math.max(0, Math.min(100, salaryPosition));

  return (
    <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-slate-900 mb-1">{name}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>{role}</span>
            <span className="text-slate-400">•</span>
            <span>{department}</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-lg text-sm border ${riskConfig[riskLevel].color}`}>
          {riskConfig[riskLevel].label}
        </span>
      </div>

      {/* Salary vs Market Range */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-600">Current: {formatCurrency(salary)}</span>
          <span className="text-slate-500">Market: {formatCurrency(marketMin)} - {formatCurrency(marketMax)}</span>
        </div>
        <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 rounded-full"></div>
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-lg"
            style={{ left: `calc(${clampedPosition}% - 6px)` }}
          ></div>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="bg-white/60 rounded-lg p-4 mb-4 border border-slate-200">
        <div className="text-sm text-slate-700 mb-2">{recommendation}</div>
        <div className="flex items-center gap-2 text-emerald-700">
          <DollarSign className="w-4 h-4" />
          <span className="text-sm">Recommended raise: {formatCurrency(suggestedRaise)}</span>
        </div>
      </div>

      <button className="text-indigo-700 hover:text-indigo-800 flex items-center gap-2 text-sm group-hover:gap-3 transition-all">
        <span>View profile</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

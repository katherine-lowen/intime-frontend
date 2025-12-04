import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface DepartmentData {
  department: string;
  medianSalary: number;
  marketMedian: number;
  marketPosition: number;
  outliers: number;
  equityScore: number;
}

const departments: DepartmentData[] = [
  {
    department: 'Engineering',
    medianSalary: 147000,
    marketMedian: 154000,
    marketPosition: -4,
    outliers: 3,
    equityScore: 78,
  },
  {
    department: 'Sales',
    medianSalary: 128000,
    marketMedian: 122000,
    marketPosition: 5,
    outliers: 1,
    equityScore: 83,
  },
  {
    department: 'Operations',
    medianSalary: 96000,
    marketMedian: 101000,
    marketPosition: -5,
    outliers: 2,
    equityScore: 71,
  },
  {
    department: 'Product',
    medianSalary: 135000,
    marketMedian: 138000,
    marketPosition: -2,
    outliers: 1,
    equityScore: 76,
  },
  {
    department: 'Marketing',
    medianSalary: 108000,
    marketMedian: 105000,
    marketPosition: 3,
    outliers: 0,
    equityScore: 85,
  },
  {
    department: 'Customer Success',
    medianSalary: 89000,
    marketMedian: 92000,
    marketPosition: -3,
    outliers: 2,
    equityScore: 74,
  },
];

export function DepartmentTable() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getEquityColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50';
    if (score >= 70) return 'text-amber-700 bg-amber-50';
    return 'text-rose-700 bg-rose-50';
  };

  const getPositionColor = (position: number) => {
    if (position > 0) return 'text-emerald-700';
    if (position < 0) return 'text-rose-700';
    return 'text-slate-700';
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-8">
      <div className="mb-6">
        <h2 className="text-slate-900 mb-1">Department Benchmarks</h2>
        <p className="text-slate-600">Comparative analysis of compensation across departments</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="text-left px-6 py-4 text-slate-700 text-sm">Department</th>
              <th className="text-left px-6 py-4 text-slate-700 text-sm">Median Salary</th>
              <th className="text-left px-6 py-4 text-slate-700 text-sm">Market Median</th>
              <th className="text-left px-6 py-4 text-slate-700 text-sm">Market Position</th>
              <th className="text-left px-6 py-4 text-slate-700 text-sm">Outliers</th>
              <th className="text-left px-6 py-4 text-slate-700 text-sm">Pay Equity Score</th>
            </tr>
          </thead>
          <tbody className="bg-white/40">
            {departments.map((dept, index) => (
              <tr 
                key={dept.department} 
                className={`border-t border-slate-100 hover:bg-indigo-50/30 transition-colors ${
                  index === departments.length - 1 ? '' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="text-slate-900">{dept.department}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-900">{formatCurrency(dept.medianSalary)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-600">{formatCurrency(dept.marketMedian)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-2 ${getPositionColor(dept.marketPosition)}`}>
                    {dept.marketPosition > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>
                      {dept.marketPosition > 0 ? '+' : ''}{dept.marketPosition}% {dept.marketPosition > 0 ? 'above' : 'below'} market
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {dept.outliers > 0 && <AlertCircle className="w-4 h-4 text-amber-600" />}
                    <span className="text-slate-900">{dept.outliers}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm ${getEquityColor(dept.equityScore)}`}>
                    {dept.equityScore}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

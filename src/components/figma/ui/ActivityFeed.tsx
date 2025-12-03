import React from 'react';
import { Users, Calendar, Briefcase, ExternalLink } from 'lucide-react';

interface ActivityItemData {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  accentColor: 'blue' | 'purple' | 'emerald' | 'amber' | 'cyan';
}

const accentStyles = {
  blue: {
    bg: 'from-blue-500/15 to-blue-600/15',
    text: 'text-blue-600',
    ring: 'ring-blue-500/20'
  },
  purple: {
    bg: 'from-purple-500/15 to-purple-600/15',
    text: 'text-purple-600',
    ring: 'ring-purple-500/20'
  },
  emerald: {
    bg: 'from-emerald-500/15 to-emerald-600/15',
    text: 'text-emerald-600',
    ring: 'ring-emerald-500/20'
  },
  amber: {
    bg: 'from-amber-500/15 to-amber-600/15',
    text: 'text-amber-600',
    ring: 'ring-amber-500/20'
  },
  cyan: {
    bg: 'from-cyan-500/15 to-cyan-600/15',
    text: 'text-cyan-600',
    ring: 'ring-cyan-500/20'
  }
};

const activities: ActivityItemData[] = [
  {
    type: 'employee.created',
    title: 'Employee Added',
    description: 'John Smith joined Engineering',
    timestamp: '2 min ago',
    icon: <Users className="w-4 h-4" />,
    accentColor: 'blue'
  },
  {
    type: 'timeoff.approved',
    title: 'Time Off Approved',
    description: 'Sarah Chen • Dec 20-27',
    timestamp: '15 min ago',
    icon: <Calendar className="w-4 h-4" />,
    accentColor: 'emerald'
  },
  {
    type: 'role.opened',
    title: 'Role Opened',
    description: 'Senior Product Designer',
    timestamp: '1 hour ago',
    icon: <Briefcase className="w-4 h-4" />,
    accentColor: 'purple'
  },
  {
    type: 'employee.updated',
    title: 'Profile Updated',
    description: 'Michael Torres changed teams',
    timestamp: '3 hours ago',
    icon: <Users className="w-4 h-4" />,
    accentColor: 'blue'
  },
  {
    type: 'timeoff.requested',
    title: 'Time Off Requested',
    description: 'Emma Wilson • Jan 5-12',
    timestamp: '5 hours ago',
    icon: <Calendar className="w-4 h-4" />,
    accentColor: 'cyan'
  },
  {
    type: 'role.closed',
    title: 'Role Filled',
    description: 'Backend Engineer position',
    timestamp: '1 day ago',
    icon: <Briefcase className="w-4 h-4" />,
    accentColor: 'purple'
  },
  {
    type: 'employee.created',
    title: 'Employee Added',
    description: 'Alex Kumar joined Marketing',
    timestamp: '1 day ago',
    icon: <Users className="w-4 h-4" />,
    accentColor: 'blue'
  },
  {
    type: 'timeoff.approved',
    title: 'Time Off Approved',
    description: 'David Lee • Dec 23-25',
    timestamp: '2 days ago',
    icon: <Calendar className="w-4 h-4" />,
    accentColor: 'emerald'
  }
];

export function ActivityFeed() {
  return (
    <div className="glass-surface rounded-3xl p-8 shadow-glass sticky top-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-slate-900 text-xl font-semibold">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all">
          View all
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-premium pr-2">
        {activities.map((activity, index) => (
          <ActivityItem key={index} {...activity} />
        ))}
      </div>
    </div>
  );
}

function ActivityItem({
  title,
  description,
  timestamp,
  icon,
  accentColor
}: ActivityItemData) {
  const styles = accentStyles[accentColor];

  return (
    <div className="group relative">
      <button className="w-full flex items-start gap-4 p-4 rounded-2xl hover:bg-white/60 transition-all duration-300 text-left">
        {/* Icon */}
        <div className={`flex-shrink-0 p-3 bg-gradient-to-br ${styles.bg} ${styles.text} rounded-xl ring-1 ${styles.ring} inner-glow group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span className="text-slate-900 text-sm font-semibold">{title}</span>
            <span className="text-slate-500 text-xs whitespace-nowrap font-medium">
              {timestamp}
            </span>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
          <button className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium group/link">
            <span>View raw</span>
            <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </button>
      
      {/* Subtle divider */}
      {activities.indexOf({ title, description, timestamp, icon, accentColor } as ActivityItemData) < activities.length - 1 && (
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent mx-4" />
      )}
    </div>
  );
}

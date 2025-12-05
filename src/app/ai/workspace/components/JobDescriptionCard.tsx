import { FileText, Copy, Download } from 'lucide-react';

export function JobDescriptionCard() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-slate-50">Senior Product Designer</h3>
            <p className="text-slate-400">Draft job description</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-colors">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/30 space-y-4">
        <div>
          <h4 className="text-slate-200 mb-2">About the Role</h4>
          <p className="text-slate-400">
            We're looking for a Senior Product Designer to join our growing design team. You'll work closely with product managers and engineers to craft beautiful, intuitive experiences that delight our customers and drive business impact.
          </p>
        </div>

        <div>
          <h4 className="text-slate-200 mb-2">Key Responsibilities</h4>
          <ul className="space-y-1.5 text-slate-400">
            <li>• Lead end-to-end design for key product features</li>
            <li>• Collaborate with cross-functional teams to define product vision</li>
            <li>• Create wireframes, prototypes, and high-fidelity designs</li>
            <li>• Conduct user research and usability testing</li>
            <li>• Maintain and evolve our design system</li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-200 mb-2">Requirements</h4>
          <ul className="space-y-1.5 text-slate-400">
            <li>• 5+ years of product design experience</li>
            <li>• Strong portfolio demonstrating UX/UI expertise</li>
            <li>• Proficiency in Figma and design systems</li>
            <li>• Experience with user research methodologies</li>
            <li>• Excellent communication and collaboration skills</li>
          </ul>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">
          Create Job
        </button>
        <button className="px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-colors">
          Edit Draft
        </button>
      </div>
    </div>
  );
}

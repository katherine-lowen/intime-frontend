import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { get } from "@/lib/api";

export default async function Overview() {
  const stats = await get<{employees:number; openRoles:number; approvals:number}>("/stats").catch(() => ({
    employees: 42, openRoles: 7, approvals: 5
  }));
  const events = await get<any[]>("/events").catch(() => []);

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-sm text-text-muted">Active Employees</div>
              <div className="mt-1 text-3xl font-semibold tracking-[-0.02em]">{stats.employees}</div>
            </div>
            <Button as="a" href="/employees" variant="primary">Manage</Button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-sm text-text-muted">Open Roles</div>
              <div className="mt-1 text-3xl font-semibold tracking-[-0.02em]">{stats.openRoles}</div>
            </div>
            <Button as="a" href="/jobs" variant="primary">Create Job</Button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-sm text-text-muted">Pending Approvals</div>
              <div className="mt-1 text-3xl font-semibold tracking-[-0.02em]">{stats.approvals}</div>
            </div>
            <Button as="a" href="/settings" variant="subtle">Review</Button>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold">Recent Activity</h3>
            <p className="text-sm text-text-muted mt-1">Latest HR & recruiting events</p>
          </div>
          <Button as="a" href="/dashboard" variant="subtle">Open Dashboard</Button>
        </div>

        <div className="px-1 pb-4">
          <div className="overflow-hidden rounded-lg border border-line-subtle/60">
            <table className="min-w-full text-sm bg-white/70 dark:bg-white/5">
              <thead className="text-text-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Event</th>
                  <th className="px-4 py-3 text-left">Summary</th>
                  <th className="px-4 py-3 text-left">When</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle/70">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-surface-muted/70 dark:hover:bg-white/5 transition">
                    <td className="px-4 py-3 capitalize">{e.type}</td>
                    <td className="px-4 py-3">{e.summary}</td>
                    <td className="px-4 py-3">{e.createdAt}</td>
                    <td className="px-4 py-3 text-right">
                      <a className="text-brand-600 hover:underline" href="#">View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

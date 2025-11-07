// src/app/jobs/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { get, post } from "@/lib/api";

type Job = {
  id: string;
  title: string;
  status: string;
  applicants: number;
};

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await get<Job[]>("/jobs").catch(() => []);

  async function createJob() {
    "use server";
    await post("/jobs", { title: "New Role" });
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <form action={createJob}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Jobs</h2>
          <Button type="submit">Create Job</Button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Open Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="min-w-full divide-y">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">Title</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">Applicants</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-4 py-2">{job.title}</td>
                    <td className="px-4 py-2">{job.status}</td>
                    <td className="px-4 py-2">{job.applicants}</td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-sm text-neutral-500">
                      No jobs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export {};

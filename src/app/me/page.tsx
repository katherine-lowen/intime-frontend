// src/app/me/page.tsx
import { AuthGate } from "@/components/dev-auth-gate";
import { getCurrentUser } from "@/lib/auth";

export default async function MePage() {
  const current = await getCurrentUser();

  return (
    <AuthGate>
      <div className="mx-auto max-w-3xl p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your account details and basic information.
          </p>
        </div>

        {!current?.user ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Unable to load your profile.
          </div>
        ) : (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500">
                Name
              </div>
              <div className="text-sm text-slate-900">
                {current.user.name}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500">
                Email
              </div>
              <div className="text-sm text-slate-900">
                {current.user.email}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500">
                Role
              </div>
              <div className="text-sm text-slate-900">
                {current.user.role ?? "USER"}
              </div>
            </div>

            {current.org && (
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <div className="text-xs font-medium text-slate-500">
                  Organization
                </div>
                <div className="text-sm text-slate-900">
                  {current.org.name}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </AuthGate>
  );
}

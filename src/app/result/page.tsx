// src/app/result/page.tsx
import Link from "next/link";

type ResultPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function ResultPage({ searchParams }: ResultPageProps) {
  const rawSessionId = searchParams?.session_id;
  const sessionId =
    typeof rawSessionId === "string" ? rawSessionId : null;

  const status =
    typeof searchParams?.status === "string"
      ? searchParams.status
      : null;

  const isSuccess = status === "success";
  const isCanceled = status === "canceled";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">
          Billing · Stripe checkout
        </p>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-50 mb-2">
          {isSuccess
            ? "Workspace created successfully"
            : isCanceled
            ? "Checkout canceled"
            : "We couldn’t verify your payment"}
        </h1>

        <p className="text-sm text-slate-300 mb-6">
          {isSuccess &&
            "Your Intime subscription is active. You can start inviting your team and configuring your workspace."}
          {isCanceled &&
            "You canceled the checkout flow. No charges were made. You can try again anytime."}
          {!isSuccess && !isCanceled &&
            "We weren’t able to confirm your payment. If you think this is a mistake, you can retry checkout or contact support."}
        </p>

        {sessionId && (
          <p className="mb-4 text-xs text-slate-500">
            Stripe session ID:{" "}
            <span className="font-mono text-slate-300">{sessionId}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-3 mt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
          >
            Go to workspace
          </Link>

          <Link
            href="/choose-plan"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Choose a different plan
          </Link>
        </div>
      </div>
    </main>
  );
}

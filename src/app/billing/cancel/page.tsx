import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BillingCancelPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
        <h1 className="text-xl font-semibold text-slate-900">Checkout cancelled</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your Stripe session was cancelled. You can restart anytime.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Button asChild>
            <Link href="/start">Restart checkout</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/pricing">View plans</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

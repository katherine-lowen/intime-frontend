// src/app/api/debug-env/route.ts
export async function GET() {
  return new Response(
    JSON.stringify({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || null,
      NEXT_PUBLIC_ORG_ID: process.env.NEXT_PUBLIC_ORG_ID || null,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

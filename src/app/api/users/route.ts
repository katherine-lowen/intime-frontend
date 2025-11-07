// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || 'demo-org';

export async function GET() {
  const res = await fetch(`${API_URL}/users`, {
    headers: { 'X-Org-Id': ORG_ID },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return NextResponse.json({ error: text || 'Failed to fetch users' }, { status: res.status });
  }
  const data = await res.json();
  return NextResponse.json(data);
}

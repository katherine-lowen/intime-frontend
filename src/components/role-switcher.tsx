// src/components/role-switcher.tsx
'use client';

import { useState } from 'react';

/**
 * RoleSwitcher — a simple dropdown to simulate different user roles.
 * This component is used in the layout header.
 */
export function RoleSwitcher() {
  const [role, setRole] = useState<'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER'>('ADMIN');

  return (
    <div className="inline-flex items-center gap-2">
      <label className="text-xs opacity-60">Role</label>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as any)}
        className="border rounded px-2 py-1 text-sm bg-white"
      >
        <option value="OWNER">OWNER</option>
        <option value="ADMIN">ADMIN</option>
        <option value="MANAGER">MANAGER</option>
        <option value="MEMBER">MEMBER</option>
      </select>
    </div>
  );
}

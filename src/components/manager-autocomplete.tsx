'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import api from '@/lib/api';
import type { Employee } from '@/types/people';

type Props = {
  value?: string | null;
  onChange: (id: string | null) => void;
  label?: string;
  placeholder?: string;
};

export default function ManagerAutocomplete({
  value,
  onChange,
  label = 'Manager',
  placeholder = 'Search name...',
}: Props) {
  const [q, setQ] = useState('');
  const [opts, setOpts] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q) {
        setOpts([]);
        return;
      }
      try {
        const data = await api.get<Employee[]>(
          `/employees?q=${encodeURIComponent(q)}&limit=8`,
        );

        // Normalize in case api.get<T>() returns T | undefined
        const list: Employee[] = Array.isArray(data) ? data : [];
        setOpts(list);
        setOpen(true);
      } catch {
        // noop
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const selectedLabel = useMemo(() => {
    const found = opts.find((o) => o.id === value);
    if (found) return `${found.firstName} ${found.lastName}`;
    return '';
  }, [opts, value]);

  return (
    <div className="space-y-1" ref={boxRef}>
      <label className="text-sm font-medium">{label}</label>
      <input
        className="w-full rounded border px-3 py-2"
        placeholder={placeholder}
        value={q || selectedLabel}
        onChange={(e) => {
          setQ(e.target.value);
          onChange(null);
        }}
        onFocus={() => q && setOpen(true)}
      />
      {open && opts.length > 0 && (
        <div className="mt-1 max-h-56 overflow-auto rounded border bg-white shadow">
          {opts.map((o) => (
            <button
              key={o.id}
              type="button"
              className="flex w-full items-center justify-between px-3 py-2 hover:bg-gray-50"
              onClick={() => {
                onChange(o.id);
                setQ(`${o.firstName} ${o.lastName}`);
                setOpen(false);
              }}
            >
              <span>
                {o.firstName} {o.lastName}
              </span>
              <span className="text-xs opacity-60">
                {o.department || o.title || ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

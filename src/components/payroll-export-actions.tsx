"use client";

import { useState } from "react";

type PayrollRowForCsv = {
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  department?: string | null;
  title?: string | null;
  location?: string | null;
  status?: string | null;
  startDate?: string | null;
  payType?: string | null;
  basePayCents?: number | null;
  payCurrency?: string | null;
  paySchedule?: string | null;
  payrollProvider?: string | null;
  payrollExternalId?: string | null;
};

type Props = {
  rows: PayrollRowForCsv[];
};

function toCsv(rows: PayrollRowForCsv[]): string {
  const headers = [
    "employeeId",
    "firstName",
    "lastName",
    "email",
    "department",
    "title",
    "location",
    "status",
    "startDate",
    "payType",
    "basePay",
    "payCurrency",
    "paySchedule",
    "payrollProvider",
    "payrollExternalId",
  ];

  const lines = [headers.join(",")];

  for (const r of rows) {
    const basePay =
      typeof r.basePayCents === "number"
        ? (r.basePayCents / 100).toFixed(2)
        : "";

    const values = [
      r.employeeId ?? "",
      r.firstName ?? "",
      r.lastName ?? "",
      r.email ?? "",
      r.department ?? "",
      r.title ?? "",
      r.location ?? "",
      r.status ?? "",
      r.startDate ?? "",
      r.payType ?? "",
      basePay,
      r.payCurrency ?? "USD",
      r.paySchedule ?? "",
      r.payrollProvider ?? "",
      r.payrollExternalId ?? "",
    ].map((v) => {
      const s = String(v);
      // Escape quotes + wrap in quotes if needed
      if (s.includes('"') || s.includes(",") || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    });

    lines.push(values.join(","));
  }

  return lines.join("\n");
}

export default function PayrollExportActions({ rows }: Props) {
  const [downloading, setDownloading] = useState(false);

  function handleDownload() {
    if (!rows.length) return;
    setDownloading(true);
    try {
      const csv = toCsv(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "intime-payroll-export.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading || rows.length === 0}
      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {downloading ? "Preparing CSV…" : "Download CSV"}
    </button>
  );
}

import fs from "fs";
import path from "path";

const root = process.cwd();
const SRC = path.join(root, "src", "app");

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, contents) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents, "utf8");
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

// Compute a RELATIVE import (no extension) from wrapper file -> legacy file
function relativeImport(fromFile, toFile) {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, toFile);
  rel = rel.replace(/\.tsx?$/, ""); // strip extension
  rel = toPosix(rel);

  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

function wrapper(relativeLegacyImport) {
  return `"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

// Load legacy client page without SSR
const Legacy = dynamic(() => import("${relativeLegacyImport}"), { ssr: false });

export default function Page() {
  // Make org slug available to any legacy code that uses __INTIME_ORG_SLUG__
  const params = useParams() as { orgSlug?: string } | null;
  (globalThis as any).__INTIME_ORG_SLUG__ = params?.orgSlug ?? "";

  return <Legacy />;
}
`;
}

// Map: org wrapper path -> legacy page path (relative to src/app WITHOUT extension)
const mappings = [
  // People
  ["org/[orgSlug]/people/page.tsx", "people/page.tsx"],
  ["org/[orgSlug]/people/new/page.tsx", "people/new/page.tsx"],
  ["org/[orgSlug]/people/org-chart/page.tsx", "people/org-chart/page.tsx"],
  ["org/[orgSlug]/people/[id]/page.tsx", "people/[id]/page.tsx"],
  ["org/[orgSlug]/people/[id]/edit/page.tsx", "people/[id]/edit/page.tsx"],
  ["org/[orgSlug]/people/[id]/documents/page.tsx", "people/[id]/documents/page.tsx"],

  // Hiring
  ["org/[orgSlug]/hiring/page.tsx", "hiring/page.tsx"],
  ["org/[orgSlug]/hiring/templates/page.tsx", "hiring/templates/page.tsx"],
  ["org/[orgSlug]/hiring/ai-studio/page.tsx", "hiring/ai-studio/page.tsx"],
  ["org/[orgSlug]/hiring/ai-studio/resume-match/page.tsx", "hiring/ai-studio/resume-match/page.tsx"],
  ["org/[orgSlug]/hiring/ai-studio/candidate-summary/page.tsx", "hiring/ai-studio/candidate-summary/page.tsx"],
  ["org/[orgSlug]/hiring/ai-studio/job-intake/page.tsx", "hiring/ai-studio/job-intake/page.tsx"],
  ["org/[orgSlug]/hiring/ai-studio/job-description/page.tsx", "hiring/ai-studio/job-description/page.tsx"],
  ["org/[orgSlug]/hiring/ai-studio/onboarding-plan/page.tsx", "hiring/ai-studio/onboarding-plan/page.tsx"],
  ["org/[orgSlug]/hiring/ai-studio/performance-review/page.tsx", "hiring/ai-studio/performance-review/page.tsx"],

  // Time off (org route uses `time-off`, legacy uses `timeoff`)
  ["org/[orgSlug]/time-off/page.tsx", "timeoff/page.tsx"],
  ["org/[orgSlug]/time-off/requests/page.tsx", "timeoff/requests/page.tsx"],
  ["org/[orgSlug]/time-off/policies/page.tsx", "timeoff/policies/page.tsx"],
  ["org/[orgSlug]/time-off/policies/new/page.tsx", "timeoff/policies/new/page.tsx"],
  ["org/[orgSlug]/time-off/calendar/page.tsx", "timeoff/calendar/page.tsx"],
  ["org/[orgSlug]/time-off/new/page.tsx", "timeoff/new/page.tsx"],
  ["org/[orgSlug]/time-off/manager/page.tsx", "timeoff/manager/page.tsx"],

  // AI (org route under /org/[orgSlug]/ai, legacy under /ai)
  ["org/[orgSlug]/ai/page.tsx", "ai/page.tsx"],
  ["org/[orgSlug]/ai/workspace/page.tsx", "ai/workspace/page.tsx"],
  ["org/[orgSlug]/ai/summary/page.tsx", "ai/summary/page.tsx"],
  ["org/[orgSlug]/ai/workforce/page.tsx", "ai/workforce/page.tsx"],
  ["org/[orgSlug]/ai/copilot/page.tsx", "ai/copilot/page.tsx"],
  ["org/[orgSlug]/ai/jd/page.tsx", "ai/jd/page.tsx"],
  ["org/[orgSlug]/ai/ai-job-intake/page.tsx", "ai/ai-job-intake/page.tsx"],
  ["org/[orgSlug]/ai/performance-review/page.tsx", "ai/performance-review/page.tsx"],
];

const created = [];
const skipped = [];

for (const [orgRel, legacyRelFromApp] of mappings) {
  const orgPath = path.join(SRC, orgRel);
  const legacyDisk = path.join(SRC, legacyRelFromApp);

  // Check legacy file exists on disk
  if (!exists(legacyDisk)) {
    skipped.push({
      orgRel,
      legacyRelFromApp,
      reason: "legacy page missing",
      legacyDisk,
    });
    continue;
  }

  // If wrapper already exists, do not overwrite (safer)
  if (exists(orgPath)) {
    skipped.push({ orgRel, legacyRelFromApp, reason: "wrapper already exists" });
    continue;
  }

  const relImp = relativeImport(orgPath, legacyDisk);
  writeFile(orgPath, wrapper(relImp));
  created.push(orgRel);
}

console.log("Created wrappers:");
for (const f of created) console.log("  -", f);

console.log("\nSkipped:");
for (const s of skipped) {
  console.log("  -", s.orgRel, "=>", s.legacyRelFromApp, `(${s.reason})`);
}

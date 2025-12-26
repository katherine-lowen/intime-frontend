export type ActivationStepKey =
  | "create_job"
  | "add_candidate"
  | "generate_ai_summary"
  | "add_employee"
  | "invite_member";

export const ACTIVATION_STEPS: {
  key: ActivationStepKey;
  title: string;
  description: string;
  href: (orgSlug: string) => string;
}[] = [
  {
    key: "create_job",
    title: "Create your first job",
    description: "Set up a role and pipeline to start hiring.",
    href: (org) => `/org/${org}/hiring?createJob=1`,
  },
  {
    key: "add_candidate",
    title: "Add a candidate",
    description: "Add someone to your pipeline to track progress.",
    href: (org) => `/org/${org}/hiring?addCandidate=1`,
  },
  {
    key: "generate_ai_summary",
    title: "Run an AI summary",
    description: "Use AI to summarize a candidate or interview.",
    href: (org) => `/org/${org}/hiring/ai-studio/candidate-summary`,
  },
  {
    key: "add_employee",
    title: "Add an employee",
    description: "Create an employee record in People.",
    href: (org) => `/org/${org}/people/new`,
  },
  {
    key: "invite_member",
    title: "Invite a teammate",
    description: "Invite collaborators to your workspace.",
    href: (org) => `/org/${org}/settings/members`,
  },
];

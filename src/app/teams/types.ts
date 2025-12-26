export type Team = {
  id: string;
  name: string;
  department?: string | null;
  lead?: { id: string; name: string; title?: string | null } | null;
  memberCount?: number | null;
  members?: { id: string; name: string; title?: string | null }[];
};

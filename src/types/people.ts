export type Employee = {
  id: string;
  orgId: string;
  firstName: string;
  lastName: string;
  email: string;
  title?: string | null;
  department?: string | null;
  status?: 'ACTIVE'|'ON_LEAVE'|'CONTRACTOR'|'ALUMNI';
  managerId?: string | null;
  manager?: { id: string; firstName: string; lastName: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type EventItem = {
  id: string;
  orgId: string;
  type: string; // e.g. employee.created, employee.status_changed
  createdAt: string;
  payload: any;
  employeeId?: string | null;
  jobId?: string | null;
};

export type CycleStatus = "DRAFT" | "ACTIVE" | "CLOSED" | string;

export type PerformanceCycle = {
  id: string;
  name: string;
  description?: string | null;
  status: CycleStatus;
  startDate: string;
  endDate: string;
  reminderEnabled?: boolean;
  reminderDaysBeforeEnd?: number | null;
  totalReviews?: number;
  submittedCount?: number;
  completionPercent?: number;
};

export type PerformanceReviewSummary = {
  id: string;
  employee: { id: string; firstName?: string | null; lastName?: string | null };
  reviewer: { id: string; firstName?: string | null; lastName?: string | null };
  status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "OVERDUE" | string;
  updatedAt: string;
};

export type ReviewQuestionType = "TEXT" | "RATING" | "MULTIPLE_CHOICE";

export type ReviewQuestion = {
  id: string;
  type: ReviewQuestionType;
  prompt: string;
  helpText?: string | null;
  minRating?: number | null;
  maxRating?: number | null;
  options?: string[];
  sortOrder: number;
};

export type ReviewFormTemplate = {
  id: string;
  name: string;
  description?: string | null;
  appliesTo?: "SELF" | "MANAGER" | "PEER" | null;
  questions: ReviewQuestion[];
};

export type ReviewFormResponse = {
  questionId: string;
  textAnswer?: string | null;
  ratingAnswer?: number | null;
  choiceAnswer?: string | null;
};

export type ReviewFormPayload = {
  reviewId: string;
  role: "SELF" | "MANAGER";
  template: ReviewFormTemplate;
  responses: ReviewFormResponse[];
  reviewMeta: {
    employeeName: string;
    reviewerName: string;
    cycleName: string;
  };
};

export type EmployeeLite = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  title?: string | null;
  department?: string | null;
};

export type ReviewerAssignment = {
  employeeId: string;
  reviewerId: string;
};

export type CreatePerformanceCycleDto = {
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  reminderEnabled?: boolean;
  reminderDaysBeforeEnd?: number | null;
  reviewerAssignments?: ReviewerAssignment[];
};

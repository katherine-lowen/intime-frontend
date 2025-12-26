import api from "./api";
import type {
  PerformanceCycle,
  PerformanceReviewSummary,
  CreatePerformanceCycleDto,
  CycleStatus,
  ReviewFormPayload,
  ReviewFormResponse,
} from "./performance-types";

export async function getPerformanceCycles(query?: string) {
  const qs = query ? `?${query}` : "";
  return api.get<PerformanceCycle[]>(`/performance/cycles${qs}`);
}

export async function getPerformanceCycle(id: string) {
  return api.get<PerformanceCycle>(`/performance/cycles/${id}`);
}

export async function getPerformanceCycleReviews(cycleId: string) {
  return api.get<PerformanceReviewSummary[]>(
    `/performance/cycles/${cycleId}/reviews`
  );
}

export async function createPerformanceCycle(dto: CreatePerformanceCycleDto) {
  return api.post<PerformanceCycle | { id: string }>(`/performance/cycles`, dto);
}

export async function updatePerformanceCycle(
  id: string,
  payload: Partial<CreatePerformanceCycleDto> & { status?: CycleStatus }
) {
  return api.patch(`/performance/cycles/${id}`, payload);
}

export async function updatePerformanceCycleStatus(
  id: string,
  status: CycleStatus
) {
  return api.patch(`/performance/cycles/${id}`, { status });
}

export async function getReviewForm(reviewId: string, role: "SELF" | "MANAGER") {
  return api.get<ReviewFormPayload>(
    `/performance/reviews/${reviewId}/form?role=${role.toLowerCase()}`
  );
}

export async function submitReviewResponses(
  reviewId: string,
  role: "SELF" | "MANAGER",
  responses: ReviewFormResponse[]
) {
  return api.post(`/performance/reviews/${reviewId}/responses?role=${role.toLowerCase()}`, {
    reviewId,
    responses,
  });
}

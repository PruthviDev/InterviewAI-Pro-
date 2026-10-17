export const ROLES = ['USER', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const INTERVIEW_STATUSES = [
  'DRAFT', 'READY', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'EVALUATING', 'ANALYZED', 'FAILED',
] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

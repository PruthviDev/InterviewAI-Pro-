// src/lib/types.ts
export type InterviewStatus = 'completed' | 'in_progress' | 'processing';
export type Range = '7d' | '30d' | '90d' | 'all';

export interface DashboardData {
  stats: {
    totalInterviews: number;
    averageScore: number | null;
    practiceMinutes: number;
    improvementPct: number | null;        // null = no valid comparison period
    totalInterviewsDelta: number | null;
    averageScoreDelta: number | null;
    periodLabel: string;
  };
  inProgress: {
    id: string; role: string; progress: number;
    lastActivityAt: string; remainingQuestions: number | null;
  } | null;
  latestFeedback: {
    interviewId: string; wentWell: string; improve: string; nextStep: string;
  } | null;
}
export interface ProgressPoint { date: string; score: number }
export interface Skill { name: string; score: number; status: 'strong' | 'improving' | 'needs_practice' }
export interface InterviewRow {
  id: string; role: string; type: string; date: string;
  durationMinutes: number | null; score: number | null; status: InterviewStatus;
}
export interface Paged<T> { items: T[]; page: number; totalPages: number }
export interface Recommendation {
  id: string; title: string; reason: string;
  priority: 'high' | 'medium' | 'low'; actionLabel: string; href: string;
}
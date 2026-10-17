// src/hooks/use-dashboard.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DashboardData, InterviewRow, Paged, ProgressPoint, Range, Recommendation, Skill } from '@/lib/types';

export const useDashboard = () =>
  useQuery({ queryKey: ['dashboard'], queryFn: () => api<DashboardData>('/dashboard') });

export const useProgress = (range: Range) =>
  useQuery({
    queryKey: ['dashboard', 'progress', range],
    queryFn: () => api<ProgressPoint[]>(`/dashboard/progress?range=${range}`),
    placeholderData: keepPreviousData,
  });

export const useSkills = () =>
  useQuery({ queryKey: ['dashboard', 'skills'], queryFn: () => api<Skill[]>('/dashboard/skills') });

export const useInterviews = (page: number) =>
  useQuery({
    queryKey: ['interviews', { page }],
    queryFn: () => api<Paged<InterviewRow>>(`/interviews?page=${page}&limit=5`),
    placeholderData: keepPreviousData,
  });

export const useRecommendations = () =>
  useQuery({ queryKey: ['recommendations'], queryFn: () => api<Recommendation[]>('/recommendations') });
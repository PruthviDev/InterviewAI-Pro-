// src/components/dashboard/dashboard-view.tsx
'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Clock, FileUp, History, ListChecks, Target, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard } from '@/hooks/use-dashboard';
import { StatsCard } from './stats-card';
import { SkillPerformanceCard } from './skill-performance-card';
import { RecentInterviewsTable } from './recent-interviews-table';
import { RecommendationsSection } from './recommendation-card';
import { QuickActionCard } from './quick-action-card';
import { ContinueInterviewCard, LatestFeedbackCard } from './continue-and-feedback';
import { DashboardEmptyState, DashboardErrorState, DashboardSkeleton } from './states';

const PerformanceChart = dynamic(() => import('./performance-chart'), {
  ssr: false,
  loading: () => <Skeleton className="h-[26rem] w-full" />,
});

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};
const fmtPractice = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;

export function DashboardView({ firstName }: { firstName: string }) {
  const { data, isPending, isError, error, refetch } = useDashboard();

  return (
    <>
      <section className="rounded-xl border bg-white p-5 dark:bg-slate-900">
        <h2 className="text-xl font-semibold tracking-tight">{greeting()}, {firstName} 👋</h2>
        <p className="mt-1 text-sm font-medium">Ready to take your interview skills to the next level?</p>
        <p className="text-sm text-muted-foreground">Practice smarter, track your progress, and become interview-ready with your personal AI interviewer.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90"><Link href="/interview">Start New Interview</Link></Button>
          <Button asChild variant="outline"><Link href="/analytics">View Performance</Link></Button>
        </div>
      </section>

      {isPending ? <DashboardSkeleton /> :
       isError ? <DashboardErrorState message={error.message} onRetry={() => refetch()} /> :
       data.stats.totalInterviews === 0 ? <DashboardEmptyState /> : (
        <>
          <section aria-label="Key statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard label="Total Interviews" value={String(data.stats.totalInterviews)} icon={<ListChecks className="size-4" />} delta={data.stats.totalInterviewsDelta} caption={data.stats.periodLabel} />
            <StatsCard label="Average Score" value={data.stats.averageScore == null ? '—' : `${data.stats.averageScore}/100`} icon={<Target className="size-4" />} delta={data.stats.averageScoreDelta} caption={data.stats.periodLabel} />
            <StatsCard label="Practice Time" value={fmtPractice(data.stats.practiceMinutes)} icon={<Clock className="size-4" />} caption={data.stats.periodLabel} />
            <StatsCard label="Skill Improvement" value={data.stats.improvementPct == null ? '—' : `${data.stats.improvementPct > 0 ? '+' : ''}${data.stats.improvementPct}%`} icon={<TrendingUp className="size-4" />} caption="Needs two periods to compare" />
          </section>

          <section className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3"><PerformanceChart /></div>
            <div className="lg:col-span-2"><SkillPerformanceCard /></div>
          </section>

          {(data.inProgress || data.latestFeedback) && (
            <section className="grid gap-4 md:grid-cols-2">
              {data.inProgress && <ContinueInterviewCard data={data.inProgress} />}
              {data.latestFeedback && <LatestFeedbackCard data={data.latestFeedback} />}
            </section>
          )}

          <RecentInterviewsTable />
          <RecommendationsSection />
        </>
      )}

      <section aria-labelledby="qa-h" className="space-y-3">
        <h2 id="qa-h" className="text-base font-semibold">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <QuickActionCard href="/interview?type=technical" icon={Target} title="Technical Interview" description="Role-based coding & concepts" />
          <QuickActionCard href="/interview?type=hr" icon={Users} title="HR Interview" description="Behavioral & culture fit" />
          <QuickActionCard href="/interview?focus=weak-skills" icon={TrendingUp} title="Practice Weak Skills" description="Target low-scoring areas" />
          <QuickActionCard href="/profile#resume" icon={FileUp} title="Upload Resume" description="Tailor questions to you" />
          <QuickActionCard href="/history" icon={History} title="Review Previous" description="Revisit past reports" />
        </div>
      </section>
    </>
  );
}
// src/components/dashboard/skill-performance-card.tsx
'use client';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useSkills } from '@/hooks/use-dashboard';
import { DashboardErrorState, SectionEmpty } from './states';
import type { Skill } from '@/lib/types';

const STATUS: Record<Skill['status'], { label: string; cls: string }> = {
  strong: { label: 'Strong', cls: 'bg-emerald-100 text-emerald-700' },
  improving: { label: 'Improving', cls: 'bg-amber-100 text-amber-700' },
  needs_practice: { label: 'Needs Practice', cls: 'bg-red-100 text-red-700' },
};

export function SkillPerformanceCard() {
  const { data, isPending, isError, error, refetch } = useSkills();
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Skill Performance</CardTitle>
        <CardDescription>Understand your strengths and areas for improvement.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {isPending ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8" />) :
         isError ? <DashboardErrorState compact message={error.message} onRetry={() => refetch()} /> :
         !data.length ? <SectionEmpty>Skill scores unlock after your first interview.</SectionEmpty> :
         data.map((s) => (
          <div key={s.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{s.name}</span>
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground">{s.score}/100</span>
                <Badge variant="secondary" className={STATUS[s.status].cls}>{STATUS[s.status].label}</Badge>
              </span>
            </div>
            <Progress value={s.score} aria-label={`${s.name} score`} />
          </div>
        ))}
      </CardContent>
      <div className="p-6 pt-0">
        <Button asChild variant="outline" className="w-full"><Link href="/analytics">View Detailed Analytics</Link></Button>
      </div>
    </Card>
  );
}
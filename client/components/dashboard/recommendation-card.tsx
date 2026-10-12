// src/components/dashboard/recommendation-card.tsx
'use client';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecommendations } from '@/hooks/use-dashboard';
import { DashboardErrorState, SectionEmpty } from './states';
import type { Recommendation } from '@/lib/types';

export function RecommendationCard({ r }: { r: Recommendation }) {
  return (
    <Card className="flex flex-col justify-between p-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium">{r.title}</h3>
          <Badge variant="outline" className="capitalize">{r.priority} priority</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{r.reason}</p>
      </div>
      <Button asChild variant="outline" size="sm" className="mt-4 w-full"><Link href={r.href}>{r.actionLabel}</Link></Button>
    </Card>
  );
}

export function RecommendationsSection() {
  const { data, isPending, isError, error, refetch } = useRecommendations();
  return (
    <section aria-labelledby="rec-h" className="space-y-3">
      <div>
        <h2 id="rec-h" className="text-base font-semibold">Recommended for You</h2>
        <p className="text-sm text-muted-foreground">Personalized practice based on your interview performance.</p>
      </div>
      {isPending ? <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36" />)}</div> :
       isError ? <DashboardErrorState compact message={error.message} onRetry={() => refetch()} /> :
       !data.length ? <Card><CardContent><SectionEmpty>Complete a few interviews to get personalized recommendations.</SectionEmpty></CardContent></Card> : (
        <div className="grid gap-4 md:grid-cols-3">{data.map((r) => <RecommendationCard key={r.id} r={r} />)}</div>
      )}
    </section>
  );
}
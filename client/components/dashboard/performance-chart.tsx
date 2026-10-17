// src/components/dashboard/performance-chart.tsx
'use client';
import { useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProgress } from '@/hooks/use-dashboard';
import { DashboardErrorState, SectionEmpty } from './states';
import type { Range } from '@/lib/types';

const RANGES: { value: Range; label: string }[] = [
  { value: '7d', label: '7 days' }, { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' }, { value: 'all', label: 'All time' },
];

export default function PerformanceChart() {
  const [range, setRange] = useState<Range>('30d');
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProgress(range);
  const summary = data?.length
    ? `Line chart of ${data.length} interview scores. Latest score ${data[data.length - 1].score} out of 100.`
    : 'No score data available.';

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base">Your Performance</CardTitle>
          <CardDescription>Track how your interview scores change over time.</CardDescription>
        </div>
        <div role="group" aria-label="Time range" className="flex gap-1">
          {RANGES.map((r) => (
            <Button key={r.value} size="sm" variant={range === r.value ? 'secondary' : 'ghost'} aria-pressed={range === r.value} onClick={() => setRange(r.value)}>
              {r.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-72">
        {isPending ? <Skeleton className="h-full w-full" /> :
         isError ? <DashboardErrorState compact message={error.message} onRetry={() => refetch()} /> :
         !data.length ? <SectionEmpty>Scores will appear here after your first completed interview.</SectionEmpty> : (
          <div role="img" aria-label={summary} className={`h-full ${isPlaceholderData ? 'opacity-60' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip formatter={(v) => [`${v}/100`, 'Score']} />
                <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
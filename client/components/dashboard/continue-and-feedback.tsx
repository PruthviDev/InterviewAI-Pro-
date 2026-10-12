// src/components/dashboard/continue-and-feedback.tsx
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { DashboardData } from '@/lib/types';

export function ContinueInterviewCard({ data }: { data: NonNullable<DashboardData['inProgress']> }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Continue Your Preparation</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{data.role}</span>
          <span className="text-muted-foreground">{data.progress}%</span>
        </div>
        <Progress value={data.progress} aria-label="Interview progress" />
        <p className="text-xs text-muted-foreground">
          Last activity {new Date(data.lastActivityAt).toLocaleString()}
          {data.remainingQuestions != null && ` · ${data.remainingQuestions} questions left`}
        </p>
        <Button asChild size="sm"><Link href={`/interview/${data.id}`}>Continue</Link></Button>
      </CardContent>
    </Card>
  );
}

export function LatestFeedbackCard({ data }: { data: NonNullable<DashboardData['latestFeedback']> }) {
  const rows = [['What went well', data.wentWell], ['Top improvement area', data.improve], ['Next step', data.nextStep]] as const;
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Latest AI Feedback</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <dl className="space-y-2 text-sm">
          {rows.map(([k, v]) => (
            <div key={k}><dt className="font-medium">{k}</dt><dd className="text-muted-foreground">{v}</dd></div>
          ))}
        </dl>
        <Button asChild variant="outline" size="sm"><Link href={`/interview/${data.interviewId}/report`}>View Full Interview Report</Link></Button>
      </CardContent>
    </Card>
  );
}
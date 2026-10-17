// src/components/dashboard/recent-interviews-table.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, Loader2, MoreHorizontal, PlayCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useInterviews } from '@/hooks/use-dashboard';
import { DashboardErrorState, SectionEmpty } from './states';
import type { InterviewRow } from '@/lib/types';

const fmtDate = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const fmtDur = (m: number | null) => (m == null ? '—' : m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);
const href = (i: InterviewRow) => (i.status === 'completed' ? `/interview/${i.id}/report` : `/interview/${i.id}`);

function StatusBadge({ status }: { status: InterviewRow['status'] }) {
  const map = {
    completed: { label: 'Completed', icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700' },
    in_progress: { label: 'In progress', icon: PlayCircle, cls: 'bg-amber-100 text-amber-700' },
    processing: { label: 'Processing', icon: Loader2, cls: 'bg-slate-100 text-slate-700' },
  }[status];
  return (
    <Badge variant="secondary" className={`gap-1 ${map.cls}`}>
      <map.icon className="size-3" aria-hidden />{map.label}
    </Badge>
  );
}

function Actions({ i }: { i: InterviewRow }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${i.role}`}><MoreHorizontal className="size-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {i.status === 'completed' && <DropdownMenuItem asChild><Link href={`/interview/${i.id}/report`}>View Report</Link></DropdownMenuItem>}
        {i.status === 'in_progress' && <DropdownMenuItem asChild><Link href={`/interview/${i.id}`}>Continue Interview</Link></DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RecentInterviewsTable() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useInterviews(page);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Recent Interviews</CardTitle>
        <Button asChild variant="link" size="sm"><Link href="/history">View All</Link></Button>
      </CardHeader>

      {isPending ? <div className="space-y-2 p-6 pt-0">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div> :
       isError ? <DashboardErrorState compact message={error.message} onRetry={() => refetch()} /> :
       !data.items.length ? <SectionEmpty>No interviews yet. Your history will appear here.</SectionEmpty> : (
        <div className={isPlaceholderData ? 'opacity-60' : ''}>
          <div className="hidden px-6 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interview / Job Role</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead><TableHead>Score</TableHead><TableHead>Status</TableHead>
                  <TableHead className="w-10"><span className="sr-only">Action</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium"><Link className="hover:underline" href={href(i)}>{i.role}</Link></TableCell>
                    <TableCell>{i.type}</TableCell>
                    <TableCell>{fmtDate(i.date)}</TableCell>
                    <TableCell>{fmtDur(i.durationMinutes)}</TableCell>
                    <TableCell>{i.score == null ? '—' : `${i.score}/100`}</TableCell>
                    <TableCell><StatusBadge status={i.status} /></TableCell>
                    <TableCell><Actions i={i} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="space-y-3 px-4 pb-4 md:hidden">
            {data.items.map((i) => <InterviewMobileCard key={i.id} i={i} />)}
          </ul>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-3 text-sm">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-muted-foreground">Page {data.page} of {data.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function InterviewMobileCard({ i }: { i: InterviewRow }) {
  return (
    <li className="flex items-start justify-between gap-2 rounded-lg border p-3">
      <Link href={href(i)} className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-medium">{i.role}</p>
        <p className="text-xs text-muted-foreground">{i.type} · {fmtDate(i.date)} · {fmtDur(i.durationMinutes)}</p>
        <div className="flex items-center gap-2 pt-1">
          <StatusBadge status={i.status} />
          <span className="text-sm">{i.score == null ? '' : `${i.score}/100`}</span>
        </div>
      </Link>
      <Actions i={i} />
    </li>
  );
}
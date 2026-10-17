// src/components/dashboard/states.tsx
import Link from 'next/link';
import { AlertTriangle, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardErrorState({ message, onRetry, compact }: { message: string; onRetry: () => void; compact?: boolean }) {
  return (
    <div role="alert" className={`flex flex-col items-center justify-center gap-3 text-center ${compact ? 'py-8' : 'py-16'}`}>
      <AlertTriangle className="size-6 text-amber-500" aria-hidden />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>
    </div>
  );
}

export function DashboardEmptyState() {
  return (
    <Card className="flex flex-col items-center gap-3 p-10 text-center">
      <Rocket className="size-8 text-indigo-600" aria-hidden />
      <h2 className="text-xl font-semibold">Your interview journey starts here.</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Complete your first AI mock interview to unlock personalized feedback, skill analytics, and progress tracking.
      </p>
      <Button asChild className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <Link href="/interview">Start Your First Interview</Link>
      </Button>
    </Card>
  );
}

export function SectionEmpty({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{children}</p>;
}

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard" className="space-y-6">
      <Skeleton className="h-28 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    </div>
  );
}
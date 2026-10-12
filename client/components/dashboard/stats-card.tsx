// src/components/dashboard/stats-card.tsx
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: string;
  icon: React.ReactNode;
  delta?: number | null;       // hidden unless a real comparison exists
  deltaSuffix?: string;
  caption?: string;
}

export function StatsCard({ label, value, icon, delta, deltaSuffix = '', caption }: Props) {
  const hasDelta = typeof delta === 'number';
  const up = hasDelta && delta >= 0;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        <span aria-hidden>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <div className="mt-1 min-h-5 text-xs">
        {hasDelta ? (
          <span className={cn('inline-flex items-center gap-1 font-medium', up ? 'text-emerald-600' : 'text-red-600')}>
            {up ? <ArrowUpRight className="size-3" aria-hidden /> : <ArrowDownRight className="size-3" aria-hidden />}
            <span className="sr-only">{up ? 'Up' : 'Down'} </span>
            {up ? '+' : ''}{delta}{deltaSuffix}
          </span>
        ) : (
          caption && <span className="text-muted-foreground">{caption}</span>
        )}
      </div>
    </Card>
  );
}
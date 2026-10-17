// src/components/dashboard/quick-action-card.tsx
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function QuickActionCard({ href, icon: Icon, title, description }: { href: string; icon: LucideIcon; title: string; description: string }) {
  return (
    <Link href={href} className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card className="h-full p-4 transition-colors hover:bg-muted/50">
        <Icon className="mb-2 size-5 text-indigo-600" aria-hidden />
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </Card>
    </Link>
  );
}
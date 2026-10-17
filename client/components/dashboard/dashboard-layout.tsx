// src/components/dashboard/dashboard-layout.tsx
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import {
  Bell, BrainCircuit, ChevronsLeft, ChevronsRight, FileText, LayoutDashboard, LifeBuoy, ListChecks,
  LineChart, LogOut, Menu, Moon, Play, Search, Settings, Sparkles, Sun, Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/interview', label: 'Start Interview', icon: Play },
  { href: '/history', label: 'My Interviews', icon: ListChecks },
  { href: '/analytics', label: 'Performance Analytics', icon: LineChart },
  { href: '/skills', label: 'Skill Development', icon: Target },
  { href: '/recommendations', label: 'AI Recommendations', icon: Sparkles },
  { href: '/profile', label: 'Resume & Job Profiles', icon: FileText },
];
const BOTTOM = [
  { href: '/support', label: 'Help & Support', icon: LifeBuoy },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function NavLink({ item, collapsed, active }: { item: (typeof NAV)[number]; collapsed: boolean; active: boolean }) {
  const link = (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors',
        'hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active && 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
        collapsed && 'justify-center px-2',
      )}
    >
      <item.icon className="size-4 shrink-0" aria-hidden />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {collapsed && <span className="sr-only">{item.label}</span>}
    </Link>
  );
  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function SidebarBody({ collapsed, user, onLogout }: { collapsed: boolean; user: { name: string; email: string }; onLogout: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-14 items-center gap-2 border-b px-4', collapsed && 'justify-center px-2')}>
        <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
          <BrainCircuit className="size-4" aria-hidden />
        </span>
        {!collapsed && <span className="font-semibold tracking-tight">AI InterviewPro</span>}
      </div>
      <nav aria-label="Main" className="flex-1 space-y-1 p-3">
        {NAV.map((i) => <NavLink key={i.href} item={i} collapsed={collapsed} active={isActive(i.href)} />)}
      </nav>
      <div className="space-y-1 border-t p-3">
        {BOTTOM.map((i) => <NavLink key={i.href} item={i} collapsed={collapsed} active={isActive(i.href)} />)}
        <div className={cn('flex items-center gap-3 rounded-md px-3 py-2', collapsed && 'justify-center px-2')}>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}
        </div>
        <Button variant="ghost" size={collapsed ? 'icon' : 'sm'} className={cn(!collapsed && 'w-full justify-start gap-3')} onClick={onLogout} aria-label="Log out">
          <LogOut className="size-4" aria-hidden />{!collapsed && 'Logout'}
        </Button>
      </div>
    </div>
  );
}

export function DashboardLayout({ user, children }: { user: { name: string; email: string }; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const title = NAV.find((n) => pathname.startsWith(n.href))?.label ?? 'Dashboard';

  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } finally { router.replace('/login'); router.refresh(); }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <aside className={cn('fixed inset-y-0 left-0 z-30 hidden border-r bg-white transition-[width] motion-reduce:transition-none dark:bg-slate-900 md:block', collapsed ? 'w-16' : 'w-64')}>
          <SidebarBody collapsed={collapsed} user={user} onLogout={logout} />
          <Button
            variant="outline" size="icon" onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="absolute -right-3 top-16 size-6 rounded-full bg-white dark:bg-slate-900"
          >
            {collapsed ? <ChevronsRight className="size-3" /> : <ChevronsLeft className="size-3" />}
          </Button>
        </aside>

        <div className={cn('transition-[padding] motion-reduce:transition-none', collapsed ? 'md:pl-16' : 'md:pl-64')}>
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-white/90 px-4 backdrop-blur dark:bg-slate-900/90">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation"><Menu className="size-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarBody collapsed={false} user={user} onLogout={logout} />
              </SheetContent>
            </Sheet>
            <h1 className="truncate text-sm font-semibold">{title}</h1>
            <div className="ml-auto flex items-center gap-1">
              <Button variant="outline" size="sm" className="hidden gap-2 text-muted-foreground sm:flex" aria-label="Search">
                <Search className="size-4" /> Search
              </Button>
              <Button variant="ghost" size="icon" aria-label="Notifications"><Bell className="size-4" /></Button>
              <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
                <Sun className="size-4 dark:hidden" /><Moon className="hidden size-4 dark:block" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                    <span className="grid size-7 place-items-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">{user.name.slice(0, 1).toUpperCase()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button asChild size="sm" className="ml-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90">
                <Link href="/interview"><Play className="size-4" /><span className="hidden sm:inline">Start Interview</span></Link>
              </Button>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
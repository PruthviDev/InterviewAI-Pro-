import { requireUser } from '@/lib/dal';
import { Providers } from '@/components/providers';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <Providers>
      <DashboardLayout user={{ name: user.name, email: user.email }}>{children}</DashboardLayout>
    </Providers>
  );
}

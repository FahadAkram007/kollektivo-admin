import { Suspense } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { AdminShell } from '@/features/shell/admin-shell';

/**
 * The shell reads the current address (active menu entry) and detail pages read their id, which aren't known
 * when Next.js prerenders routes like /laeden/[partnerId]: hence the Suspense boundary.
 */
export default function AdminLayout({ children }: LayoutProps<'/'>) {
  return (
    <Suspense fallback={<Spinner />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

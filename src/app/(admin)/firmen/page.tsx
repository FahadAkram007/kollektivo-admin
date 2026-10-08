import type { Metadata } from 'next';

import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = { title: 'Firmen' };

// TODO(admin): built in the next steps of the admin portal plan.
export default function Page() {
  return (
    <>
      <PageHeader title="Firmen" />
      <p className="px-4 text-ink-muted md:px-8">Folgt in Kürze.</p>
    </>
  );
}

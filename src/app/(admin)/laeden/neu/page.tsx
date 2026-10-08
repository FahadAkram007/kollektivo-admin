import type { Metadata } from 'next';

import { PageHeader } from '@/components/ui/page-header';
import { NewShopScreen } from '@/features/shops/new-shop-screen';

export const metadata: Metadata = { title: 'Neuer Laden' };

export default function Page() {
  return (
    <>
      <PageHeader title="Neuer Laden" />
      <NewShopScreen />
    </>
  );
}

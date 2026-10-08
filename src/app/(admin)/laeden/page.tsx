import type { Metadata } from 'next';

import { PageHeader } from '@/components/ui/page-header';
import { ShopListScreen } from '@/features/shops/shop-list-screen';

export const metadata: Metadata = { title: 'Läden' };

export default function Page() {
  return (
    <>
      <PageHeader title="Läden" />
      <ShopListScreen />
    </>
  );
}

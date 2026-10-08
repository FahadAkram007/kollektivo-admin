import type { Metadata } from 'next';

import { ShopDetailScreen } from '@/features/shops/shop-detail-screen';

export const metadata: Metadata = { title: 'Laden' };

export default function ShopPage() {
  return (
    <div className="pt-6">
      <ShopDetailScreen />
    </div>
  );
}

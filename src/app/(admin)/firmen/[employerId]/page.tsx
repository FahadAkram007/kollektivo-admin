import type { Metadata } from 'next';

import { CompanyDetailScreen } from '@/features/companies/company-detail-screen';

export const metadata: Metadata = { title: 'Firma' };

export default function CompanyPage() {
  return (
    <div className="pt-6">
      <CompanyDetailScreen />
    </div>
  );
}

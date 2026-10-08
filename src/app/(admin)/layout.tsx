import { AdminShell } from '@/features/shell/admin-shell';

export default function AdminLayout({ children }: LayoutProps<'/'>) {
  return <AdminShell>{children}</AdminShell>;
}

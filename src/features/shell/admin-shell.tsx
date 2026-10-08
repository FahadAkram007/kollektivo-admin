'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect } from 'react';

import { Logo } from '@/components/ui/logo';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/features/auth/auth-provider';

import { SearchBox } from '@/features/search/search-box';

import { adminMeQuery, type AdminMe } from './admin-api';
import { navFor, ROLE_LABELS } from './admin-nav';

const AdminContext = createContext<AdminMe | null>(null);

/** Sends visitors without a valid admin session (also after 12 hours) to /anmelden; menu by role. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, signOut } = useAuth();
  const me = useQuery({ ...adminMeQuery, enabled: state.status === 'signed-in' });

  useEffect(() => {
    if (state.status === 'signed-out') router.replace('/anmelden');
    // The API refuses the session (expired after 12 h, or no longer admin): sign out completely.
    if (me.isError) void signOut().then(() => router.replace('/anmelden'));
  }, [state.status, me.isError, router, signOut]);

  if (state.status !== 'signed-in' || !me.data) return <Spinner />;

  const ends = new Date(me.data.sessionEndsAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const linkClass = (href: string) =>
    (href === '/' ? pathname === '/' : pathname.startsWith(href))
      ? 'bg-surface font-bold text-brand-purple'
      : 'text-ink hover:bg-surface';

  return (
    <AdminContext value={me.data}>
      <div className="flex flex-1">
        <aside className="flex w-56 shrink-0 flex-col gap-4 border-r border-line p-4">
          <div>
            <Logo height={26} />
            <p className="mt-1 text-xs font-bold tracking-wide text-brand-red">ADMIN</p>
          </div>
          {(me.data.role === 'admin' || me.data.role === 'support') && <SearchBox clearOnPick />}
          <nav className="flex flex-col gap-1">
            {navFor(me.data.role).map((item) => (
              <Link key={item.href} href={item.href} className={`rounded-lg px-3 py-2 text-sm ${linkClass(item.href)}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-1 text-xs text-ink-muted">
            <span className="truncate font-medium text-ink">
              {me.data.firstName} {me.data.lastName}
            </span>
            <span>
              {ROLE_LABELS[me.data.role]} · Sitzung bis {ends}
            </span>
            <button className="text-left text-brand-purple hover:underline" onClick={() => void signOut()}>
              Abmelden
            </button>
          </div>
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </AdminContext>
  );
}

export function useAdmin(): AdminMe {
  const value = useContext(AdminContext);
  if (!value) throw new Error('useAdmin needs an <AdminShell>');
  return value;
}

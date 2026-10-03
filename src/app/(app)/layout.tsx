'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/format';
import { NAV } from '@/lib/nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) return <p className="main muted">Chargement…</p>;

  const items = NAV.filter((n) => n.roles.includes(user.role));
  const current = NAV.find((n) => (n.href === '/' ? pathname === '/' : pathname.startsWith(n.href)));
  const forbidden = current && !current.roles.includes(user.role);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">RESERVITE</div>
        {items.map((n) => {
          const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href);
          return <Link key={n.href} href={n.href} className={active ? 'active' : ''}>{n.label}</Link>;
        })}
        <div className="who">
          <strong>{user.name}</strong>
          <div>{ROLE_LABELS[user.role]}</div>
          <button onClick={async () => { await logout(); router.replace('/login'); }}>Se déconnecter</button>
        </div>
      </aside>
      <main className="main">{forbidden ? <p>Cette page n'est pas accessible avec votre rôle.</p> : children}</main>
    </div>
  );
}

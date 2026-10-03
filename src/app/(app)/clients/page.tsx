'use client';

import { Alert, Empty, Loading, PageHead } from '@/components/ui';
import { dateOnly } from '@/lib/format';
import { useFetch } from '@/lib/useFetch';

export default function ClientsPage() {
  const { data, error, loading } = useFetch<any[]>('/clients');
  return (
    <>
      <PageHead title="Clients" subtitle="Clients inscrits (pour une compagnie : ceux qui ont réservé chez elle)" />
      {error && <Alert>{error}</Alert>}
      {loading && !data ? <Loading /> : !data?.length ? <Empty>Aucun client.</Empty> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Nom</th><th>E-mail</th><th>Téléphone</th><th>Inscrit le</th></tr></thead>
          <tbody>{data.map((c) => <tr key={c.id}><td><strong>{c.name}</strong></td><td>{c.email}</td><td>{c.phone ?? '—'}</td><td>{dateOnly(c.createdAt)}</td></tr>)}</tbody>
        </table></div>
      )}
    </>
  );
}

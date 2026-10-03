'use client';

import { ResourcePage } from '@/components/ResourcePage';
import { Badge } from '@/components/ui';
import { fcfa } from '@/lib/format';

export default function TrajetsPage() {
  return (
    <ResourcePage
      title="Trajets" subtitle="Les liaisons proposées par votre compagnie" endpoint="/trajets" singular="Trajet"
      columns={[
        { label: 'Départ', render: (r) => <strong>{r.fromCity}</strong> },
        { label: 'Arrivée', render: (r) => <strong>{r.toCity}</strong> },
        { label: 'Prix de base', render: (r) => fcfa(r.basePrice) },
        { label: 'Durée', render: (r) => (r.durationMin ? `${Math.floor(r.durationMin / 60)} h ${String(r.durationMin % 60).padStart(2, '0')}` : '—') },
        { label: 'Statut', render: (r) => <Badge tone={r.isActive ? 'ok' : 'bad'}>{r.isActive ? 'Actif' : 'Inactif'}</Badge> },
      ]}
      fields={[
        { name: 'fromCity', label: 'Ville de départ', required: true },
        { name: 'toCity', label: "Ville d'arrivée", required: true },
        { name: 'basePrice', label: 'Prix de base (FCFA)', type: 'number', required: true },
        { name: 'durationMin', label: 'Durée (minutes)', type: 'number' },
      ]}
    />
  );
}

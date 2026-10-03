'use client';

import { ResourcePage } from '@/components/ResourcePage';

export default function GaresPage() {
  return (
    <ResourcePage
      title="Gares" subtitle="Les gares de votre compagnie" endpoint="/gares" singular="Gare"
      columns={[
        { label: 'Nom', render: (r) => <strong>{r.name}</strong> },
        { label: 'Ville', render: (r) => r.city },
        { label: 'Adresse', render: (r) => r.address ?? '—' },
      ]}
      fields={[
        { name: 'name', label: 'Nom de la gare', required: true },
        { name: 'city', label: 'Ville', required: true },
        { name: 'address', label: 'Adresse' },
      ]}
    />
  );
}

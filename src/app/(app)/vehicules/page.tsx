'use client';

import { ResourcePage } from '@/components/ResourcePage';
import { Badge } from '@/components/ui';

export default function VehiculesPage() {
  return (
    <ResourcePage
      title="Véhicules" subtitle="La flotte de votre compagnie" endpoint="/vehicules" singular="Véhicule"
      columns={[
        { label: 'Immatriculation', render: (r) => <strong>{r.plate}</strong> },
        { label: 'Modèle', render: (r) => r.model ?? '—' },
        { label: 'Places', render: (r) => r.capacity },
        { label: 'Statut', render: (r) => <Badge tone={r.isActive ? 'ok' : 'bad'}>{r.isActive ? 'En service' : 'Hors service'}</Badge> },
      ]}
      fields={[
        { name: 'plate', label: 'Immatriculation', required: true },
        { name: 'model', label: 'Modèle' },
        { name: 'capacity', label: 'Nombre de places', type: 'number', required: true },
      ]}
    />
  );
}

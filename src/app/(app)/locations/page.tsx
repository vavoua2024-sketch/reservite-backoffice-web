'use client';

import { FormEvent, useState } from 'react';
import { ResourcePage } from '@/components/ResourcePage';
import { Alert, Badge, Empty, Field, Loading, Modal, PageHead } from '@/components/ui';
import { api } from '@/lib/api';
import { dateOnly, fcfa, OFFER_STATUS } from '@/lib/format';
import { useFetch } from '@/lib/useFetch';

function Offers() {
  const { data, error, loading, reload } = useFetch<any[]>('/proforma');
  const fleet = useFetch<any[]>('/rental-vehicles');
  const [target, setTarget] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const respond = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await api.post(`/proforma/offers/${target.id}/respond`, { price: Number(form.price), message: form.message || undefined, rentalVehicleId: form.rentalVehicleId || undefined });
      setTarget(null);
      setNotice('Offre envoyée au client.');
      reload();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const refuse = async (o: any) => {
    setErr(null);
    try {
      await api.post(`/proforma/offers/${o.id}/refuse`);
      reload();
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const tone = (s: string) => (s === 'ACCEPTED' ? 'ok' : s === 'REFUSED' ? 'bad' : s === 'PENDING' ? 'warn' : undefined);

  return (
    <>
      <h2>Demandes de location reçues</h2>
      {notice && <Alert kind="ok">{notice}</Alert>}
      {(error || err) && <Alert>{err ?? error}</Alert>}
      {loading && !data ? <Loading /> : !data?.length ? <Empty>Aucune demande pour le moment.</Empty> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Client</th><th>Période</th><th>Passagers</th><th>Détails</th><th>Mon offre</th><th>Statut</th><th /></tr></thead>
          <tbody>{data.map((o) => (
            <tr key={o.id}>
              <td>{o.proforma.client.name}<div className="muted">{o.proforma.client.phone}</div></td>
              <td>{dateOnly(o.proforma.startDate)} → {dateOnly(o.proforma.endDate)}</td>
              <td>{o.proforma.passengers}</td>
              <td>{o.proforma.details ?? '—'}</td>
              <td>{o.price != null ? fcfa(o.price) : '—'}{o.rentalVehicle && <div className="muted">{o.rentalVehicle.name}</div>}</td>
              <td><Badge tone={tone(o.status)}>{OFFER_STATUS[o.status]}</Badge></td>
              <td className="actions">
                {o.proforma.status === 'OPEN' && ['PENDING', 'OFFERED'].includes(o.status) && (
                  <>
                    <button className="small primary" onClick={() => { setTarget(o); setForm({ price: o.price != null ? String(o.price) : '', message: o.message ?? '' }); setFormError(null); }}>{o.status === 'PENDING' ? 'Répondre' : 'Modifier'}</button>
                    <button className="small danger" onClick={() => refuse(o)}>Décliner</button>
                  </>
                )}
              </td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {target && (
        <Modal title="Répondre à la demande" onClose={() => setTarget(null)}>
          <form onSubmit={respond}>
            {formError && <Alert>{formError}</Alert>}
            <p className="muted">{target.proforma.passengers} passagers, du {dateOnly(target.proforma.startDate)} au {dateOnly(target.proforma.endDate)}.</p>
            <Field label="Prix proposé (FCFA)"><input type="number" min={0} required value={form.price ?? ''} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
            <Field label="Véhicule proposé">
              <select value={form.rentalVehicleId ?? ''} onChange={(e) => setForm({ ...form, rentalVehicleId: e.target.value })}>
                <option value="">Non précisé</option>
                {fleet.data?.filter((v) => v.isActive).map((v) => <option key={v.id} value={v.id}>{v.name} ({v.seats} places)</option>)}
              </select>
            </Field>
            <Field label="Message au client"><input value={form.message ?? ''} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field>
            <div className="modal-foot">
              <button type="button" onClick={() => setTarget(null)}>Annuler</button>
              <button className="primary" disabled={busy}>{busy ? 'Envoi…' : "Envoyer l'offre"}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export default function LocationsPage() {
  return (
    <>
      <PageHead title="Locations de véhicules" subtitle="Demandes des clients et flotte de location" />
      <Offers />
      <div style={{ marginTop: 36 }}>
        <ResourcePage
          title="Flotte de location" endpoint="/rental-vehicles" singular="Véhicule de location"
          columns={[
            { label: 'Nom', render: (r) => <strong>{r.name}</strong> },
            { label: 'Type', render: (r) => r.type },
            { label: 'Places', render: (r) => r.seats },
            { label: 'Tarif par jour', render: (r) => fcfa(r.pricePerDay) },
          ]}
          fields={[
            { name: 'name', label: 'Nom', required: true },
            { name: 'type', label: 'Type (autocar, minibus…)', required: true },
            { name: 'seats', label: 'Nombre de places', type: 'number', required: true },
            { name: 'pricePerDay', label: 'Tarif par jour (FCFA)', type: 'number', required: true },
          ]}
        />
      </div>
    </>
  );
}

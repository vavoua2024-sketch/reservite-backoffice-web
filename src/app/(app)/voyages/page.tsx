'use client';

import { FormEvent, useState } from 'react';
import { Alert, Badge, Empty, Field, Loading, Modal, PageHead, voyageTone } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { dateTime, fcfa, localToIso, VOYAGE_STATUS } from '@/lib/format';
import { useFetch } from '@/lib/useFetch';

export default function VoyagesPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const { data, error, loading, reload } = useFetch<any[]>(`/voyages${status ? `?status=${status}` : ''}`);
  const trajets = useFetch<any[]>('/trajets');
  const vehicules = useFetch<any[]>('/vehicules');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [passengers, setPassengers] = useState<{ voyage: any; list: any[] } | null>(null);

  const canCancel = user?.role === 'COMPANY_ADMIN' || user?.role === 'GARE_MANAGER';

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await api.post('/voyages', {
        trajetId: form.trajetId, vehiculeId: form.vehiculeId, departureAt: localToIso(form.departureAt),
        price: form.price ? Number(form.price) : undefined,
      });
      setOpen(false);
      setForm({});
      setNotice('Voyage créé en brouillon. Publiez-le pour le rendre réservable.');
      reload();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const act = async (label: string, fn: () => Promise<unknown>) => {
    setErr(null);
    try {
      await fn();
      setNotice(label);
      reload();
    } catch (e: any) {
      setNotice(null);
      setErr(e.message);
    }
  };

  const showPassengers = async (v: any) => setPassengers({ voyage: v, list: await api.get(`/voyages/${v.id}/tickets`) });

  return (
    <>
      <PageHead title="Voyages" subtitle="Départs programmés de votre compagnie">
        <button className="primary" onClick={() => { setOpen(true); setFormError(null); }}>+ Nouveau voyage</button>
      </PageHead>
      {notice && <Alert kind="ok">{notice}</Alert>}
      {(error || err) && <Alert>{err ?? error}</Alert>}
      <div className="filters">
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrer par statut">
          <option value="">Tous les statuts</option>
          {Object.entries(VOYAGE_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {loading && !data ? <Loading /> : !data?.length ? <Empty>Aucun voyage.</Empty> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Départ</th><th>Trajet</th><th>Véhicule</th><th>Prix</th><th>Places libres</th><th>Statut</th><th /></tr></thead>
          <tbody>{data.map((v) => (
            <tr key={v.id}>
              <td>{dateTime(v.departureAt)}</td>
              <td><strong>{v.trajet.fromCity} → {v.trajet.toCity}</strong></td>
              <td>{v.vehicule.plate}</td>
              <td>{fcfa(v.price)}</td>
              <td>{v.seatsAvailable} / {v.seatsTotal}</td>
              <td><Badge tone={voyageTone(v.status)}>{VOYAGE_STATUS[v.status]}</Badge></td>
              <td className="actions">
                {v.status === 'DRAFT' && <button className="small primary" onClick={() => act('Voyage publié.', () => api.post(`/voyages/${v.id}/publish`))}>Publier</button>}
                {v.status !== 'DRAFT' && <button className="small" onClick={() => showPassengers(v)}>Passagers</button>}
                {canCancel && ['DRAFT', 'PUBLISHED'].includes(v.status) && (
                  <button className="small danger" onClick={() => window.confirm('Annuler ce voyage ? Tous les billets seront annulés et remboursables.') && act('Voyage annulé.', () => api.post(`/voyages/${v.id}/cancel`))}>Annuler</button>
                )}
              </td>
            </tr>
          ))}</tbody>
        </table></div>
      )}

      {open && (
        <Modal title="Nouveau voyage" onClose={() => setOpen(false)}>
          <form onSubmit={create}>
            {formError && <Alert>{formError}</Alert>}
            <Field label="Trajet">
              <select required value={form.trajetId ?? ''} onChange={(e) => {
                const t = trajets.data?.find((x) => x.id === e.target.value);
                setForm({ ...form, trajetId: e.target.value, price: t ? String(t.basePrice) : form.price ?? '' });
              }}>
                <option value="">Choisir…</option>
                {trajets.data?.filter((t) => t.isActive).map((t) => <option key={t.id} value={t.id}>{t.fromCity} → {t.toCity}</option>)}
              </select>
            </Field>
            <Field label="Véhicule">
              <select required value={form.vehiculeId ?? ''} onChange={(e) => setForm({ ...form, vehiculeId: e.target.value })}>
                <option value="">Choisir…</option>
                {vehicules.data?.filter((v) => v.isActive).map((v) => <option key={v.id} value={v.id}>{v.plate} ({v.capacity} places)</option>)}
              </select>
            </Field>
            <div className="row">
              <Field label="Date et heure de départ"><input type="datetime-local" required value={form.departureAt ?? ''} onChange={(e) => setForm({ ...form, departureAt: e.target.value })} /></Field>
              <Field label="Prix par place (FCFA)"><input type="number" min={0} value={form.price ?? ''} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
            </div>
            <div className="modal-foot">
              <button type="button" onClick={() => setOpen(false)}>Annuler</button>
              <button className="primary" disabled={busy}>{busy ? 'Création…' : 'Créer le brouillon'}</button>
            </div>
          </form>
        </Modal>
      )}

      {passengers && (
        <Modal wide title={`Passagers : ${passengers.voyage.trajet.fromCity} → ${passengers.voyage.trajet.toCity}, ${dateTime(passengers.voyage.departureAt)}`} onClose={() => setPassengers(null)}>
          {passengers.list.length === 0 ? <Empty>Aucun billet.</Empty> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Place</th><th>Passager</th><th>Code</th><th>Statut</th></tr></thead>
              <tbody>{passengers.list.map((t) => (
                <tr key={t.id}>
                  <td>{t.seatNumber}</td>
                  <td>{t.passengerName || t.booking?.user?.name || t.booking?.customerName || '—'}</td>
                  <td className="code">{t.code}</td>
                  <td><Badge tone={t.status === 'SCANNED' ? 'ok' : t.status === 'VALID' ? undefined : 'warn'}>{{ VALID: 'Valide', SCANNED: 'Embarqué', PENDING: 'En attente' }[t.status as string] ?? t.status}</Badge></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
          <div className="modal-foot"><button onClick={() => setPassengers(null)}>Fermer</button></div>
        </Modal>
      )}
    </>
  );
}

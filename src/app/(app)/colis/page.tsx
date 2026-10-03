'use client';

import { FormEvent, useState } from 'react';
import { Alert, Badge, Empty, Field, Loading, Modal, PageHead } from '@/components/ui';
import { api } from '@/lib/api';
import { COLIS_STATUS, dateTime, fcfa } from '@/lib/format';
import { useFetch } from '@/lib/useFetch';

const NEXT: Record<string, string | null> = { REGISTERED: 'IN_TRANSIT', IN_TRANSIT: 'ARRIVED', ARRIVED: 'DELIVERED', DELIVERED: null };

export default function ColisPage() {
  const { data, error, loading, reload } = useFetch<any[]>('/colis');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      const c = await api.post('/colis', {
        senderName: form.senderName, senderPhone: form.senderPhone, receiverName: form.receiverName, receiverPhone: form.receiverPhone,
        originCity: form.originCity, destCity: form.destCity, price: Number(form.price || 0),
        description: form.description || undefined, weightKg: form.weightKg ? Number(form.weightKg) : undefined,
      });
      setOpen(false);
      setForm({});
      setNotice(`Colis enregistré. Code de suivi : ${c.trackingCode} (envoyé par SMS à l'expéditeur et au destinataire).`);
      reload();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const advance = async (c: any) => {
    setErr(null);
    try {
      await api.patch(`/colis/${c.id}/status`, { status: NEXT[c.status] });
      reload();
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const tone = (s: string) => (s === 'DELIVERED' ? 'ok' : s === 'ARRIVED' ? 'warn' : undefined);

  return (
    <>
      <PageHead title="Colis & bagages" subtitle="Enregistrement et suivi des colis">
        <button className="primary" onClick={() => { setOpen(true); setFormError(null); }}>+ Nouveau colis</button>
      </PageHead>
      {notice && <Alert kind="ok">{notice}</Alert>}
      {(error || err) && <Alert>{err ?? error}</Alert>}
      {loading && !data ? <Loading /> : !data?.length ? <Empty>Aucun colis.</Empty> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Code</th><th>Trajet</th><th>Expéditeur</th><th>Destinataire</th><th>Prix</th><th>Statut</th><th /></tr></thead>
          <tbody>{data.map((c) => (
            <tr key={c.id}>
              <td className="code">{c.trackingCode}</td>
              <td>{c.originCity} → {c.destCity}</td>
              <td>{c.senderName}<div className="muted">{c.senderPhone}</div></td>
              <td>{c.receiverName}<div className="muted">{c.receiverPhone}</div></td>
              <td>{fcfa(c.price)}</td>
              <td><Badge tone={tone(c.status)}>{COLIS_STATUS[c.status]}</Badge></td>
              <td className="actions">
                {NEXT[c.status] && <button className="small primary" onClick={() => advance(c)}>→ {COLIS_STATUS[NEXT[c.status]!]}</button>}
                <button className="small" onClick={async () => setDetail(await api.get(`/colis/${c.id}`))}>Historique</button>
              </td>
            </tr>
          ))}</tbody>
        </table></div>
      )}

      {open && (
        <Modal wide title="Nouveau colis" onClose={() => setOpen(false)}>
          <form onSubmit={create}>
            {formError && <Alert>{formError}</Alert>}
            <div className="row">
              <Field label="Expéditeur"><input required value={form.senderName ?? ''} onChange={set('senderName')} /></Field>
              <Field label="Téléphone expéditeur"><input type="tel" required minLength={6} value={form.senderPhone ?? ''} onChange={set('senderPhone')} /></Field>
            </div>
            <div className="row">
              <Field label="Destinataire"><input required value={form.receiverName ?? ''} onChange={set('receiverName')} /></Field>
              <Field label="Téléphone destinataire"><input type="tel" required minLength={6} value={form.receiverPhone ?? ''} onChange={set('receiverPhone')} /></Field>
            </div>
            <div className="row">
              <Field label="Ville de départ"><input required value={form.originCity ?? ''} onChange={set('originCity')} /></Field>
              <Field label="Ville d'arrivée"><input required value={form.destCity ?? ''} onChange={set('destCity')} /></Field>
            </div>
            <div className="row">
              <Field label="Prix (FCFA)"><input type="number" min={0} required value={form.price ?? ''} onChange={set('price')} /></Field>
              <Field label="Poids (kg)"><input type="number" min={0} step="0.1" value={form.weightKg ?? ''} onChange={set('weightKg')} /></Field>
            </div>
            <Field label="Description"><input value={form.description ?? ''} onChange={set('description')} /></Field>
            <div className="modal-foot">
              <button type="button" onClick={() => setOpen(false)}>Annuler</button>
              <button className="primary" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
            </div>
          </form>
        </Modal>
      )}

      {detail && (
        <Modal wide title={`Colis ${detail.trackingCode}`} onClose={() => setDetail(null)}>
          <h2>Étapes</h2>
          <ul>{detail.events.map((e: any) => <li key={e.id}>{dateTime(e.createdAt)} : <strong>{COLIS_STATUS[e.status]}</strong>{e.note ? ` (${e.note})` : ''}</li>)}</ul>
          <h2>SMS envoyés</h2>
          {detail.sms.length === 0 ? <p className="muted">Aucun SMS.</p> : (
            <ul>{detail.sms.map((s: any) => <li key={s.id}>{dateTime(s.createdAt)} → {s.to} : {s.body} <Badge>{s.status === 'LOGGED' ? 'Simulé' : s.status}</Badge></li>)}</ul>
          )}
          <div className="modal-foot"><button onClick={() => setDetail(null)}>Fermer</button></div>
        </Modal>
      )}
    </>
  );
}

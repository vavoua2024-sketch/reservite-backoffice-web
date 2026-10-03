'use client';

import { FormEvent, useState } from 'react';
import { Alert, Empty, Field, Loading, PageHead } from '@/components/ui';
import { api } from '@/lib/api';
import { dateTime, fcfa } from '@/lib/format';
import { useFetch } from '@/lib/useFetch';

export default function GuichetPage() {
  const { data, error, loading, reload } = useFetch<any[]>('/voyages?status=PUBLISHED');
  const [voyageId, setVoyageId] = useState('');
  const [seats, setSeats] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [names, setNames] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sale, setSale] = useState<any | null>(null);

  const upcoming = data?.filter((v) => new Date(v.departureAt) > new Date() && v.seatsAvailable > 0) ?? [];
  const voyage = upcoming.find((v) => v.id === voyageId);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await api.post('/tickets/book', {
        voyageId, seats, paymentMethod: 'CASH', customerName: customerName || undefined, customerPhone: customerPhone || undefined,
        passengers: names.slice(0, seats).map((n) => n.trim()).filter(Boolean).length === seats ? names.slice(0, seats).map((n) => n.trim()) : undefined,
      });
      setSale(res);
      reload();
    } catch (e: any) {
      setErr(e.message);
      reload(); // une place a pu être prise entre-temps : on réaffiche les places réelles
    } finally {
      setBusy(false);
    }
  };

  const reset = () => { setSale(null); setSeats(1); setNames([]); setCustomerName(''); setCustomerPhone(''); };

  if (sale) {
    return (
      <>
        <PageHead title="Vente enregistrée" subtitle="Remettez les billets au client">
          <button className="no-print" onClick={() => window.print()}>Imprimer</button>
          <button className="primary no-print" onClick={reset}>Nouvelle vente</button>
        </PageHead>
        <div className="card">
          <p><strong>{sale.voyage.trajet.fromCity} → {sale.voyage.trajet.toCity}</strong>, départ le {dateTime(sale.voyage.departureAt)}</p>
          <p>Montant encaissé : <strong>{fcfa(sale.total)}</strong> <span className="muted">(dont {fcfa(sale.fee)} de frais de service)</span></p>
          <table>
            <thead><tr><th>Place</th><th>Passager</th><th>Code du billet (à scanner)</th></tr></thead>
            <tbody>{sale.tickets.map((t: any) => (
              <tr key={t.id}><td>{t.seatNumber}</td><td>{t.passengerName ?? '—'}</td><td className="code">{t.code}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Vente au guichet" subtitle="Vendre des billets payés en espèces" />
      {(error || err) && <Alert>{err ?? error}</Alert>}
      {loading && !data ? <Loading /> : upcoming.length === 0 ? <Empty>Aucun voyage publié avec des places disponibles.</Empty> : (
        <form className="card" onSubmit={submit} style={{ maxWidth: 640 }}>
          <Field label="Voyage">
            <select required value={voyageId} onChange={(e) => { setVoyageId(e.target.value); setSeats(1); }}>
              <option value="">Choisir un départ…</option>
              {upcoming.map((v) => (
                <option key={v.id} value={v.id}>{v.trajet.fromCity} → {v.trajet.toCity} · {dateTime(v.departureAt)} · {fcfa(v.price)} · {v.seatsAvailable} places</option>
              ))}
            </select>
          </Field>
          {voyage && (
            <>
              <Field label={`Nombre de places (max ${Math.min(10, voyage.seatsAvailable)})`}>
                <input type="number" min={1} max={Math.min(10, voyage.seatsAvailable)} required value={seats} onChange={(e) => setSeats(Math.max(1, Number(e.target.value)))} />
              </Field>
              <div className="row">
                <Field label="Nom du client (optionnel)"><input value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></Field>
                <Field label="Téléphone (optionnel)"><input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} /></Field>
              </div>
              {seats > 1 && seats <= 10 && Array.from({ length: seats }, (_, i) => (
                <Field key={i} label={`Nom du passager ${i + 1} (optionnel)`}>
                  <input value={names[i] ?? ''} onChange={(e) => { const n = [...names]; n[i] = e.target.value; setNames(n); }} />
                </Field>
              ))}
              <p>Total estimé : <strong>{fcfa(Math.round(voyage.price * seats * 1.05))}</strong> <span className="muted">(prix {fcfa(voyage.price * seats)} + 5 % de frais de service)</span></p>
              <button className="primary" disabled={busy}>{busy ? 'Enregistrement…' : 'Encaisser et émettre les billets'}</button>
            </>
          )}
        </form>
      )}
    </>
  );
}

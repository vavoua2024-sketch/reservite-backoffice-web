'use client';

import { FormEvent, useState } from 'react';
import { Alert, Badge, Field } from '@/components/ui';
import { api } from '@/lib/api';
import { COLIS_STATUS, dateTime } from '@/lib/format';

/** Suivi public d'un colis : aucune connexion requise. */
export default function SuiviPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await api.get(`/colis/track/${encodeURIComponent(code.trim())}`));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="card login-card" style={{ maxWidth: 480 }}>
        <div className="brand">RESERVITE</div>
        <h2>Suivre un colis</h2>
        <form onSubmit={submit}>
          <Field label="Code de suivi (ex. COL-AB12CD34)"><input required value={code} onChange={(e) => setCode(e.target.value)} /></Field>
          <button className="primary" style={{ width: '100%' }} disabled={busy}>{busy ? 'Recherche…' : 'Suivre'}</button>
        </form>
        {error && <div style={{ marginTop: 14 }}><Alert>{error}</Alert></div>}
        {result && (
          <div style={{ marginTop: 18 }}>
            <p><strong>{result.originCity} → {result.destCity}</strong> · {result.company}</p>
            <p>Statut : <Badge tone={result.status === 'DELIVERED' ? 'ok' : undefined}>{COLIS_STATUS[result.status]}</Badge></p>
            <ul>{result.events.map((e: any, i: number) => <li key={i}>{dateTime(e.createdAt)} : {COLIS_STATUS[e.status]}</li>)}</ul>
          </div>
        )}
        <p className="muted" style={{ fontSize: 13 }}><a href="/login">Espace professionnel</a></p>
      </div>
    </div>
  );
}

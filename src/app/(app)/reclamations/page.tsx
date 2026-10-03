'use client';

import { FormEvent, useState } from 'react';
import { Alert, Badge, Empty, Field, Loading, Modal, PageHead } from '@/components/ui';
import { api } from '@/lib/api';
import { dateTime, RECLAMATION_STATUS } from '@/lib/format';
import { useFetch } from '@/lib/useFetch';

export default function ReclamationsPage() {
  const { data, error, loading, reload } = useFetch<any[]>('/reclamations');
  const [target, setTarget] = useState<any | null>(null);
  const [status, setStatus] = useState('IN_PROGRESS');
  const [response, setResponse] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await api.patch(`/reclamations/${target.id}`, { status, response: response || undefined });
      setTarget(null);
      setNotice(response ? 'Réponse envoyée au client.' : 'Réclamation mise à jour.');
      reload();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const tone = (s: string) => (s === 'RESOLVED' ? 'ok' : s === 'OPEN' ? 'warn' : undefined);

  return (
    <>
      <PageHead title="Réclamations" subtitle="Réclamations déposées par les clients" />
      {notice && <Alert kind="ok">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}
      {loading && !data ? <Loading /> : !data?.length ? <Empty>Aucune réclamation.</Empty> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Date</th><th>Client</th><th>Objet</th><th>Message</th><th>Statut</th><th /></tr></thead>
          <tbody>{data.map((r) => (
            <tr key={r.id}>
              <td>{dateTime(r.createdAt)}</td>
              <td>{r.user.name}<div className="muted">{r.user.phone}</div></td>
              <td><strong>{r.subject}</strong>{r.company && <div className="muted">{r.company.name}</div>}</td>
              <td>{r.message}{r.response && <div className="muted">Réponse : {r.response}</div>}</td>
              <td><Badge tone={tone(r.status)}>{RECLAMATION_STATUS[r.status]}</Badge></td>
              <td><button className="small" onClick={() => { setTarget(r); setStatus(r.status === 'OPEN' ? 'IN_PROGRESS' : r.status); setResponse(''); setFormError(null); }}>Traiter</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {target && (
        <Modal title={`Traiter : ${target.subject}`} onClose={() => setTarget(null)}>
          <form onSubmit={submit}>
            {formError && <Alert>{formError}</Alert>}
            <p>{target.message}</p>
            <Field label="Statut">
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {Object.entries(RECLAMATION_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Réponse au client (envoyée en notification)"><textarea rows={3} value={response} onChange={(e) => setResponse(e.target.value)} /></Field>
            <div className="modal-foot">
              <button type="button" onClick={() => setTarget(null)}>Annuler</button>
              <button className="primary" disabled={busy}>{busy ? 'Envoi…' : 'Enregistrer'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

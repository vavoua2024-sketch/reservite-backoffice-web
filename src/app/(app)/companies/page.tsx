'use client';

import { FormEvent, useState } from 'react';
import { Alert, Badge, Empty, Field, Loading, Modal, PageHead } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';

export default function CompaniesPage() {
  const { data, error, loading, reload } = useFetch<any[]>('/companies');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await api.post('/companies', {
        name: form.name, phone: form.phone || undefined, email: form.email || undefined,
        admin: form.adminEmail ? { name: form.adminName, email: form.adminEmail, password: form.adminPassword, phone: form.adminPhone || undefined } : undefined,
      });
      setOpen(false);
      setForm({});
      setNotice('Compagnie créée.');
      reload();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (c: any) => {
    await api.patch(`/companies/${c.id}`, { isActive: !c.isActive });
    reload();
  };

  return (
    <>
      <PageHead title="Compagnies" subtitle="Les compagnies de transport présentes sur RESERVITE">
        <button className="primary" onClick={() => { setOpen(true); setFormError(null); }}>+ Nouvelle compagnie</button>
      </PageHead>
      {notice && <Alert kind="ok">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}
      {loading && !data ? <Loading /> : !data?.length ? <Empty>Aucune compagnie.</Empty> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Nom</th><th>Contact</th><th>Personnel</th><th>Gares</th><th>Trajets</th><th>Véhicules</th><th>Statut</th><th /></tr></thead>
          <tbody>{data.map((c) => (
            <tr key={c.id}>
              <td><strong>{c.name}</strong></td>
              <td>{c.phone ?? '—'}<div className="muted">{c.email}</div></td>
              <td>{c._count?.users}</td><td>{c._count?.gares}</td><td>{c._count?.trajets}</td><td>{c._count?.vehicules}</td>
              <td><Badge tone={c.isActive ? 'ok' : 'bad'}>{c.isActive ? 'Active' : 'Désactivée'}</Badge></td>
              <td><button className="small" onClick={() => toggle(c)}>{c.isActive ? 'Désactiver' : 'Réactiver'}</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {open && (
        <Modal title="Nouvelle compagnie" onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            {formError && <Alert>{formError}</Alert>}
            <Field label="Nom de la compagnie"><input required value={form.name ?? ''} onChange={set('name')} /></Field>
            <div className="row">
              <Field label="Téléphone"><input value={form.phone ?? ''} onChange={set('phone')} /></Field>
              <Field label="E-mail"><input type="email" value={form.email ?? ''} onChange={set('email')} /></Field>
            </div>
            <h2 style={{ marginTop: 8 }}>Compte Admin Compagnie (optionnel)</h2>
            <Field label="Nom"><input value={form.adminName ?? ''} onChange={set('adminName')} /></Field>
            <div className="row">
              <Field label="E-mail"><input type="email" value={form.adminEmail ?? ''} onChange={set('adminEmail')} /></Field>
              <Field label="Mot de passe (8 caractères min.)"><input type="password" minLength={8} value={form.adminPassword ?? ''} onChange={set('adminPassword')} /></Field>
            </div>
            <div className="modal-foot">
              <button type="button" onClick={() => setOpen(false)}>Annuler</button>
              <button className="primary" disabled={busy}>{busy ? 'Création…' : 'Créer'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

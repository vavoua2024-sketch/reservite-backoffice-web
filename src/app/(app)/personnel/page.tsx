'use client';

import { FormEvent, useState } from 'react';
import { Alert, Badge, Empty, Field, Loading, Modal, PageHead } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/format';
import { useFetch } from '@/lib/useFetch';

const MANAGEABLE = ['GARE_MANAGER', 'CASHIER', 'CONTROLLER', 'PARCEL_AGENT'];

export default function PersonnelPage() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useFetch<any[]>('/users');
  const companies = useFetch<any[]>(user?.role === 'SUPER_ADMIN' ? '/companies' : null);
  const gares = useFetch<any[]>(user?.role === 'COMPANY_ADMIN' ? '/gares' : null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ role: 'CASHIER' });
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'COMPANY_ADMIN';
  const roles = user?.role === 'SUPER_ADMIN' ? ['COMPANY_ADMIN', ...MANAGEABLE] : MANAGEABLE;
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await api.post('/users', {
        name: form.name, email: form.email, password: form.password, phone: form.phone || undefined,
        role: form.role, companyId: form.companyId || undefined, gareId: form.gareId || undefined,
      });
      setOpen(false);
      setForm({ role: 'CASHIER' });
      setNotice('Compte créé. Communiquez l\'adresse e-mail et le mot de passe à la personne.');
      reload();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (u: any) => {
    setErr(null);
    try {
      await api.patch(`/users/${u.id}`, { isActive: !u.isActive });
      reload();
    } catch (e: any) {
      setErr(e.message);
    }
  };

  return (
    <>
      <PageHead title="Personnel" subtitle={user?.role === 'SUPER_ADMIN' ? 'Comptes du personnel de toutes les compagnies' : 'Les comptes de votre compagnie'}>
        {canManage && <button className="primary" onClick={() => { setOpen(true); setFormError(null); }}>+ Nouveau compte</button>}
      </PageHead>
      {notice && <Alert kind="ok">{notice}</Alert>}
      {(error || err) && <Alert>{err ?? error}</Alert>}
      {loading && !data ? <Loading /> : !data?.length ? <Empty>Aucun compte.</Empty> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Nom</th><th>E-mail</th><th>Rôle</th><th>Statut</th>{canManage && <th />}</tr></thead>
          <tbody>{data.map((u) => (
            <tr key={u.id}>
              <td><strong>{u.name}</strong><div className="muted">{u.phone}</div></td>
              <td>{u.email}</td>
              <td>{ROLE_LABELS[u.role]}</td>
              <td><Badge tone={u.isActive ? 'ok' : 'bad'}>{u.isActive ? 'Actif' : 'Désactivé'}</Badge></td>
              {canManage && <td>{u.id !== user?.id && (user?.role === 'SUPER_ADMIN' || MANAGEABLE.includes(u.role)) && <button className="small" onClick={() => toggle(u)}>{u.isActive ? 'Désactiver' : 'Réactiver'}</button>}</td>}
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {open && (
        <Modal title="Nouveau compte du personnel" onClose={() => setOpen(false)}>
          <form onSubmit={create}>
            {formError && <Alert>{formError}</Alert>}
            <Field label="Nom complet"><input required value={form.name ?? ''} onChange={set('name')} /></Field>
            <div className="row">
              <Field label="E-mail"><input type="email" required value={form.email ?? ''} onChange={set('email')} /></Field>
              <Field label="Téléphone"><input type="tel" value={form.phone ?? ''} onChange={set('phone')} /></Field>
            </div>
            <Field label="Mot de passe (8 caractères min.)"><input type="password" required minLength={8} value={form.password ?? ''} onChange={set('password')} /></Field>
            <Field label="Rôle">
              <select value={form.role} onChange={set('role')}>{roles.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</select>
            </Field>
            {user?.role === 'SUPER_ADMIN' && (
              <Field label="Compagnie">
                <select required value={form.companyId ?? ''} onChange={set('companyId')}>
                  <option value="">Choisir…</option>
                  {companies.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            )}
            {user?.role === 'COMPANY_ADMIN' && (
              <Field label="Gare de rattachement (optionnel)">
                <select value={form.gareId ?? ''} onChange={set('gareId')}>
                  <option value="">Aucune</option>
                  {gares.data?.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </Field>
            )}
            <div className="modal-foot">
              <button type="button" onClick={() => setOpen(false)}>Annuler</button>
              <button className="primary" disabled={busy}>{busy ? 'Création…' : 'Créer le compte'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

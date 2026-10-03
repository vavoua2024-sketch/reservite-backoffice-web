'use client';

import { FormEvent, ReactNode, useState } from 'react';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { Alert, Empty, Field, Loading, Modal, PageHead } from './ui';

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'tel' | 'email';
  required?: boolean;
  /** Absent de la modification (ex. immatriculation fixée à la création). */
  createOnly?: boolean;
}
export interface ColumnDef {
  label: string;
  render: (row: any) => ReactNode;
}

/** Page de gestion générique : liste, création, modification, suppression d'une ressource de l'API. */
export function ResourcePage(props: {
  title: string;
  subtitle?: string;
  endpoint: string;
  columns: ColumnDef[];
  fields: FieldDef[];
  singular: string;
  readOnly?: boolean;
}) {
  const { data, error, loading, reload } = useFetch<any[]>(props.endpoint);
  const [editing, setEditing] = useState<any | 'new' | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const open = (row: any | 'new') => {
    setEditing(row);
    setFormError(null);
    setForm(row === 'new' ? {} : Object.fromEntries(props.fields.map((f) => [f.name, row[f.name] == null ? '' : String(row[f.name])])));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      const body: Record<string, unknown> = {};
      for (const f of props.fields) {
        if (editing !== 'new' && f.createOnly) continue;
        const v = form[f.name];
        if (v === undefined || v === '') continue;
        body[f.name] = f.type === 'number' ? Number(v) : v;
      }
      if (editing === 'new') await api.post(props.endpoint, body);
      else await api.patch(`${props.endpoint}/${editing.id}`, body);
      setEditing(null);
      setNotice(editing === 'new' ? 'Ajout effectué.' : 'Modification enregistrée.');
      reload();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row: any) => {
    if (!window.confirm('Supprimer cet élément ? Cette action est définitive.')) return;
    try {
      await api.del(`${props.endpoint}/${row.id}`);
      setNotice('Suppression effectuée.');
      reload();
    } catch (err: any) {
      setNotice(null);
      alert(err.message);
    }
  };

  return (
    <>
      <PageHead title={props.title} subtitle={props.subtitle}>
        {!props.readOnly && <button className="primary" onClick={() => open('new')}>+ Ajouter</button>}
      </PageHead>
      {notice && <Alert kind="ok">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}
      {loading && !data ? <Loading /> : !data || data.length === 0 ? <Empty>Aucun élément pour le moment.</Empty> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>{props.columns.map((c) => <th key={c.label}>{c.label}</th>)}{!props.readOnly && <th />}</tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  {props.columns.map((c) => <td key={c.label}>{c.render(row)}</td>)}
                  {!props.readOnly && (
                    <td className="actions">
                      <button className="small" onClick={() => open(row)}>Modifier</button>
                      <button className="small danger" onClick={() => remove(row)}>Supprimer</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <Modal title={editing === 'new' ? `Nouveau : ${props.singular}` : `Modifier : ${props.singular}`} onClose={() => setEditing(null)}>
          <form onSubmit={submit}>
            {formError && <Alert>{formError}</Alert>}
            {props.fields.filter((f) => editing === 'new' || !f.createOnly).map((f) => (
              <Field key={f.name} label={f.label}>
                <input type={f.type ?? 'text'} required={f.required} value={form[f.name] ?? ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
              </Field>
            ))}
            <div className="modal-foot">
              <button type="button" onClick={() => setEditing(null)}>Annuler</button>
              <button className="primary" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

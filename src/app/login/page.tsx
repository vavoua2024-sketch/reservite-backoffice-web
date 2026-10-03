'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Alert, Field } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/');
  }, [loading, user, router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      router.replace('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="card login-card" onSubmit={submit}>
        <div className="brand">RESERVITE</div>
        <p className="muted" style={{ marginTop: 0 }}>Espace professionnel : compagnies et administration</p>
        {error && <Alert>{error}</Alert>}
        <Field label="Adresse e-mail">
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Mot de passe">
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <button className="primary" style={{ width: '100%' }} disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
        <p className="muted" style={{ fontSize: 13, marginBottom: 0 }}>
          Vous cherchez un colis ? <a href="/suivi">Suivre un colis</a>
        </p>
      </form>
    </div>
  );
}

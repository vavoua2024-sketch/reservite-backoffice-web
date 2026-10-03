// Client HTTP de l'API RESERVITE : jeton Bearer, renouvellement automatique, erreurs lisibles.

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type Role = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'GARE_MANAGER' | 'CASHIER' | 'CONTROLLER' | 'PARCEL_AGENT' | 'CLIENT';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  companyId: string | null;
  gareId: string | null;
}

interface Session {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

const KEY = 'reservite.web.session';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export function loadSession(): Session | null {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null;
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(s: Session | null) {
  try {
    if (s) window.localStorage.setItem(KEY, JSON.stringify(s));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* stockage indisponible (navigation privée) : la session ne survivra pas au rechargement */
  }
}

let refreshing: Promise<boolean> | null = null;

async function refresh(): Promise<boolean> {
  const s = loadSession();
  if (!s) return false;
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: s.refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      saveSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
      return true;
    } catch {
      return false;
    } finally {
      setTimeout(() => (refreshing = null), 0);
    }
  })();
  return refreshing;
}

async function request<T>(method: string, path: string, body?: unknown, retry = true): Promise<T> {
  const session = loadSession();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Impossible de joindre le serveur. Vérifiez votre connexion.", 0);
  }

  if (res.status === 401 && retry && session && !path.startsWith('/auth/')) {
    if (await refresh()) return request<T>(method, path, body, false);
    saveSession(null);
    window.dispatchEvent(new Event('reservite:logout'));
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(data?.error || `Erreur ${res.status}`, res.status);
  return data as T;
}

export const api = {
  get: <T = any>(path: string) => request<T>('GET', path),
  post: <T = any>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  patch: <T = any>(path: string, body: unknown) => request<T>('PATCH', path, body),
  del: <T = any>(path: string) => request<T>('DELETE', path),
};

export async function loginStaff(email: string, password: string): Promise<SessionUser> {
  const data = await request<Session & { user: SessionUser }>('POST', '/auth/staff/login', { email, password });
  if (data.user.role === 'CONTROLLER') {
    throw new ApiError("Les contrôleurs utilisent l'application mobile RESERVITE.", 403);
  }
  saveSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
  return data.user;
}

export async function logoutStaff() {
  const s = loadSession();
  saveSession(null);
  if (s) await request('POST', '/auth/logout', { refreshToken: s.refreshToken }).catch(() => undefined);
}

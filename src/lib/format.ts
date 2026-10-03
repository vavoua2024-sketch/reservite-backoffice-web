export const fcfa = (n: number | null | undefined) => (n == null ? '—' : `${new Intl.NumberFormat('fr-FR').format(n)} FCFA`);

export const dateTime = (iso: string | null | undefined) =>
  iso ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) : '—';

export const dateOnly = (iso: string | null | undefined) =>
  iso ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(iso)) : '—';

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'SuperAdmin',
  COMPANY_ADMIN: 'Admin Compagnie',
  GARE_MANAGER: 'Gérant de gare',
  CASHIER: 'Caissier',
  CONTROLLER: 'Contrôleur',
  PARCEL_AGENT: 'Agent colis & bagages',
  CLIENT: 'Client',
};

export const VOYAGE_STATUS: Record<string, string> = { DRAFT: 'Brouillon', PUBLISHED: 'Publié', CANCELLED: 'Annulé', COMPLETED: 'Terminé' };
export const COLIS_STATUS: Record<string, string> = { REGISTERED: 'Enregistré', IN_TRANSIT: 'En route', ARRIVED: 'Arrivé en gare', DELIVERED: 'Remis' };
export const OFFER_STATUS: Record<string, string> = { PENDING: 'À traiter', OFFERED: 'Offre envoyée', ACCEPTED: 'Acceptée', REFUSED: 'Refusée' };
export const RECLAMATION_STATUS: Record<string, string> = { OPEN: 'Ouverte', IN_PROGRESS: 'En cours', RESOLVED: 'Résolue' };

/** Valeur d'un <input type="datetime-local"> (heure locale) → ISO UTC pour l'API. */
export const localToIso = (v: string) => new Date(v).toISOString();

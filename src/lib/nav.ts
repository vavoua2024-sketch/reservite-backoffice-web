import { Role } from './api';

export interface NavItem {
  href: string;
  label: string;
  roles: Role[];
}

const COMPANY: Role[] = ['COMPANY_ADMIN', 'GARE_MANAGER', 'CASHIER', 'PARCEL_AGENT'];

/** Menu par rôle. Le contrôle réel des droits reste fait par l'API : ceci ne fait qu'alléger l'interface. */
export const NAV: NavItem[] = [
  { href: '/', label: 'Tableau de bord', roles: ['SUPER_ADMIN', ...COMPANY] },
  { href: '/companies', label: 'Compagnies', roles: ['SUPER_ADMIN'] },
  { href: '/voyages', label: 'Voyages', roles: ['COMPANY_ADMIN', 'GARE_MANAGER', 'CASHIER'] },
  { href: '/guichet', label: 'Vente guichet', roles: ['COMPANY_ADMIN', 'GARE_MANAGER', 'CASHIER'] },
  { href: '/trajets', label: 'Trajets', roles: ['COMPANY_ADMIN'] },
  { href: '/gares', label: 'Gares', roles: ['COMPANY_ADMIN'] },
  { href: '/vehicules', label: 'Véhicules', roles: ['COMPANY_ADMIN'] },
  { href: '/colis', label: 'Colis & bagages', roles: ['COMPANY_ADMIN', 'GARE_MANAGER', 'PARCEL_AGENT'] },
  { href: '/locations', label: 'Locations', roles: ['COMPANY_ADMIN'] },
  { href: '/personnel', label: 'Personnel', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'GARE_MANAGER'] },
  { href: '/clients', label: 'Clients', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'GARE_MANAGER', 'CASHIER'] },
  { href: '/reclamations', label: 'Réclamations', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'GARE_MANAGER'] },
];

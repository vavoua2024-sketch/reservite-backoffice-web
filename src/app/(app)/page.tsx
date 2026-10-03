'use client';

import Link from 'next/link';
import { Loading, PageHead } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useFetch } from '@/lib/useFetch';

function Stat({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const body = (
    <div className="card">
      <div className="stat">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function SuperAdminDashboard() {
  const companies = useFetch<any[]>('/companies');
  const staff = useFetch<any[]>('/users');
  const clients = useFetch<any[]>('/clients');
  const reclamations = useFetch<any[]>('/reclamations');
  return (
    <div className="grid cols-4">
      <Stat label="Compagnies" value={companies.data?.length ?? '…'} href="/companies" />
      <Stat label="Comptes du personnel" value={staff.data?.length ?? '…'} href="/personnel" />
      <Stat label="Clients inscrits" value={clients.data?.length ?? '…'} href="/clients" />
      <Stat label="Réclamations ouvertes" value={reclamations.data?.filter((r) => r.status !== 'RESOLVED').length ?? '…'} href="/reclamations" />
    </div>
  );
}

function CompanyDashboard() {
  const { user } = useAuth();
  const voyages = useFetch<any[]>(['PARCEL_AGENT'].includes(user!.role) ? null : '/voyages?status=PUBLISHED');
  const colis = useFetch<any[]>('/colis');
  const offers = useFetch<any[]>(user!.role === 'COMPANY_ADMIN' ? '/proforma' : null);
  const upcoming = voyages.data?.filter((v) => new Date(v.departureAt) > new Date()) ?? [];
  const seatsLeft = upcoming.reduce((n, v) => n + v.seatsAvailable, 0);
  return (
    <div className="grid cols-4">
      {user!.role !== 'PARCEL_AGENT' && <Stat label="Voyages publiés à venir" value={voyages.loading ? '…' : upcoming.length} href="/voyages" />}
      {user!.role !== 'PARCEL_AGENT' && <Stat label="Places encore disponibles" value={voyages.loading ? '…' : seatsLeft} href="/guichet" />}
      <Stat label="Colis en cours" value={colis.data?.filter((c) => c.status !== 'DELIVERED').length ?? '…'} href="/colis" />
      {user!.role === 'COMPANY_ADMIN' && <Stat label="Demandes de location à traiter" value={offers.data?.filter((o) => o.status === 'PENDING').length ?? '…'} href="/locations" />}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return <Loading />;
  return (
    <>
      <PageHead title={`Bonjour ${user.name.split(' ')[0]}`} subtitle="Vue d'ensemble de votre activité" />
      {user.role === 'SUPER_ADMIN' ? <SuperAdminDashboard /> : <CompanyDashboard />}
      {user.role === 'SUPER_ADMIN' && <p className="muted" style={{ marginTop: 20 }}>Le SuperAdmin supervise la plateforme : création des compagnies, comptes du personnel, clients et réclamations.</p>}
    </>
  );
}

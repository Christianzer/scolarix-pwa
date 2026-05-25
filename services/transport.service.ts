import api from './api';

export interface Arret {
  id: number;
  bus_id: number;
  nom: string;
  ordre: number;
  heure_passage_matin?: string;
  heure_passage_soir?: string;
  latitude?: number;
  longitude?: number;
}

export interface Bus {
  id: number;
  nom: string;
  description?: string;
  capacite: number;
  immatriculation?: string;
  chauffeur_nom?: string;
  chauffeur_telephone?: string;
  actif: boolean;
  arrets: Arret[];
  eleves_count?: number;
}

export interface EleveBusItem {
  eleve_id: number;
  nom: string;
  matricule: string;
  classe?: string;
  arret?: string;
  sens: 'aller' | 'retour' | 'aller_retour';
  pointe_montee: boolean;
  pointe_descente: boolean;
  heure_montee?: string;
  heure_descente?: string;
}

export interface PointageBus {
  id: number;
  eleve_id: number;
  bus_id: number;
  date: string;
  sens: 'montee' | 'descente';
  heure_reelle?: string;
  note?: string;
  eleve?: { user?: { name: string }; matricule: string };
  bus?: { nom: string };
  arret?: { nom: string };
}

export interface TransportStats {
  total_eleves: number;
  total_bus_actifs: number;
  pointages_today: number;
  par_bus: Array<{
    id: number;
    nom: string;
    inscrits: number;
    capacite: number;
    taux: number;
  }>;
}

export interface InscriptionPayload {
  eleve_id: number;
  arret_id?: number | null;
  sens: 'aller' | 'retour' | 'aller_retour';
}

// ─── Bus ────────────────────────────────────────────────────────────────────

export const getBusList = (actif?: boolean): Promise<Bus[]> =>
  api.get('/transport/bus', { params: actif !== undefined ? { actif: actif ? 1 : 0 } : {} })
    .then(r => r.data);

export const getBusForEleve = (eleveId: number): Promise<Bus | null> =>
  api.get('/transport/bus', { params: { eleve_id: eleveId, actif: 1 } })
    .then(r => r.data[0] ?? null)
    .catch(() => null);

export const getBus = (busId: number): Promise<Bus> =>
  api.get(`/transport/bus/${busId}`).then(r => r.data);

export const createBus = (data: Partial<Bus>): Promise<Bus> =>
  api.post('/transport/bus', data).then(r => r.data);

export const updateBus = (busId: number, data: Partial<Bus>): Promise<Bus> =>
  api.put(`/transport/bus/${busId}`, data).then(r => r.data);

export const deleteBus = (busId: number): Promise<void> =>
  api.delete(`/transport/bus/${busId}`);

// ─── Arrêts ──────────────────────────────────────────────────────────────────

export const createArret = (busId: number, data: Partial<Arret>): Promise<Arret> =>
  api.post(`/transport/bus/${busId}/arrets`, data).then(r => r.data);

export const updateArret = (arretId: number, data: Partial<Arret>): Promise<Arret> =>
  api.put(`/transport/arrets/${arretId}`, data).then(r => r.data);

export const deleteArret = (arretId: number): Promise<void> =>
  api.delete(`/transport/arrets/${arretId}`);

// ─── Inscriptions ────────────────────────────────────────────────────────────

export const inscrireEleve = (busId: number, payload: InscriptionPayload): Promise<void> =>
  api.post(`/transport/bus/${busId}/inscrire`, payload);

export const retirerEleve = (busId: number, eleveId: number): Promise<void> =>
  api.delete(`/transport/bus/${busId}/retirer/${eleveId}`);

// ─── Pointage ────────────────────────────────────────────────────────────────

export const getElevesBus = (busId: number, date?: string): Promise<{ bus: Partial<Bus>; eleves: EleveBusItem[] }> =>
  api.get(`/transport/bus/${busId}/eleves`, { params: date ? { date } : {} }).then(r => r.data);

export const pointer = (
  busId: number,
  payload: {
    eleve_id: number;
    sens: 'montee' | 'descente';
    date?: string;
    heure?: string;
    note?: string;
    latitude?: number;
    longitude?: number;
  }
): Promise<PointageBus> =>
  api.post(`/transport/bus/${busId}/pointer`, payload).then(r => r.data);

// ─── Historique & Stats ───────────────────────────────────────────────────────

export const getHistorique = (params?: {
  bus_id?: number;
  eleve_id?: number;
  date?: string;
  date_debut?: string;
  date_fin?: string;
  page?: number;
}): Promise<{ data: PointageBus[]; total: number; current_page: number; last_page: number }> =>
  api.get('/transport/historique', { params }).then(r => r.data);

export const getStats = (): Promise<TransportStats> =>
  api.get('/transport/statistiques').then(r => r.data);

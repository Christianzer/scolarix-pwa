'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bus, ClipboardCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { usePointageStore } from '@/stores/pointage.store';
import { chauffeurService } from '@/services/chauffeur.service';
import { PageHeader } from '@/components/admin/page-header';
import type { Bus as BusType } from '@/services/transport.service';

export default function ChauffeurAccueilPage() {
  const user = useAuthStore((s) => s.user);
  const { pointageJour, fetchAujourdhui } = usePointageStore((s) => ({
    pointageJour: s.pointageJour,
    fetchAujourdhui: s.fetchAujourdhui,
  }));
  const [bus, setBus] = useState<BusType | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAujourdhui();
    chauffeurService.getBus().then((b) => { if (!cancelled) setBus(b); }).catch(() => {});
    return () => { cancelled = true; };
  }, [fetchAujourdhui]);

  return (
    <div>
      <PageHeader title={`Bonjour, ${user?.prenom ?? 'Chauffeur'}`} />
      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <div className={`rounded-xl p-4 flex-1 shadow-sm text-center ${pointageJour?.heure_arrivee ? 'bg-green-500' : 'bg-[#2B3D88]'}`}>
            <p className="text-2xl font-bold text-white">
              {pointageJour?.heure_arrivee ?? '—'}
            </p>
            <p className="text-xs text-blue-200 mt-0.5">
              {pointageJour?.heure_arrivee ? 'Arrivée pointée' : 'Pas encore pointé'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 flex-1 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{bus?.eleves_count ?? '—'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Élèves inscrits</p>
          </div>
        </div>

        {bus && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Bus size={18} className="text-[#2B3D88]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{bus.nom}</p>
                {bus.immatriculation && <p className="text-xs text-gray-400">{bus.immatriculation}</p>}
                <p className="text-xs text-gray-400">Capacité : {bus.capacite} places</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/chauffeur/mon-bus"
            className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Bus size={18} className="text-[#2B3D88]" aria-hidden="true" />
            </div>
            <span className="text-xs text-gray-600 text-center">Pointer les élèves</span>
          </Link>
          <Link
            href="/chauffeur/pointage"
            className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <ClipboardCheck size={18} className="text-[#2B3D88]" aria-hidden="true" />
            </div>
            <span className="text-xs text-gray-600 text-center">Mon pointage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

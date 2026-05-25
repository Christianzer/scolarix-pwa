'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeliberationStore } from '@/stores/deliberation.store';
import { adminService } from '@/services/admin.service';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Users, ChevronRight } from 'lucide-react';
import type { Periode } from '@/types/deliberation';

const PERIODES: { key: Periode | 'tous'; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'trimestre1', label: 'T1' },
  { key: 'trimestre2', label: 'T2' },
  { key: 'trimestre3', label: 'T3' },
];

export default function DeliberationsPage() {
  const router = useRouter();
  const deliberations = useDeliberationStore((s) => s.deliberations);
  const isLoading = useDeliberationStore((s) => s.isLoading);
  const isCreating = useDeliberationStore((s) => s.isCreating);
  const fetchAll = useDeliberationStore((s) => s.fetchAll);
  const create = useDeliberationStore((s) => s.create);

  const [periodeFilter, setPeriodeFilter] = useState<Periode | 'tous'>('tous');
  const [showCreate, setShowCreate] = useState(false);
  const [classes, setClasses] = useState<Array<{ id: number; nom: string; departement: string | null }>>([]);
  const [selectedClasseId, setSelectedClasseId] = useState<number | ''>('');
  const [selectedPeriode, setSelectedPeriode] = useState<Periode>('trimestre1');

  useEffect(() => {
    void fetchAll();
    adminService
      .getClasses()
      .then(setClasses)
      .catch(() => toast.error('Impossible de charger les classes'));
  }, [fetchAll]);

  const filtered =
    periodeFilter === 'tous' ? deliberations : deliberations.filter((d) => d.periode === periodeFilter);

  async function handleCreate() {
    if (!selectedClasseId) {
      toast.error('Sélectionnez une classe');
      return;
    }
    try {
      const id = await create({ classe_id: selectedClasseId as number, periode: selectedPeriode });
      toast.success('Délibération créée');
      setShowCreate(false);
      router.push(`/admin/deliberation-resultats?id=${id}`);
    } catch {
      toast.error('Erreur lors de la création');
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Délibérations" backHref="/admin/menu" />

      <div className="p-4">
        <div role="group" aria-label="Filtrer par période" className="flex gap-2 mb-4">
          {PERIODES.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriodeFilter(p.key)}
              aria-pressed={periodeFilter === p.key}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                periodeFilter === p.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-3 font-semibold mb-4"
        >
          <Plus size={18} aria-hidden="true" />
          Nouvelle délibération
        </button>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center text-gray-400 py-12">Aucune délibération</div>
        )}

        <div className="space-y-3">
          {filtered.map((d) => (
            <button
              key={d.id}
              onClick={() => router.push(`/admin/deliberation-resultats?id=${d.id}`)}
              className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center" aria-hidden="true">
                <Users size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{d.classe}</p>
                <p className="text-xs text-gray-500">{d.periode_label} · {d.nb_eleves} élèves</p>
                {d.validee_par && (
                  <p className="text-xs text-gray-400">Validé par {d.validee_par}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={d.statut} />
                <ChevronRight size={16} className="text-gray-400" aria-hidden="true" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle délibération</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="classe-select" className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
              <select
                id="classe-select"
                value={selectedClasseId}
                onChange={(e) => setSelectedClasseId(Number(e.target.value) || '')}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Sélectionner une classe —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}{c.departement ? ` (${c.departement})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">Période</p>
              <div role="group" aria-label="Choisir une période" className="flex gap-2">
                {(['trimestre1', 'trimestre2', 'trimestre3'] as Periode[]).map((p, i) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPeriode(p)}
                    aria-pressed={selectedPeriode === p}
                    className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedPeriode === p
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    T{i + 1}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => void handleCreate()}
              disabled={isCreating || !selectedClasseId}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
            >
              {isCreating ? 'Création…' : 'Créer'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

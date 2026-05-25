'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onboardingService, type OnboardingProgress, type OnboardingStep } from '@/services/onboarding.service';
import { PageHeader } from '@/components/admin/page-header';
import { toast } from 'sonner';
import { CheckCircle2, Circle, Database, Flag } from 'lucide-react';

function ProgressRing({ pct }: { pct: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(pct, 0), 100);
  const dash = (clamped / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100" role="img" aria-label={`Progression : ${pct}%`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke="#3b82f6" strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span className="absolute text-xl font-bold text-blue-700" aria-hidden="true">{pct}%</span>
    </div>
  );
}

function StepItem({ step }: { step: OnboardingStep }) {
  const content = (
    <div className={`flex items-start gap-3 p-4 rounded-xl ${step.done ? 'bg-green-50' : 'bg-white'} shadow-sm`}>
      {step.done ? (
        <CheckCircle2 size={20} className="text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
      ) : (
        <Circle size={20} className="text-gray-300 mt-0.5 shrink-0" aria-hidden="true" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${step.done ? 'text-green-800' : 'text-gray-900'}`}>{step.titre}</p>
        <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
      </div>
    </div>
  );

  if (!step.done && step.action) {
    return <Link href={step.action} aria-label={step.titre}>{content}</Link>;
  }
  return content;
}

export default function OnboardingPage() {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    onboardingService
      .getProgress()
      .then((data) => {
        if (!cancelled) setProgress(data);
      })
      .catch(() => {
        if (!cancelled) toast.error('Impossible de charger la progression');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function handleDemoData() {
    setIsLoadingDemo(true);
    try {
      const result = await onboardingService.chargerDemoData();
      toast.success(`Données de démo chargées — ${result.eleves} élèves, ${result.classes} classes`);
      const fresh = await onboardingService.getProgress();
      setProgress(fresh);
    } catch {
      toast.error('Erreur lors du chargement des données de démo');
    } finally {
      setIsLoadingDemo(false);
    }
  }

  async function handleMarkDone() {
    setIsMarkingDone(true);
    try {
      await onboardingService.marquerTermine();
      toast.success('Configuration terminée');
      const fresh = await onboardingService.getProgress();
      setProgress(fresh);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsMarkingDone(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Configuration initiale" backHref="/admin/menu" />

      {isLoading && (
        <div className="flex justify-center py-12">
          <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
        </div>
      )}

      {!isLoading && progress && (
        <div className="p-4 space-y-5">
          <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col items-center gap-3">
            <ProgressRing pct={progress.percentage} />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                {progress.completed_steps} / {progress.total_steps} étapes complétées
              </p>
              {progress.onboarding_done && (
                <p className="text-xs text-green-600 mt-1 font-medium">Configuration terminée ✓</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {progress.steps.map((step) => (
              <StepItem key={step.id} step={step} />
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => void handleDemoData()}
              disabled={isLoadingDemo}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
            >
              <Database size={18} aria-hidden="true" />
              {isLoadingDemo ? 'Chargement…' : 'Charger données de démo'}
            </button>

            {!progress.onboarding_done && (
              <button
                onClick={() => void handleMarkDone()}
                disabled={isMarkingDone}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
              >
                <Flag size={18} aria-hidden="true" />
                {isMarkingDone ? 'Enregistrement…' : 'Marquer comme terminé'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

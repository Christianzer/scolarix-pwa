'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useElearningStore } from '@/stores/elearning.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';

export default function EleveElearningDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { coursDetail, isLoadingDetail, fetchCoursDetail, marquerComplete, clearDetail } = useElearningStore((s) => ({
    coursDetail: s.coursDetail,
    isLoadingDetail: s.isLoadingDetail,
    fetchCoursDetail: s.fetchCoursDetail,
    marquerComplete: s.marquerComplete,
    clearDetail: s.clearDetail,
  }));

  useEffect(() => {
    if (!isNaN(id)) fetchCoursDetail(id);
    return () => { clearDetail(); };
  }, [id, fetchCoursDetail, clearDetail]);

  const handleMarquer = async () => {
    await marquerComplete(id);
    toast.success('Cours marqué comme terminé');
  };

  if (isLoadingDetail) {
    return (
      <div>
        <PageHeader title="Cours" backHref="/eleve/cours-en-ligne" />
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      </div>
    );
  }

  if (!coursDetail) {
    return (
      <div>
        <PageHeader title="Cours" backHref="/eleve/cours-en-ligne" />
        <p className="text-center text-sm text-gray-400 py-16">Cours introuvable</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={coursDetail.titre} backHref="/eleve/cours-en-ligne" />
      <div className="p-4 space-y-4">
        {coursDetail.matiere && (
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{coursDetail.matiere}</p>
        )}

        {coursDetail.description && (
          <p className="text-sm text-gray-600">{coursDetail.description}</p>
        )}

        {coursDetail.contenu && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm font-medium text-gray-800 mb-2">Contenu</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{coursDetail.contenu}</p>
          </div>
        )}

        {coursDetail.video_url && (
          <a
            href={coursDetail.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-50 text-[#2B3D88] rounded-xl px-4 py-3 text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            <ExternalLink size={16} aria-hidden="true" />
            Voir la vidéo
          </a>
        )}

        {!coursDetail.complete ? (
          <Button
            className="w-full bg-[#2B3D88] hover:bg-[#1a255e]"
            onClick={handleMarquer}
            aria-label="Marquer comme terminé"
          >
            <CheckCircle2 size={16} className="mr-2" aria-hidden="true" />
            Marquer comme terminé
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-green-600 py-2">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span className="text-sm font-medium">Cours complété</span>
          </div>
        )}
      </div>
    </div>
  );
}

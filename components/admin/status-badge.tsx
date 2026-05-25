import { cn } from '@/lib/utils';

const VARIANTS: Record<string, string> = {
  valide:     'bg-green-100 text-green-700',
  actif:      'bg-green-100 text-green-700',
  en_attente: 'bg-yellow-100 text-yellow-700',
  pending:    'bg-yellow-100 text-yellow-700',
  echoue:     'bg-red-100 text-red-700',
  failed:     'bg-red-100 text-red-700',
  inactif:    'bg-gray-100 text-gray-500',
  suspendu:   'bg-orange-100 text-orange-700',
  annule:     'bg-red-100 text-red-600',
  expire:     'bg-gray-100 text-gray-400',
  in_cours:   'bg-blue-100 text-blue-700',
  validee:    'bg-green-100 text-green-700',
  confirme:   'bg-green-100 text-green-700',
  reporte:    'bg-yellow-100 text-yellow-700',
  present:    'bg-green-100 text-green-700',
  retard:     'bg-yellow-100 text-yellow-700',
  absent:     'bg-red-100 text-red-700',
};

const LABELS: Record<string, string> = {
  valide: 'Validé', actif: 'Actif', en_attente: 'En attente', pending: 'En attente',
  echoue: 'Échoué', failed: 'Échoué', inactif: 'Inactif', suspendu: 'Suspendu',
  annule: 'Annulé', expire: 'Expiré', in_cours: 'En cours', validee: 'Validée',
  confirme: 'Confirmé', reporte: 'Reporté', present: 'Présent', retard: 'Retard',
  absent: 'Absent',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const key = status.toLowerCase();
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      VARIANTS[key] ?? 'bg-gray-100 text-gray-600', className)}>
      {label ?? LABELS[key] ?? status}
    </span>
  );
}

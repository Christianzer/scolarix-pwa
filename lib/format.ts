export function formatMontant(amount: number): string {
  if (!Number.isFinite(amount)) return '— FCFA';
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatHeure(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function getInitiales(nomComplet: string): string {
  return nomComplet
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}

export function StatsCard({ label, value, sub, className }: StatsCardProps) {
  return (
    <div className={cn('bg-white rounded-xl p-3 flex-1 shadow-sm', className)}>
      <div className="text-xl font-bold text-gray-900 truncate">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

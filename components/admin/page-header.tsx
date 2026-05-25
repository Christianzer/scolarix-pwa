import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
  subtitle?: string;
}

export function PageHeader({ title, backHref, action, subtitle }: PageHeaderProps) {
  return (
    <header className="bg-[#2B3D88] text-white px-4 py-3 flex items-center gap-3">
      {backHref && (
        <Link href={backHref} className="p-1 -ml-1 shrink-0" aria-label="Retour">
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-blue-200 text-xs truncate">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

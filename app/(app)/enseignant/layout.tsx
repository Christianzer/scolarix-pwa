import { EnseignantBottomNav } from '@/components/enseignant/bottom-nav';

export default function EnseignantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 max-w-lg mx-auto">
      {children}
      <EnseignantBottomNav />
    </div>
  );
}

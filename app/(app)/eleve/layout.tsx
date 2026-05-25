import EleveBottomNav from '@/components/eleve/bottom-nav';

export default function EleveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 max-w-lg mx-auto">
      {children}
      <EleveBottomNav />
    </div>
  );
}

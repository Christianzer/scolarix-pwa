import ChauffeurBottomNav from '@/components/chauffeur/bottom-nav';

export default function ChauffeurLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 max-w-lg mx-auto">
      {children}
      <ChauffeurBottomNav />
    </div>
  );
}

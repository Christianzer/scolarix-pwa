import ParentBottomNav from '@/components/parent/bottom-nav';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 max-w-lg mx-auto">
      {children}
      <ParentBottomNav />
    </div>
  );
}

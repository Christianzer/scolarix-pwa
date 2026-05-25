import { AdminBottomNav } from '@/components/admin/bottom-nav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 max-w-lg mx-auto">
      {children}
      <AdminBottomNav />
    </div>
  );
}

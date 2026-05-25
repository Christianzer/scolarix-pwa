'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isReady = useAuthStore((s) => s.isReady);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (isReady && !user) {
      router.replace('/login');
    }
  }, [isReady, user, router]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2B3D88]">
        <div className="h-8 w-8 rounded-full border-4 border-white border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

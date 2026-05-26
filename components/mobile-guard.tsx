'use client';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { MobileOnlyScreen } from '@/components/mobile-only-screen';

export function MobileGuard({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  if (isMobile === false) return <MobileOnlyScreen />;
  return <>{children}</>;
}

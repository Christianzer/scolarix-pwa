import { render, screen } from '@testing-library/react';
import { MobileGuard } from '@/components/mobile-guard';
import * as useMobileModule from '@/hooks/use-is-mobile';

vi.mock('@/hooks/use-is-mobile');
vi.mock('@/components/mobile-only-screen', () => ({
  MobileOnlyScreen: () => <div>Application mobile uniquement</div>,
}));

describe('MobileGuard', () => {
  it('affiche les enfants quand isMobile est true', () => {
    vi.mocked(useMobileModule.useIsMobile).mockReturnValue(true);
    render(<MobileGuard><div>Contenu app</div></MobileGuard>);
    expect(screen.getByText('Contenu app')).toBeInTheDocument();
    expect(screen.queryByText('Application mobile uniquement')).not.toBeInTheDocument();
  });

  it('affiche les enfants quand isMobile est null (SSR)', () => {
    vi.mocked(useMobileModule.useIsMobile).mockReturnValue(null);
    render(<MobileGuard><div>Contenu app</div></MobileGuard>);
    expect(screen.getByText('Contenu app')).toBeInTheDocument();
  });

  it('affiche MobileOnlyScreen quand isMobile est false (desktop)', () => {
    vi.mocked(useMobileModule.useIsMobile).mockReturnValue(false);
    render(<MobileGuard><div>Contenu app</div></MobileGuard>);
    expect(screen.getByText('Application mobile uniquement')).toBeInTheDocument();
    expect(screen.queryByText('Contenu app')).not.toBeInTheDocument();
  });
});

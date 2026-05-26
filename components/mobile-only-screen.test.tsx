import { render, screen } from '@testing-library/react';
import { MobileOnlyScreen } from '@/components/mobile-only-screen';

vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ 'aria-label': ariaLabel, value }: { 'aria-label'?: string; value?: string }) => (
    <svg aria-label={ariaLabel} data-testid="qr-code" data-value={value} />
  ),
}));

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

describe('MobileOnlyScreen', () => {
  it('affiche le titre', () => {
    render(<MobileOnlyScreen />);
    expect(
      screen.getByText('Application mobile uniquement')
    ).toBeInTheDocument();
  });

  it('affiche le sous-titre', () => {
    render(<MobileOnlyScreen />);
    expect(
      screen.getByText(/Scolarix est optimisé exclusivement/)
    ).toBeInTheDocument();
  });

  it('affiche la légende du QR code', () => {
    render(<MobileOnlyScreen />);
    expect(
      screen.getByText(/Scannez ce code QR/)
    ).toBeInTheDocument();
  });

  it('affiche le logo', () => {
    render(<MobileOnlyScreen />);
    expect(screen.getByAltText('Scolarix')).toBeInTheDocument();
  });

  it('affiche le QR code avec l\'URL courante', () => {
    render(<MobileOnlyScreen />);
    const qr = screen.getByTestId('qr-code');
    expect(qr).toBeInTheDocument();
    expect(qr).toHaveAttribute('data-value', window.location.href);
  });
});

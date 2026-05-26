import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-is-mobile';

const setWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

describe('useIsMobile', () => {
  beforeEach(() => {
    // Reset window.innerWidth to a baseline before each test to prevent test pollution
    setWidth(1024);
  });

  it('retourne true quand la largeur est < 768px', () => {
    setWidth(375);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('retourne false quand la largeur est >= 768px', () => {
    setWidth(1280);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('retourne false exactement à 768px (seuil exclusif)', () => {
    setWidth(768);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('se met à jour lors du resize', () => {
    setWidth(375);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    act(() => {
      setWidth(1280);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(false);
  });

  it('nettoie le listener resize lors du unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    setWidth(375);
    const { unmount } = renderHook(() => useIsMobile());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });

  // NOTE on null state limitation:
  // The hook returns `boolean | null` where null represents the SSR/pre-hydration state.
  // However, in jsdom with renderHook, the useEffect is immediately flushed by act(),
  // so the null state is never observable in these tests. The null return only occurs
  // in actual browser environments before the effect runs (e.g., during server-side rendering
  // or on initial render before hydration completes). Tests here will always see the resolved
  // boolean value since effects are synchronously executed.
});

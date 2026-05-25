import { describe, it, expect, beforeEach } from 'vitest';
import { tokenStorage } from '@/services/api';

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'auth_session=; path=/; max-age=0';
  });

  it('returns null when no token stored', () => {
    expect(tokenStorage.get()).toBeNull();
  });

  it('stores and retrieves the token', () => {
    tokenStorage.set('my-jwt-token');
    expect(tokenStorage.get()).toBe('my-jwt-token');
  });

  it('stores expiry ~30 days from now by default', () => {
    const before = Date.now();
    tokenStorage.set('token');
    const expiry = tokenStorage.getExpiry();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    expect(expiry).toBeGreaterThanOrEqual(before + thirtyDays - 1000);
    expect(expiry).toBeLessThanOrEqual(before + thirtyDays + 1000);
  });

  it('removes token and expiry on remove()', () => {
    tokenStorage.set('token');
    tokenStorage.remove();
    expect(tokenStorage.get()).toBeNull();
    expect(tokenStorage.getExpiry()).toBe(0);
  });
});

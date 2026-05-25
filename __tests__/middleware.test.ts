import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

function makeRequest(pathname: string, hasCookie = false): NextRequest {
  const url = `http://localhost:3000${pathname}`;
  const req = new NextRequest(url);
  if (hasCookie) {
    req.cookies.set('auth_session', '1');
  }
  return req;
}

describe('middleware', () => {
  it('lets /login through without cookie', () => {
    const res = middleware(makeRequest('/login', false));
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects /admin/accueil to /login without cookie', () => {
    const res = middleware(makeRequest('/admin/accueil', false));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('lets /admin/accueil through with valid cookie', () => {
    const res = middleware(makeRequest('/admin/accueil', true));
    expect(res.headers.get('location')).toBeNull();
  });

  it('lets /enseignant/appel through with valid cookie', () => {
    const res = middleware(makeRequest('/enseignant/appel', true));
    expect(res.headers.get('location')).toBeNull();
  });

  it('lets /parent/accueil through with valid cookie', () => {
    const res = middleware(makeRequest('/parent/accueil', true));
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects /chauffeur/pointage to /login without cookie', () => {
    const res = middleware(makeRequest('/chauffeur/pointage', false));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });
});

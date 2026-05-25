'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

const ROLE_ROUTES: Record<string, string> = {
  admin1: '/admin/accueil',
  administration: '/admin/accueil',
  super_admin: '/admin/accueil',
  enseignant: '/enseignant/accueil',
  eleve: '/eleve/accueil',
  parent: '/parent/accueil',
  chauffeur: '/chauffeur/accueil',
};

export default function AppIndexPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) {
      const route = ROLE_ROUTES[user.role] ?? '/login';
      router.replace(route);
    }
  }, [user, router]);

  return null;
}

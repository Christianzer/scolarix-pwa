import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/zustand-storage';
import type { Langue } from '@/constants/locales';

interface LangueState {
  langue: Langue;
  langueChoisie: boolean;
  setLangue: (langue: Langue) => void;
  marquerChoisie: () => void;
}

export const useLangueStore = create<LangueState>()(
  persist(
    (set) => ({
      langue: 'fr',
      langueChoisie: false,
      setLangue: (langue) => set({ langue }),
      marquerChoisie: () => set({ langueChoisie: true }),
    }),
    {
      name: '@scolarix_langue',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

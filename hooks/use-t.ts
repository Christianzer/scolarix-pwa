'use client';
import { useLangueStore } from '@/stores/langue.store';
import type { LocaleKey, Dictionnaire } from '@/constants/locales';
import fr from '@/constants/locales/fr';
import dioula from '@/constants/locales/dioula';
import baoule from '@/constants/locales/baoule';
import bete from '@/constants/locales/bete';

const DICTS: Record<string, Dictionnaire> = { fr, dioula, baoule, bete };

export function useT() {
  const langue = useLangueStore((s) => s.langue);
  const dict = DICTS[langue] ?? DICTS.fr;
  return (key: LocaleKey): string => dict[key] ?? fr[key] ?? (key as string);
}

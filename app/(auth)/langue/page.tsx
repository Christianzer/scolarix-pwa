'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLangueStore } from '@/stores/langue.store';
import type { Langue } from '@/constants/locales';

const LANGUES: { code: Langue; label: string; flag: string }[] = [
  { code: 'fr',     label: 'Français', flag: '🇫🇷' },
  { code: 'dioula', label: 'Dioula',   flag: '🇨🇮' },
  { code: 'baoule', label: 'Baoulé',   flag: '🇨🇮' },
  { code: 'bete',   label: 'Bété',     flag: '🇨🇮' },
];

export default function LanguePage() {
  const router = useRouter();
  const { setLangue, marquerChoisie } = useLangueStore();
  const langueChoisie = useLangueStore((s) => s.langueChoisie);

  useEffect(() => {
    if (langueChoisie) router.replace('/login');
  }, [langueChoisie, router]);

  function handleSelect(code: Langue) {
    setLangue(code);
    marquerChoisie();
    router.replace('/login');
  }

  return (
    <main className="min-h-screen bg-[#2B3D88] flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-10 flex flex-col items-center gap-4">
        <Image
          src="/icons/icon-192.png"
          alt="Scolarix"
          width={80}
          height={80}
          priority
        />
        <h1 className="text-white text-2xl font-bold tracking-tight">Scolarix</h1>
        <p className="text-blue-200 text-sm text-center">
          Choisissez votre langue / Choose your language
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {LANGUES.map(({ code, label, flag }) => (
          <button
            key={code}
            onClick={() => handleSelect(code)}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-6 text-white transition hover:bg-white/20 active:scale-95"
          >
            <span className="text-3xl" role="img" aria-label={label}>
              {flag}
            </span>
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </main>
  );
}

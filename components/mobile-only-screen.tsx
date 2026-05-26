'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

export function MobileOnlyScreen() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-8 py-12">
      <Image
        src="/logo.png"
        alt="Scolarix"
        width={80}
        height={80}
        className="mb-7 rounded-2xl"
        priority
      />
      <h1 className="text-2xl font-bold text-slate-900 text-center mb-3 leading-snug">
        Application mobile uniquement
      </h1>
      <p className="text-sm text-slate-500 text-center leading-relaxed mb-9 max-w-xs">
        Scolarix est optimisé exclusivement pour les smartphones afin de vous
        offrir la meilleure expérience possible.
      </p>
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center gap-3 w-full max-w-xs">
        {url && (
          <QRCodeSVG
            value={url}
            size={160}
            aria-label="QR Code Scolarix"
          />
        )}
        <p className="text-xs text-slate-400 text-center leading-relaxed">
          Scannez ce code QR pour ouvrir Scolarix et afficher
          l&apos;application sur votre mobile.
        </p>
      </div>
    </div>
  );
}

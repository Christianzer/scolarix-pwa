'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import authService from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const RESEND_DELAY = 60;

export default function VerifyOtpPage() {
  const router       = useRouter();
  const params       = useSearchParams();
  const email        = params.get('email') ?? '';
  const loginWithToken = useAuthStore((s) => s.loginWithToken);

  const inputRef = useRef<HTMLInputElement>(null);

  const [code,     setCode]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [countdown, setCountdown] = useState(RESEND_DELAY);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (countdown === 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) { setError('Le code doit contenir 6 chiffres.'); return; }
    setLoading(true);
    try {
      const { data } = await authService.verifyOtp(email, code);
      await loginWithToken(data.token, data.user);
      router.replace('/');
    } catch {
      setError('Code incorrect ou expiré.');
      setCode('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendOtp(email);
      setCountdown(RESEND_DELAY);
      toast.success('Nouveau code envoyé à ' + email);
    } catch {
      toast.error('Impossible de renvoyer le code.');
    }
  };

  return (
    <main className="min-h-screen bg-[#2B3D88] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-gray-900">Vérification</h1>
          <p className="text-sm text-gray-500">
            Code envoyé à <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4" noValidate>
          <Input
            ref={inputRef}
            id="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(digits);
              setError('');
            }}
            className="text-center text-2xl font-bold tracking-[0.5em] h-14"
            aria-label="Code de vérification"
            aria-invalid={!!error}
            aria-describedby={error ? 'otp-error' : undefined}
          />
          {error && (
            <p id="otp-error" className="text-xs text-red-600 text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-[#2B3D88] hover:bg-[#1a255e] text-white"
            disabled={code.length < 6 || loading}
          >
            {loading ? 'Vérification…' : 'Vérifier'}
          </Button>
        </form>

        <div className="text-center text-sm">
          {countdown > 0 ? (
            <p className="text-gray-500">Renvoyer dans <span className="font-medium">{countdown}s</span></p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-[#2B3D88] font-semibold hover:underline"
            >
              Renvoyer le code
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="w-full text-center text-xs text-gray-400 hover:text-gray-600"
        >
          Retour à la connexion
        </button>
      </div>
    </main>
  );
}

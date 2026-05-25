'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GraduationCap, Users, BookOpen, Building2, Bus, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Role = 'eleve' | 'parent' | 'enseignant' | 'admin' | 'chauffeur';

const ROLES: { key: Role; label: string; color: string; Icon: React.ElementType }[] = [
  { key: 'eleve',      label: 'Élève',       color: '#2B3D88', Icon: GraduationCap },
  { key: 'parent',     label: 'Parent',      color: '#16A34A', Icon: Users },
  { key: 'enseignant', label: 'Enseignant',  color: '#C25C26', Icon: BookOpen },
  { key: 'admin',      label: 'Admin',       color: '#6366F1', Icon: Building2 },
  { key: 'chauffeur',  label: 'Chauffeur',   color: '#B45309', Icon: Bus },
];

const PLACEHOLDER: Record<Role, string> = {
  eleve:      'DUB-2024-001',
  parent:     'email@exemple.com ou 07 XX XX XX XX',
  enseignant: 'vous@exemple.com',
  admin:      'vous@exemple.com',
  chauffeur:  'CHF-2024-001',
};

const LOCK_THRESHOLD_1 = 5;
const LOCK_DURATION_1  = 600;
const LOCK_THRESHOLD_2 = 10;
const LOCK_DURATION_2  = 1200;

function formatCountdown(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function LoginPage() {
  const router = useRouter();
  const login          = useAuthStore((s) => s.login);
  const loginMatricule = useAuthStore((s) => s.loginMatricule);

  const [role,       setRole]       = useState<Role>('eleve');
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState<{ identifier?: string; password?: string }>({});

  const failedAttempts = useRef(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!lockUntil) return;
    const tick = () => {
      const remaining = Math.ceil((lockUntil - Date.now()) / 1000);
      if (remaining <= 0) { setLockUntil(null); setCountdown(0); }
      else setCountdown(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockUntil]);

  const isLocked      = lockUntil !== null && Date.now() < lockUntil;
  const usesMatricule = role === 'eleve' || role === 'chauffeur';
  const cfg           = ROLES.find(r => r.key === role)!;

  const handleRoleChange = (r: Role) => {
    setRole(r);
    setIdentifier('');
    setPassword('');
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const newErrors: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) newErrors.identifier = usesMatricule ? 'Matricule requis' : 'Champ requis';
    if (!usesMatricule && !password) newErrors.password = 'Mot de passe requis';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      if (usesMatricule) {
        await loginMatricule(identifier.trim());
      } else {
        await login(identifier.trim(), password);
      }
      failedAttempts.current = 0;
      router.replace('/');
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { requires_otp?: boolean; message?: string; email?: string } };
        message?: string;
      };
      const status = error.response?.status;

      if (status === 403 && error.response?.data?.requires_otp) {
        const email = error.response.data.email ?? identifier.trim();
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        return;
      }
      if (status === 403) {
        toast.error('Compte désactivé. Contactez votre administrateur.');
        return;
      }

      failedAttempts.current += 1;
      const attempts = failedAttempts.current;

      if (attempts >= LOCK_THRESHOLD_2) {
        setLockUntil(Date.now() + LOCK_DURATION_2 * 1000);
        setErrors({});
      } else if (attempts >= LOCK_THRESHOLD_1) {
        setLockUntil(Date.now() + LOCK_DURATION_1 * 1000);
        setErrors({});
      } else {
        const remaining = LOCK_THRESHOLD_1 - attempts;
        const msg = error.response?.data?.message ?? 'Identifiants incorrects';
        setErrors({
          identifier: remaining <= 2
            ? `${msg} — encore ${remaining} tentative${remaining > 1 ? 's' : ''} avant blocage`
            : msg,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10 transition-colors duration-300"
      style={{ backgroundColor: cfg.color }}
    >
      <div className="w-full max-w-sm space-y-5">

        {/* Brand */}
        <div className="flex flex-col items-center gap-2">
          <div className="bg-white rounded-2xl px-8 py-3 shadow-lg">
            <Image src="/logo.png" alt="Scolarix" width={160} height={56} className="object-contain" priority />
          </div>
          <p className="text-white/70 text-xs tracking-wide">Espace scolaire</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl space-y-5">

          {/* Role selector */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">Qui êtes-vous ?</p>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Sélection du rôle">
              {ROLES.map((r) => {
                const selected = role === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => handleRoleChange(r.key)}
                    className={cn(
                      'relative flex items-center gap-2 p-3 rounded-xl border-[1.5px] text-left transition-all',
                      selected ? 'border-current' : 'border-gray-200 bg-white',
                    )}
                    style={selected ? { borderColor: r.color, backgroundColor: `${r.color}10`, color: r.color } : { color: '#6b7280' }}
                  >
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                      style={{ backgroundColor: `${r.color}${selected ? '25' : '12'}` }}
                    >
                      <r.Icon size={16} style={{ color: r.color }} aria-hidden="true" />
                    </span>
                    <span className={cn('text-xs', selected ? 'font-bold' : 'font-medium text-gray-500')}>
                      {r.label}
                    </span>
                    {selected && (
                      <span
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: r.color }}
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-white"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Connexion</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Lock banner */}
          {isLocked && (
            <div className="flex items-center gap-2 bg-red-600 text-white rounded-xl p-3" role="alert">
              <Lock size={16} className="shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold">Accès bloqué</p>
                <p className="text-xs text-white/85">
                  Réessayez dans <span className="font-bold">{formatCountdown(countdown)}</span>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="identifier">
                {usesMatricule ? 'Matricule' : 'Email'}
              </Label>
              <Input
                id="identifier"
                type={usesMatricule ? 'text' : 'email'}
                placeholder={PLACEHOLDER[role]}
                autoComplete={usesMatricule ? 'off' : 'username'}
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setErrors(v => ({ ...v, identifier: undefined })); }}
                disabled={isLocked || loading}
                aria-invalid={!!errors.identifier}
                aria-describedby={errors.identifier ? 'identifier-error' : undefined}
              />
              {errors.identifier && (
                <p id="identifier-error" className="text-xs text-red-600">{errors.identifier}</p>
              )}
            </div>

            {!usesMatricule && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(v => ({ ...v, password: undefined })); }}
                  disabled={isLocked || loading}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                {errors.password && (
                  <p id="password-error" className="text-xs text-red-600">{errors.password}</p>
                )}
              </div>
            )}

            {!usesMatricule && (
              <div className="text-right">
                <a
                  href="/forgot-password"
                  className="text-xs underline underline-offset-4 text-gray-500 hover:text-gray-800"
                >
                  Mot de passe oublié ?
                </a>
              </div>
            )}

            <Button
              type="submit"
              className="w-full text-white font-semibold"
              style={{ backgroundColor: cfg.color }}
              disabled={isLocked || loading}
            >
              {isLocked ? `Bloqué — ${formatCountdown(countdown)}` : loading ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

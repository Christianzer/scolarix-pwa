'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import authService from '@/services/auth.service';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
      toast.success('Un lien de réinitialisation a été envoyé à votre adresse e-mail.');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Impossible d\'envoyer le lien. Vérifiez votre adresse e-mail.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#2B3D88] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
          <CardDescription>
            {sent
              ? 'Vérifiez votre boîte mail'
              : 'Entrez votre adresse e-mail pour recevoir un lien de réinitialisation'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Si un compte est associé à{' '}
                <span className="font-medium text-foreground">{email}</span>, vous
                recevrez un e-mail dans quelques instants.
              </p>
              <Link href="/login" className={buttonVariants({ className: 'w-full bg-[#2B3D88] hover:bg-[#1a255e] text-white' })}>
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@ecole.ci"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#2B3D88] hover:bg-[#1a255e] text-white"
                disabled={loading}
              >
                {loading ? 'Envoi…' : 'Envoyer le lien'}
              </Button>

              <div className="text-center text-sm">
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                  Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

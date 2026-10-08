'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { QrImage } from '@/components/ui/qr-image';
import { TextField } from '@/components/ui/text-field';

import { useAuth } from './auth-provider';
import {
  checkAuthenticatorCode,
  checkEmailCode,
  sendEmailCode,
  setUpAuthenticator,
  signInErrorMessage,
  type TotpSetup,
} from './sign-in-api';

type Step = 'email' | 'email-code' | 'setup' | 'authenticator';

const AUTHENTICATOR_HINT =
  'Nicht der Code aus der E-Mail: die 6-stellige Zahl in der App, sie ändert sich alle 30 Sekunden.';

/** Email → email code → (first time: QR for the authenticator app) → authenticator code. */
export function SignInForm() {
  const router = useRouter();
  const { state } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [setup, setSetup] = useState<TotpSetup | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStep('email');
    setCode('');
    setMfaToken('');
    setSetup(null);
    setError(null);
  }

  useEffect(() => {
    if (state.status === 'signed-in') router.replace('/');
  }, [state.status, router]);

  // Next.js keeps visited pages in memory (React Activity). When this page is left, everything entered is
  // cleared: otherwise signing out would show the old step again, possibly the QR code with the 2FA secret.
  useLayoutEffect(() => reset, []);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(signInErrorMessage(caught, step === 'setup' || step === 'authenticator' ? 'authenticator' : 'email'));
    } finally {
      setBusy(false);
    }
  }

  const submit = () =>
    run(async () => {
      if (step === 'email') {
        await sendEmailCode(email.trim());
        setStep('email-code');
      } else if (step === 'email-code') {
        const challenge = await checkEmailCode(email.trim(), code);
        setMfaToken(challenge.mfaToken);
        setCode('');
        if (challenge.needsSetup) {
          setSetup(await setUpAuthenticator(challenge.mfaToken));
          setStep('setup');
        } else setStep('authenticator');
      } else {
        await checkAuthenticatorCode(mfaToken, code);
        // Signed in: the secret and tokens are not needed any more.
        reset();
      }
    });

  const codeField = (label: string, hint?: string) => (
    <div className="flex flex-col gap-1.5">
      <TextField
        label={label}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        required
        autoFocus
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
        className="min-h-14 rounded-xl border border-line px-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-brand-purple"
      />
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <Logo height={36} />
        <h1 className="text-xl font-bold">Admin</h1>
      </div>

      {step === 'email' && (
        <>
          <TextField
            label="E-Mail-Adresse"
            type="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="submit" disabled={busy || !email.trim()}>
            Code senden
          </Button>
        </>
      )}

      {step === 'email-code' && (
        <>
          <p className="text-sm text-ink-muted">
            Schritt 1 von 2: Code aus der E-Mail an <strong className="text-ink">{email.trim()}</strong>.
          </p>
          {codeField('Code aus der E-Mail', 'Haben Sie mehrere E-Mails bekommen? Nur der Code aus der neuesten gilt.')}
          <Button type="submit" disabled={busy || code.length !== 6}>
            Weiter
          </Button>
        </>
      )}

      {step === 'setup' && setup && (
        <>
          <p className="text-sm text-ink-muted">
            Einmalig: Scannen Sie den QR-Code mit Ihrer Authenticator-App (z. B. Google Authenticator, Microsoft
            Authenticator, 1Password) und geben Sie den angezeigten Code ein.
          </p>
          <div className="flex flex-col items-center gap-2">
            <QrImage value={setup.otpauthUri} size={200} label="QR-Code für die Authenticator-App" />
            <details className="text-xs text-ink-muted">
              <summary className="cursor-pointer">Code kann nicht gescannt werden?</summary>
              <p className="mt-1 font-mono break-all select-all">{setup.secret}</p>
            </details>
          </div>
          {codeField('Code aus der Authenticator-App', AUTHENTICATOR_HINT)}
          <Button type="submit" disabled={busy || code.length !== 6}>
            Einrichten und anmelden
          </Button>
        </>
      )}

      {step === 'authenticator' && (
        <>
          <p className="text-sm text-ink-muted">
            Schritt 2 von 2: Öffnen Sie Ihre Authenticator-App und geben Sie die Zahl bei{' '}
            <strong>KollektivO Admin</strong> ein.
          </p>
          {codeField('Code aus der Authenticator-App', AUTHENTICATOR_HINT)}
          <Button type="submit" disabled={busy || code.length !== 6}>
            Anmelden
          </Button>
        </>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-error">
          {error}
        </p>
      )}
      {step !== 'email' && (
        <button type="button" className="text-sm text-brand-purple hover:underline" onClick={reset}>
          Von vorn beginnen
        </button>
      )}
    </form>
  );
}

import { signInWithCustomToken } from 'firebase/auth';

import { api, ApiError, unwrap, type Schemas } from '@/lib/api-client';
import { firebaseAuth } from '@/lib/firebase';

export type MfaChallenge = Schemas['AdminMfaChallengeDto'];
export type TotpSetup = Schemas['AdminTotpSetupDto'];

/** Step 1a: emails a 6-digit code (only to KollektivO admins). */
export async function sendEmailCode(email: string): Promise<void> {
  unwrap(await api.POST('/v1/admin/auth/sign-in-codes', { body: { email } }));
}

/** Step 1b: the email code. Returns the token for step 2 and whether the authenticator still needs setting up. */
export async function checkEmailCode(email: string, code: string): Promise<MfaChallenge> {
  return unwrap(await api.POST('/v1/admin/auth/email-code', { body: { email, code } }));
}

/** First sign-in: the secret for the authenticator app (QR code). */
export async function setUpAuthenticator(mfaToken: string): Promise<TotpSetup> {
  return unwrap(await api.POST('/v1/admin/auth/totp/setup', { body: { mfaToken } }));
}

/** Step 2: the authenticator code; starts the admin session. */
export async function checkAuthenticatorCode(mfaToken: string, code: string): Promise<void> {
  const session = unwrap(await api.POST('/v1/admin/auth/totp/verify', { body: { mfaToken, code } }));
  await signInWithCustomToken(firebaseAuth(), session.firebaseCustomToken);
}

/** [step] tells which code was wrong: the one from the email or the one from the authenticator app. */
export function signInErrorMessage(error: unknown, step: 'email' | 'authenticator' = 'email'): string {
  if (!(error instanceof ApiError)) return 'Keine Verbindung zur API.';
  switch (error.code) {
    case 'account_not_found':
      return 'Für diese E-Mail-Adresse gibt es keinen Admin-Zugang.';
    case 'sign_in_code_invalid': {
      if (step === 'email') return 'Der Code aus der E-Mail ist falsch. Bitte den Code aus der neuesten E-Mail nehmen.';
      const left = error.details.attemptsLeft;
      return `Der Code aus der Authenticator-App ist falsch.${
        typeof left === 'number'
          ? ` Noch ${left} ${left === 1 ? 'Versuch' : 'Versuche'}, danach wird der Zugang gesperrt.`
          : ''
      }`;
    }
    case 'sign_in_code_expired':
      return 'Der Code ist abgelaufen. Bitte neu anfordern.';
    case 'too_many_attempts':
      return error.status === 429 && error.message.includes('authenticator')
        ? 'Zu viele falsche Codes aus der Authenticator-App. Eine andere Admin-Person muss Ihre 2FA zurücksetzen.'
        : 'Zu viele Versuche. Bitte kurz warten.';
    case 'unauthorized':
      return 'Die Anmeldung ist abgelaufen. Bitte von vorn beginnen.';
    default:
      return error.message;
  }
}

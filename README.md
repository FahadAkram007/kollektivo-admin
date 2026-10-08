# KollektivO Admin (kollektivo-admin)

Internal portal for the KollektivO team: shops and companies, support, dashboard, audit log.
German, built for the computer (works on a tablet). Never public: `noindex`, later its own address.

Sign-in: email code, then a code from an authenticator app (QR setup on the first sign-in). Sessions live
only in the browser tab and end 12 hours after sign-in. Roles: Admin, Support, Finanzen (see the API README).

## Run locally

1. API running (`kollektivo-api`: `npm run start:dev`) with `ADMIN_SECRETS_KEY` in its `.env` and
   `http://localhost:3002` in `WEB_ORIGINS`.
2. Become admin: in kollektivo-api `npm run admin:create -- --email … --first-name … --last-name … --role admin`.
3. `cp .env.example .env.local`, fill in the Firebase web config of the admin app
   (`firebase apps:sdkconfig WEB <app id> --project kollektivo-dev`).
4. `npm install`, `npm run dev` → http://localhost:3002

## Scripts

`npm run api:types` (after API changes), `npm run lint`, `npm test`, `npm run build`, `npm run format`

## Structure

- `src/app/` – routes (`/anmelden`, `/`, `/support`, `/suche`, `/laeden`, `/firmen`, `/protokoll`, `/admins`)
- `src/features/<feature>/` – components, hooks and API calls per feature
- `src/components/ui/` – shared building blocks (same look as the shop/HR portal)
- `src/lib/` – API client, Firebase, formatting

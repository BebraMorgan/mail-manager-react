# Shared API — single administrator

Backend contract: `mail-manager-single-admin/API.md`.

- Auth: `POST /api/auth/login` (cookie), `GET /api/auth/me`, `POST /api/auth/refresh` (rotating HttpOnly refresh cookie), `POST /api/auth/logout`, `POST /api/auth/password`.
- Axios adds `X-CSRF-Token` from `mm_csrf` for mutations and performs a single shared refresh request on 401, then retries the original request once.
- Both tokens are kept exclusively in browser cookies. No localStorage or Bearer authorization.
- Backend has exactly one admin; no roles, `/api/users`, or passwordless public registration.
- IMAP credentials are configured with `mailSettingsApi.save()` (`POST /api/mail/settings`), not environment files.
- `AuthProvider` initializes `GET /api/auth/me` before protected routes are displayed.
- For development use Vite `/api` proxy; production should serve UI and API on one HTTPS origin.

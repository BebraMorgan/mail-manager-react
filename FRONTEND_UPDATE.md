# Mail Manager frontend — single administrator and cookie refresh

Frontend sources updated against the supplied `mail-manager-single-admin.zip` contract. Includes a real React Hook Form + Zod login page, Zustand session, HttpOnly-cookie auth, rotating refresh handling, CSRF, no user management or viewer role, and settings API for IMAP credentials.

## Run

```bash
npm ci
npm run lint
npm run build
npm run dev
```

Vite proxies `/api` to `http://127.0.0.1:3000`. Backend must be running with the new cookie + refresh API. In production use same-origin HTTPS. No JWT or IMAP credentials should be saved in localStorage.

## Routes

`/login`, `/`, `/mail`, `/problems`, `/reports`, `/settings`. Mail/report/dashboard/settings pages still contain placeholders from the submitted frontend; login and the application shell are implemented. See `src/shared/api/mailSettings.ts` for saving IMAP settings from a future settings form.

## Test status

This environment does not have the project's npm dependencies and `npm ci --offline` failed (missing cached package). Run `npm ci && npm run lint && npm run build` on your computer. Backend integration and session race conditions should also be exercised in a browser.

# Mail Manager React — Reports + Settings patch

Base: `mail-manager-react-problems.zip`; backend: `mail-manager-single-admin.zip`.
This patch changes only `src/` and adds no npm dependencies or backend changes.

## Installation

Make a backup / commit current changes, then extract this archive in the **React project root** so the `src/` folder merges with the existing `src/` directory:

```fish
cd ~/Projects/mail-manager-react
unzip -o ~/Downloads/mail-manager-reports-settings-patch.zip -d .
npm run lint
npm run build
npm run dev
```

Replace the ZIP path with where you saved it. Your application must have the cookie-auth backend running at the Vite `/api` proxy target.

## New pages

`/reports`: selected UTC date via Mantine DatePickerInput; daily metrics from `/api/reports/daily`, category/importance/action filters, drill-down via existing `MailDrawer`, CSV/JSON download of the server-returned report. The server caps report items at 1000 for a day; the counts reflect the whole queried day.

`/settings`: load/save Yandex IMAP via GET/POST `/api/mail/settings`; list IMAP folders through GET `/api/mail/folders` when connected; manual POST `/api/mail/sync`; change password via POST `/api/auth/password`. Backend revokes sessions on password change, so the frontend clears in-memory auth state and goes to `/login`.

Secrets are kept only in the local React Hook Form state until sending a POST. They are never written into Zustand or browser storage; after a successful save credential fields are cleared. Empty credentials preserve existing ones only when account, host and authentication method remain unchanged (backend behavior). Changing account/folder after downloading messages requires resetting the development SQLite database.

For `allow_delete` there is a separate explicit acknowledgment. The settings page only enables a backend permission; it **does not issue IMAP MOVE** or delete emails. Actual mail movement still requires manual preview and admin password in `/mail`.

## Bug fix

`src/features/problems/components/ReconcileModal.tsx`: replaced deprecated `FormEvent` import and empty-string discriminant with `null` and a checked string type guard. No change to reconciliation behavior, and it still requires human confirmation and password.

## Verification

- Parsed and transpiled all 95 TypeScript/TSX source files; no syntax diagnostics.
- Checked relative TS/TSX imports: no missing paths.
- Tested report selectors, UTC previous-day calculation and protection against CSV formula injection.
- Full `npm run build` and `npm run lint` could not be executed in this environment: required npm package tarballs are absent from the offline cache (`npm ci --offline` fails with `ENOTCACHED`). Run these two commands locally.

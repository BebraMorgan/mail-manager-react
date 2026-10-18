# Mail Manager — `/mail` page

The page uses `src/pages/Mail` and the separated feature `src/features/mail`:

- `api/mail.api.ts`: typed frontend wrapper for endpoints defined in `mail-manager-single-admin.zip`.
- `store/mail.store.ts`: Zustand page state, filters, selection, pagination, and results. The data is purged when the authentication session changes.
- `hooks/useMailPage.ts`: refresh every 45 seconds (only when visible) and debounced search (350 ms); `useMailActions.ts`: manual mutations; `useMailContent.ts`: fetches IMAP body only while drawer is open.
- `components/*`: toolbar, table, read-only drawer, manual classification form, and guarded multi-select MOVE-to-trash workflow.

## API compatibility

`GET /api/classifications?limit=&offset=&q=&category=&importance=&spam_verdict=&needs_review=&include_in_report=` returns the paginated list. The API filters **classified** emails only. Bodies come from `GET /api/mail/:id/content` (BODY.PEEK, not persisted in the client store). Manual classification edits use `PATCH /api/classifications/:id` and the complete `ManualClassification` payload; server-side validation remains authoritative. Reclassification is explicitly user-triggered via `POST /api/classifications/:id/retry`.

Deletion is **not automatic**. The administrator must select 1–100 active email IDs, open a separate confirmation modal, check the returned `POST /api/mail/delete/preview` subjects/statuses, enter the administrator password, check explicit confirmation, and click the red button before `POST /api/mail/delete` runs. The server still enforces password verification, IMAP MOVE only, settings, and CSRF. HTTP 207 is considered a successful HTTP transport response with per-ID statuses; ambiguous results are shown and MUST NOT be retried automatically. Set `allow_delete=true` and the actual trash folder using the mail settings page before testing.

The backend filters out moved mail from the classification list. `unknown` deletion operations must be reconciled manually using `/api/mail/delete/:id/reconcile`, not blindly repeated; this `/mail` implementation displays such statuses but does not yet provide a reconciliation dialog.

No `localStorage`, bearer tokens, or refresh tokens are used in this feature; requests go through the cookie-aware existing Axios client.

## Development checks

```
npm ci
npm run lint
npm run build
```

Node dependencies were unavailable in the authoring environment when this patch was generated; perform full checks in your development environment.

# Audit fixes included in this package

## Security and auth
- Added `lib/auth/requireAdmin.ts` for unified server-side admin authorization.
- Added `server-only` protection to `lib/supabase/admin.ts`.
- Updated `middleware.ts` to support JWT role claim fallback and protect `/api/admin/*`.
- Hardened `/api/admin/storage-signed-urls` with bucket allowlist and path validation.
- Added `/api/admin/users/[id]/role` to change roles through server-side RPC instead of direct client updates.
- Reworked `/api/admin/works/[id]/reset-document` to reset generated documents from a dedicated table.

## Database migrations
- Added `20260310000100_rbac_custom_claims.sql` for `user_roles`, JWT custom claims hook, and safe `set_user_role` RPC.
- Added `20260310000200_contest_documents_and_storage.sql` for:
  - missing contest fields,
  - admin SELECT on pending contest works,
  - dedicated `contest_documents` table for certificate tokens and document metadata,
  - private storage bucket setup and storage RLS policies.

## Logic fixes
- Rewrote `app/api/certificates/[token]/route.ts` to remove syntax errors and make certificate generation deterministic.
- Moved certificate token lookup to `contest_documents` in public certificate and verify pages.
- Fixed public contest detail page to use `submission_email` fallback.
- Fixed `ContestCard` so it supports both full `contest` objects and explicit props.
- Fixed broken `components/admin/AdminContestTable.tsx` fragment/JSX structure.
- Updated admin users page to use server-side role management.
- Hid `/debug` in production.

## UI improvements
- Contest cards now render consistently from snake_case database rows.
- Contest detail page has clearer email CTA and cleaner information layout.
- Users admin page has cleaner management flow with safer actions.

## Important note
This repository still contains broader pre-existing TypeScript and schema typing issues outside the files patched here. The package focuses on the highest-risk auth/RLS/certificate/admin/design problems first.

- Убрана зависимость от next/font/google в app/layout.tsx, чтобы сборка не зависела от доступа к Google Fonts.

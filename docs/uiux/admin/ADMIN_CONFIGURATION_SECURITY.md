# Admin Configuration Security

**Implementation status:** Partially implemented (API); UI on legacy tab layout.

## Principles

1. Secrets never returned plaintext to the browser after save.
2. Authorization: `auth:sanctum` + `users.is_admin` on all `/api/v1/admin/*`.
3. Frontend shows masked secrets (`••••••••`) and “leave blank to keep”.
4. Storage: `site_settings` with `is_secret` + Laravel `Crypt` (`APP_KEY`).
5. UI hiding is not security — API enforces admin middleware.

## Implemented

| Area | Mechanism |
|------|-----------|
| Mail/Google credentials | `SettingsService`, PATCH groups `mail` \| `google` |
| Registry allowlist | `config/integration_settings.php` |
| Cache | `site_settings.resolved`, invalidated on save |

## Gaps

- No audit log of configuration changes.
- No granular permissions (only `is_admin`).
- No rate limiting on admin PATCH.
- Next.js `/admin` not server-guarded.

## Testing requirements (when layout ships)

- Non-admin token → 403 on all admin APIs.
- GET settings never includes raw `client_secret` / `mail.password`.
- Rotate `APP_KEY` → must re-enter secrets (documented in LARAGON.md).

## Related code

- `apps/api/app/Services/SettingsService.php`
- `apps/api/app/Http/Controllers/Api/V1/Admin/SettingsController.php`
- `apps/web/src/app/[locale]/admin/admin-integrations-panel.tsx`

# Admin API Integration Configuration

**Status:** **Already supported** (mail + Google). UI migration to new AdminLayout planned.

## Business purpose

Allow operators to configure outbound email and Google OAuth without editing server `.env` on every environment.

## UI/UX (current)

Single page tab “Tích hợp” with two cards (SMTP, Google). Target: **System → Integrations** in sidebar.

## Configuration fields

See `config/integration_settings.php`:

- **mail:** mailer, host, port, username, password (secret), from address, from name
- **google:** client_id, client_secret (secret), redirect URI

## API

- `GET /api/v1/admin/settings/{group}`
- `PATCH /api/v1/admin/settings/{group}`

## Validation

- Laravel registry keys only; unknown keys ignored.
- Secrets omitted or empty in PATCH → unchanged.

## Permissions

`is_admin` required.

## Security

See `ADMIN_CONFIGURATION_SECURITY.md`.

## Future integrations (not implemented)

Resend, SendGrid, SES, Stripe, S3, GA4 — require registry + backend before UI.

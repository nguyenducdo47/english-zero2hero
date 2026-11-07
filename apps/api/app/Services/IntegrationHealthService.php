<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Transport\Smtp\SmtpTransport;
use Throwable;

class IntegrationHealthService
{
    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    /**
     * @return array{ok: bool, status: string, message: string, checks: list<array{id: string, ok: bool, label: string, detail?: string}>}
     */
    public function mailHealth(): array
    {
        $this->settings->applyToConfig();
        $resolved = $this->settings->resolveAll();
        $admin = $this->settings->getGroupForAdmin('mail');

        $mailer = (string) ($resolved['mail.mailer'] ?? config('mail.default', 'log'));
        $checks = [
            $this->check('mailer', 'Mailer', $mailer !== ''),
        ];

        if ($mailer === 'smtp') {
            $checks[] = $this->check('host', 'SMTP host', filled($resolved['mail.host'] ?? null));
            $checks[] = $this->check('port', 'SMTP port', filled($resolved['mail.port'] ?? null));
            $from = $resolved['mail.from.address'] ?? null;
            $checks[] = $this->check(
                'from',
                'From address',
                is_string($from) && filter_var($from, FILTER_VALIDATE_EMAIL) !== false,
            );
            $passwordConfigured = ($admin['password']['configured'] ?? false) === true;
            $hasUser = filled($resolved['mail.username'] ?? null);
            if ($hasUser) {
                $checks[] = $this->check('password', 'SMTP password', $passwordConfigured, $passwordConfigured ? null : 'Not saved in DB or .env');
            }
        } elseif ($mailer === 'log') {
            $checks[] = [
                'id' => 'driver',
                'ok' => true,
                'label' => 'Driver',
                'detail' => 'Using log driver (dev) — no real delivery',
            ];
        } elseif ($mailer === 'array') {
            $checks[] = [
                'id' => 'driver',
                'ok' => true,
                'label' => 'Driver',
                'detail' => 'Array driver — no real delivery',
            ];
        }

        if ($mailer === 'smtp' && filled($resolved['mail.host'] ?? null) && filled($resolved['mail.port'] ?? null)) {
            $probe = $this->probeSmtpConnection();
            $checks[] = $this->check(
                'smtp_connection',
                'SMTP connection & auth',
                $probe['ok'],
                $probe['detail'] ?? null,
            );
        }

        $ok = collect($checks)->every(fn (array $c) => $c['ok']);
        $hasWarn = ! $ok && collect($checks)->contains(fn (array $c) => $c['ok']);
        $status = $ok ? 'ok' : ($hasWarn ? 'warning' : 'error');

        return [
            'ok' => $ok,
            'status' => $status,
            'message' => $ok
                ? ($mailer === 'log'
                    ? 'Mail logs locally (log driver).'
                    : ($mailer === 'smtp'
                        ? 'SMTP server reachable and credentials accepted.'
                        : 'Mail settings look complete.'))
                : ($mailer === 'smtp'
                    ? 'Fix failed checks — wrong host/port/credentials fail the SMTP probe.'
                    : 'Some mail settings are missing or invalid.'),
            'checks' => $checks,
        ];
    }

    /**
     * @return array{ok: bool, detail?: string}
     */
    private function probeSmtpConnection(): array
    {
        try {
            $this->settings->applyToConfig();

            $transport = Mail::mailer()->getSymfonyTransport();
            if (! $transport instanceof SmtpTransport) {
                return ['ok' => false, 'detail' => 'Active mailer is not SMTP.'];
            }

            $transport->start();
            $transport->stop();

            return ['ok' => true, 'detail' => 'Connected to SMTP (EHLO/auth OK).'];
        } catch (Throwable $e) {
            $msg = trim($e->getMessage());
            if ($msg === '') {
                $msg = $e::class;
            }
            if (mb_strlen($msg) > 220) {
                $msg = mb_substr($msg, 0, 217).'…';
            }

            return ['ok' => false, 'detail' => $msg];
        }
    }

    /**
     * @return array{ok: bool, status: string, message: string, checks: list<array{id: string, ok: bool, label: string, detail?: string}>}
     */
    public function googleHealth(): array
    {
        $this->settings->applyToConfig();
        $admin = $this->settings->getGroupForAdmin('google');

        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        $redirect = config('services.google.redirect');
        $oauthEnabled = (bool) config('services.google.oauth_enabled');
        $secretOk = ($admin['client_secret']['configured'] ?? false) === true;

        $clientIdFormatOk = is_string($clientId)
            && preg_match('/\.apps\.googleusercontent\.com$/', $clientId) === 1;

        $checks = [
            [
                'id' => 'oauth_enabled',
                'ok' => true,
                'label' => 'Frontend Google login',
                'detail' => $oauthEnabled
                    ? 'Enabled — login page shows Google sign-in.'
                    : 'Disabled — users cannot sign in with Google.',
            ],
            $this->check(
                'client_id',
                'Client ID',
                $clientIdFormatOk,
                $clientIdFormatOk ? null : 'Must end with .apps.googleusercontent.com',
            ),
            $this->check('client_secret', 'Client secret', $secretOk && filled($clientSecret)),
            $this->check(
                'redirect',
                'Redirect URI',
                is_string($redirect) && filter_var($redirect, FILTER_VALIDATE_URL) !== false,
            ),
        ];

        $redirectPathOk = is_string($redirect)
            && str_contains($redirect, '/api/v1/auth/google/callback');
        if (is_string($redirect) && $redirect !== '' && ! $redirectPathOk) {
            $checks[] = [
                'id' => 'redirect_path',
                'ok' => false,
                'label' => 'Callback path',
                'detail' => 'Should end with /api/v1/auth/google/callback',
            ];
        } elseif ($redirectPathOk) {
            $checks[] = [
                'id' => 'redirect_path',
                'ok' => true,
                'label' => 'Callback path',
            ];
        }

        $canProbe = $clientIdFormatOk
            && is_string($clientSecret) && $clientSecret !== ''
            && is_string($redirect) && $redirect !== '';

        if ($canProbe) {
            $probe = $this->probeGoogleOAuthCredentials($clientId, $clientSecret, $redirect);
            $checks[] = $this->check(
                'oauth_credentials',
                'Google API (client + secret)',
                $probe['ok'],
                $probe['detail'] ?? null,
            );
        }

        $ok = collect($checks)->every(fn (array $c) => $c['ok']);
        $hasWarn = ! $ok && collect($checks)->contains(fn (array $c) => $c['ok']);

        return [
            'ok' => $ok,
            'status' => $ok ? 'ok' : ($hasWarn ? 'warning' : 'error'),
            'message' => $ok
                ? 'Google accepted client ID, secret, and redirect URI.'
                : ($canProbe
                    ? 'Fix failed checks — wrong Client ID/secret often fails the Google API probe.'
                    : 'Complete Client ID, secret, and redirect URI (must match Google Console).'),
            'checks' => $checks,
        ];
    }

    /**
     * @return array{ok: bool, detail?: string}
     */
    private function probeGoogleOAuthCredentials(string $clientId, string $clientSecret, string $redirect): array
    {
        try {
            $response = Http::timeout(10)->asForm()->post('https://oauth2.googleapis.com/token', [
                'code' => 'e2h_oauth_health_probe_invalid',
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'redirect_uri' => $redirect,
                'grant_type' => 'authorization_code',
            ]);

            $error = (string) ($response->json('error') ?? '');

            if ($error === 'invalid_client') {
                return [
                    'ok' => false,
                    'detail' => 'Google rejected Client ID or Client secret.',
                ];
            }

            if ($error === 'redirect_uri_mismatch') {
                return [
                    'ok' => false,
                    'detail' => 'Redirect URI does not match this OAuth client in Google Console.',
                ];
            }

            if ($error === 'invalid_grant') {
                return [
                    'ok' => true,
                    'detail' => 'Credentials accepted (expected invalid_grant for probe).',
                ];
            }

            if ($response->successful()) {
                return ['ok' => false, 'detail' => 'Unexpected token response from Google.'];
            }

            return [
                'ok' => false,
                'detail' => $error !== '' ? "Google error: {$error}" : 'Unknown Google OAuth response.',
            ];
        } catch (Throwable $e) {
            return [
                'ok' => false,
                'detail' => 'Could not reach Google: '.$e->getMessage(),
            ];
        }
    }

    /**
     * @return array{ok: bool, message: string}
     */
    public function sendMailTest(string $to): array
    {
        $health = $this->mailHealth();
        if (! $health['ok']) {
            return [
                'ok' => false,
                'message' => 'Fix mail health checks before sending a test.',
            ];
        }

        try {
            $this->settings->applyToConfig();
            Mail::raw(
                'English Zero2Hero — admin SMTP test. If you received this, mail delivery works.',
                function ($message) use ($to): void {
                    $message->to($to)
                        ->subject('E2H — SMTP test');
                },
            );

            return ['ok' => true, 'message' => 'Test email queued/sent successfully.'];
        } catch (Throwable $e) {
            return [
                'ok' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * @return array{id: string, ok: bool, label: string, detail?: string}
     */
    private function check(string $id, string $label, bool $ok, ?string $detail = null): array
    {
        return array_filter([
            'id' => $id,
            'ok' => $ok,
            'label' => $label,
            'detail' => $detail,
        ], fn ($v) => $v !== null);
    }
}

<?php

namespace App\Http\Middleware;

use App\Support\LocaleHelper;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetApiLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $candidate = $request->header('X-Locale')
            ?? $request->query('locale')
            ?? $this->fromAcceptLanguage($request->header('Accept-Language'));

        $locale = LocaleHelper::resolve($candidate);
        App::setLocale($locale);
        $request->attributes->set('locale', $locale);

        $response = $next($request);
        $response->headers->set('Content-Language', $locale);

        return $response;
    }

    private function fromAcceptLanguage(?string $header): ?string
    {
        if (! $header) {
            return null;
        }

        foreach (explode(',', $header) as $part) {
            $lang = strtolower(trim(explode(';', $part)[0]));
            $primary = explode('-', $lang)[0];

            return $primary;
        }

        return null;
    }
}

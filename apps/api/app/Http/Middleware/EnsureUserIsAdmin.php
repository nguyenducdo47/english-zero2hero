<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user?->hasAdminAccess()) {
            return response()->json([
                'message' => __('api.forbidden_admin'),
            ], 403);
        }

        return $next($request);
    }
}

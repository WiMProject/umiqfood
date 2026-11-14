<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! auth()->check()) {
            return redirect()->route('login');
        }
        $user = auth()->user();
        if (! in_array($user->role, $roles)) {
            if ($user->isAdmin()) {
                return redirect()->route('dashboard');
            }

            return redirect()->route('home');
        }

        return $next($request);
    }
}

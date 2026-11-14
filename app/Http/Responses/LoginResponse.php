<?php

namespace App\Http\Responses;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Redirect pengguna setelah login sesuai role-nya.
     *
     * @param  Request  $request
     * @return JsonResponse|RedirectResponse
     */
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        $user = $request->user();
        $path = $user instanceof User && $user->isAdmin() ? '/dashboard' : '/home';

        return redirect()->intended($path);
    }
}

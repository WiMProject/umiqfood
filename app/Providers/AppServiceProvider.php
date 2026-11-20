<?php

namespace App\Providers;

use App\Http\Responses\LoginResponse;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Redirect setelah login mengikuti role (admin -> dashboard, user -> home)
        $this->app->singleton(LoginResponseContract::class, LoginResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Template email verifikasi dan reset password dengan tema UmiqFood.
        VerifyEmail::toMailUsing(function (User $notifiable, string $url) {
            $data = [
                'userName' => $notifiable->name,
                'verificationUrl' => $url,
            ];

            return (new MailMessage)
                ->subject('Verifikasi alamat email — UmiqFood')
                ->view('emails.verify-email', $data)
                ->text('emails.verify-email-text', $data);
        });

        ResetPassword::toMailUsing(function (User $notifiable, string $token) {
            $email = $notifiable->getEmailForPasswordReset();
            $url = url(route('password.reset', [
                'token' => $token,
                'email' => $email,
            ], false));
            $data = [
                'userName' => $notifiable->name,
                'email' => $email,
                'resetUrl' => $url,
                'expire' => config(
                    'auth.passwords.'.
                    config('auth.defaults.passwords').
                    '.expire'
                ),
            ];

            return (new MailMessage)
                ->subject('Ganti kata sandi akun UmiqFood')
                ->view('emails.reset-password', $data)
                ->text('emails.reset-password-text', $data);
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn (): ?Password => app()->isProduction()
                ? Password::min(12)
                    ->mixedCase()
                    ->letters()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
                : null,
        );
    }
}

import type { UrlMethodPair } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { KeyRound } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    routes?: {
        options: UrlMethodPair;
        submit: UrlMethodPair;
    };
    label?: string;
    loadingLabel?: string;
    separator?: string;
    separatorPosition?: 'before' | 'after';
    hint?: string;
};

export default function PasskeyVerify({
    routes,
    label,
    loadingLabel,
    separator,
    separatorPosition = 'after',
    hint,
}: Props = {}) {
    const { verify, isLoading, error, isSupported } = usePasskeyVerify({
        ...(routes && {
            routes: {
                options: routes.options.url,
                submit: routes.submit.url,
            },
        }),
        onSuccess: (response) => {
            router.visit(response.redirect ?? '/dashboard');
        },
    });

    if (!isSupported) {
        return null;
    }

    const separatorNode = separator ? (
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                    {separator}
                </span>
            </div>
        </div>
    ) : null;

    return (
        <>
            {separatorPosition === 'before' && separatorNode}

            <div className="grid gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full gap-2 rounded-xl"
                    onClick={verify}
                    disabled={isLoading}
                >
                    {isLoading ? <Spinner /> : <KeyRound className="h-4 w-4" />}
                    {isLoading
                        ? (loadingLabel ?? 'Authenticating...')
                        : (label ?? 'Sign in with a passkey')}
                </Button>
                {error && (
                    <InputError message={error} className="text-center" />
                )}
                {hint && (
                    <p className="text-center text-xs leading-relaxed text-muted-foreground">
                        {hint}
                    </p>
                )}
            </div>

            {separatorPosition === 'after' && separatorNode}
        </>
    );
}

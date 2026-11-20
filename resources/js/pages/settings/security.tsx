import { Form, Head } from '@inertiajs/react';
import {
    BadgeCheck,
    KeyRound,
    LoaderCircle,
    LockKeyhole,
    Save,
    ShieldCheck,
} from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import ManagePasskeys, {
    type Props as ManagePasskeysProps,
} from '@/components/manage-passkeys';
import ManageTwoFactor, {
    type Props as ManageTwoFactorProps,
} from '@/components/manage-two-factor';
import { SectionHeading } from '@/components/user-ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';

// oxfmt-ignore
type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Keamanan Akun" />

            <h1 className="sr-only">Keamanan akun</h1>

            <div className="space-y-6">
                <SectionHeading
                    eyebrow="Akun UmiqFood"
                    title="Keamanan akun"
                    description="Jaga akunmu tetap aman dengan kata sandi dan lapisan perlindungan tambahan."
                    icon={ShieldCheck}
                />

                <Card className="overflow-hidden rounded-2xl p-0 shadow-md shadow-emerald-950/5">
                    <div className="relative overflow-hidden border-b border-border/70 bg-gradient-to-r from-emerald-50/80 via-emerald-50/30 to-transparent px-5 py-4 dark:from-emerald-950/30 dark:via-emerald-950/10 dark:to-transparent">
                        <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/70" />
                        <div className="relative flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/15 dark:text-emerald-300">
                                    <LockKeyhole className="size-[18px]" />
                                </span>
                                <div>
                                    <h2 className="font-semibold">
                                        Perbarui kata sandi
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Gunakan kata sandi yang panjang dan
                                        unik.
                                    </p>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                            >
                                Direkomendasikan
                            </Badge>
                        </div>
                    </div>

                    <Form
                        {...SecurityController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-5 p-5 sm:p-6"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">
                                        Kata sandi saat ini
                                    </Label>
                                    <PasswordInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        autoComplete="current-password"
                                        placeholder="Kata sandi saat ini"
                                        icon={<LockKeyhole />}
                                    />
                                    <InputError
                                        message={errors.current_password}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        Kata sandi baru
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        autoComplete="new-password"
                                        placeholder="Kata sandi baru"
                                        passwordrules={props.passwordRules}
                                        icon={<KeyRound />}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Konfirmasi kata sandi baru
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        placeholder="Ulangi kata sandi baru"
                                        passwordrules={props.passwordRules}
                                        icon={<BadgeCheck />}
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                        Kata sandi baru langsung berlaku setelah
                                        disimpan.
                                    </p>
                                    <Button
                                        disabled={processing}
                                        data-test="update-password-button"
                                        className="h-10 gap-2 rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                                    >
                                        {processing ? (
                                            <LoaderCircle className="size-4 animate-spin" />
                                        ) : (
                                            <Save className="size-4" />
                                        )}
                                        {processing
                                            ? 'Menyimpan...'
                                            : 'Simpan kata sandi'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </Card>

                <ManageTwoFactor
                    canManageTwoFactor={props.canManageTwoFactor}
                    requiresConfirmation={props.requiresConfirmation}
                    twoFactorEnabled={props.twoFactorEnabled}
                />

                <ManagePasskeys
                    canManagePasskeys={props.canManagePasskeys}
                    passkeys={props.passkeys}
                />
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Keamanan akun',
            href: edit(),
        },
    ],
};

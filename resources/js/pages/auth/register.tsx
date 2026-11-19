import { Form, Head } from '@inertiajs/react';
import {
    ArrowRight,
    KeyRound,
    LockKeyhole,
    Mail,
    UserRound,
} from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Daftar" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama lengkap</Label>
                                <div className="relative">
                                    <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Nama lengkap"
                                        className="h-10 rounded-xl pl-10"
                                    />
                                </div>
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="nama@email.com"
                                        className="h-10 rounded-xl pl-10"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Buat password"
                                    passwordrules={passwordRules}
                                    className="h-10 rounded-xl"
                                    icon={<LockKeyhole />}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Konfirmasi password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Ulangi password"
                                    passwordrules={passwordRules}
                                    className="h-10 rounded-xl"
                                    icon={<LockKeyhole />}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-10 w-full gap-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <Spinner />
                                ) : (
                                    <ArrowRight className="size-4" />
                                )}
                                Buat akun
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-left dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                    <KeyRound className="size-4" />
                </span>
                <div>
                    <p className="text-sm font-semibold">
                        Passkey bisa dipakai setelah daftar
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Setelah akun jadi, buka{' '}
                        <span className="font-medium text-foreground">
                            Pengaturan → Keamanan
                        </span>{' '}
                        untuk menambahkan passkey. Berikutnya kamu bisa masuk
                        pakai password atau passkey.
                    </p>
                </div>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                Sudah punya akun?{' '}
                <TextLink href={login()} tabIndex={6}>
                    Masuk
                </TextLink>
            </div>
        </>
    );
}

Register.layout = {
    title: 'Buat akun UmiqFood',
    description:
        'Daftar dengan password dulu. Setelah akun jadi, kamu bisa menambahkan passkey untuk masuk tanpa password.',
};

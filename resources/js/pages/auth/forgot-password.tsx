import { Form, Head } from '@inertiajs/react';
import { ArrowRight, LoaderCircle, Mail, MailCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    // Pesan status dari Fortify berbahasa Inggris. Setiap status pada halaman
    // ini menandakan tautan berhasil dikirim, jadi tampilkan versi Indonesia.
    const pesanStatus = status
        ? 'Tautan reset kata sandi sudah dikirim ke emailmu. Cek inbox atau folder spam, ya.'
        : null;

    return (
        <>
            <Head title="Lupa password" />

            {pesanStatus && (
                <div
                    role="status"
                    className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200"
                >
                    <MailCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <p className="leading-relaxed">{pesanStatus}</p>
                </div>
            )}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Alamat email</Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                        placeholder="nama@email.com"
                                        className="h-11 rounded-xl pl-10"
                                    />
                                </div>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    Gunakan email yang terdaftar di akun
                                    UmiqFood kamu.
                                </p>
                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="h-11 w-full gap-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing ? (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    ) : (
                                        <ArrowRight className="size-4" />
                                    )}
                                    Kirim tautan reset
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="text-center text-sm text-muted-foreground">
                    Ingat kata sandimu?{' '}
                    <TextLink href={login()}>Kembali ke masuk</TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Lupa password',
    description:
        'Masukkan email akunmu untuk menerima tautan ganti kata sandi.',
};

import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    LoaderCircle,
    Mail,
    MailCheck,
    Save,
    UserRound,
} from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { SectionHeading } from '@/components/user-ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';
import { send } from '@/routes/verification';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Profil Saya" />

            <h1 className="sr-only">Profil saya</h1>

            <div className="space-y-6">
                <SectionHeading
                    eyebrow="Akun UmiqFood"
                    title="Profil saya"
                    description="Kelola nama dan alamat email yang terhubung ke akun kamu."
                    icon={UserRound}
                />

                <Card className="overflow-hidden rounded-2xl p-0 shadow-md shadow-emerald-950/5">
                    <div className="relative overflow-hidden border-b border-border/70 bg-gradient-to-r from-emerald-50/80 via-emerald-50/30 to-transparent px-5 py-4 dark:from-emerald-950/30 dark:via-emerald-950/10 dark:to-transparent">
                        <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/70" />
                        <div className="relative flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/15 dark:text-emerald-300">
                                    <UserRound className="size-[18px]" />
                                </span>
                                <div>
                                    <h2 className="font-semibold">
                                        Data pribadi
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Dipakai untuk detail pesanan pickup
                                        kamu.
                                    </p>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                            >
                                Pickup only
                            </Badge>
                        </div>
                    </div>

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-5 p-5 sm:p-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama lengkap</Label>
                                    <div className="relative">
                                        <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            className="h-11 pl-10"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder="Nama lengkap"
                                        />
                                    </div>
                                    <InputError
                                        className="mt-1"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Alamat email</Label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            className="h-11 pl-10"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="username"
                                            placeholder="nama@email.com"
                                        />
                                    </div>
                                    <InputError
                                        className="mt-1"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-200">
                                            <MailCheck className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                            <div className="min-w-0">
                                                <p>
                                                    Email kamu belum
                                                    terverifikasi.{' '}
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="font-semibold underline decoration-amber-400 underline-offset-4 transition hover:text-amber-700 dark:hover:text-amber-100"
                                                    >
                                                        Kirim ulang tautan
                                                    </Link>
                                                </p>
                                                {status ===
                                                    'verification-link-sent' && (
                                                    <p className="mt-1 flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-300">
                                                        <BadgeCheck className="size-4" />
                                                        Tautan baru sudah
                                                        dikirim ke email kamu.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <BadgeCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                        Perubahan akan langsung tersimpan di
                                        akun kamu.
                                    </p>
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                        className="h-10 gap-2 rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                                    >
                                        {processing ? (
                                            <LoaderCircle className="size-4 animate-spin" />
                                        ) : (
                                            <Save className="size-4" />
                                        )}
                                        {processing
                                            ? 'Menyimpan...'
                                            : 'Simpan perubahan'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </Card>

                <DeleteUser />
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profil saya',
            href: edit(),
        },
    ],
};

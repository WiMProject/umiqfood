// Components
import { Form, Head } from '@inertiajs/react';
import { MailCheck, Send } from 'lucide-react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Verifikasi email" />

            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3.5 dark:border-emerald-900/70 dark:bg-emerald-950/40">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                    <MailCheck className="size-4.5" />
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                        Cek kotak masuk emailmu
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-800/80 dark:text-emerald-200/75">
                        Kami sudah mengirim tautan verifikasi ke alamat email
                        yang kamu daftarkan. Klik tautan tersebut untuk
                        mengaktifkan akun UmiqFood kamu.
                    </p>
                </div>
            </div>

            {status === 'verification-link-sent' && (
                <div
                    role="status"
                    className="mb-5 rounded-xl border border-teal-200/70 bg-teal-50/80 px-4 py-3 text-sm text-teal-800 dark:border-teal-900/70 dark:bg-teal-950/40 dark:text-teal-200"
                >
                    Tautan verifikasi baru sudah dikirim. Cek inbox atau folder
                    spam kamu, ya.
                </div>
            )}

            <Form {...send.form()} className="space-y-4 text-center">
                {({ processing }) => (
                    <>
                        <Button
                            disabled={processing}
                            className="h-11 w-full gap-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                        >
                            {processing ? (
                                <Spinner />
                            ) : (
                                <Send className="size-4" />
                            )}
                            Kirim ulang email verifikasi
                        </Button>

                        <div className="text-sm text-muted-foreground">
                            Sudah selesai?{' '}
                            <TextLink
                                href={logout()}
                                className="font-medium text-emerald-700 decoration-emerald-300 hover:text-emerald-800 dark:text-emerald-300 dark:decoration-emerald-800"
                            >
                                Keluar dari akun
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verifikasi email',
    description:
        'Satu langkah lagi untuk mulai memesan masakan rumahan di UmiqFood.',
};

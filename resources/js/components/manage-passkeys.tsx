import { router } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { destroy } from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyRegistrationController';
import PasskeyItem from '@/components/passkey-item';
import PasskeyRegistration from '@/components/passkey-register';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Passkey } from '@/types/auth';

export type Props = {
    canManagePasskeys?: boolean;
    passkeys?: Passkey[];
};

function PasskeyKosong() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-emerald-200/70 bg-emerald-50/30 px-6 py-10 text-center dark:border-emerald-900/70 dark:bg-emerald-950/15">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15 dark:text-emerald-300">
                <KeyRound className="size-7" />
            </span>
            <div>
                <p className="font-semibold">Belum ada passkey</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                    Tambahkan passkey untuk login tanpa kata sandi.
                </p>
            </div>
        </div>
    );
}

export default function ManagePasskeys(props: Props) {
    const passkeys = props.passkeys ?? [];

    const handleDelete = (id: number, onError: () => void) => {
        router.delete(destroy.url(id), {
            preserveScroll: true,
            onError,
        });
    };

    const handleRegisterSuccess = () => {
        router.reload();
    };

    if (!(props.canManagePasskeys ?? false)) {
        return null;
    }

    return (
        <Card className="overflow-hidden rounded-2xl p-0 shadow-md shadow-emerald-950/5">
            <div className="relative overflow-hidden border-b border-border/70 bg-gradient-to-r from-emerald-50/80 via-emerald-50/30 to-transparent px-5 py-4 dark:from-emerald-950/30 dark:via-emerald-950/10 dark:to-transparent">
                <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/70" />
                <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/15 dark:text-emerald-300">
                            <KeyRound className="size-[18px]" />
                        </span>
                        <div>
                            <h2 className="font-semibold">Passkey</h2>
                            <p className="text-xs text-muted-foreground">
                                Login cepat tanpa mengetik kata sandi.
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className="border-border bg-muted text-muted-foreground"
                    >
                        {passkeys.length} tersimpan
                    </Badge>
                </div>
            </div>

            <div className="p-5 sm:p-6">
                {passkeys.length > 0 ? (
                    <div className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70">
                        {passkeys.map((passkey) => (
                            <PasskeyItem
                                key={passkey.id}
                                passkey={passkey}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <PasskeyKosong />
                )}

                <div className="mt-5">
                    <PasskeyRegistration onSuccess={handleRegisterSuccess} />
                </div>
            </div>
        </Card>
    );
}

import { Form } from '@inertiajs/react';
import { LoaderCircle, ShieldCheck, ShieldOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';

export type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function ManageTwoFactor(props: Props) {
    const requiresConfirmation = props.requiresConfirmation ?? false;
    const twoFactorEnabled = props.twoFactorEnabled ?? false;

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    if (!(props.canManageTwoFactor ?? false)) {
        return null;
    }

    return (
        <Card className="overflow-hidden rounded-2xl p-0 shadow-md shadow-emerald-950/5">
            <div className="relative overflow-hidden border-b border-border/70 bg-gradient-to-r from-emerald-50/80 via-emerald-50/30 to-transparent px-5 py-4 dark:from-emerald-950/30 dark:via-emerald-950/10 dark:to-transparent">
                <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/70" />
                <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/15 dark:text-emerald-300">
                            <ShieldCheck className="size-[18px]" />
                        </span>
                        <div>
                            <h2 className="font-semibold">
                                Autentikasi dua faktor
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Lapisan keamanan tambahan saat login.
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className={
                            twoFactorEnabled
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'border-border bg-muted text-muted-foreground'
                        }
                    >
                        {twoFactorEnabled ? 'Aktif' : 'Belum aktif'}
                    </Badge>
                </div>
            </div>

            <div className="p-5 sm:p-6">
                {twoFactorEnabled ? (
                    <div className="space-y-5">
                        <p className="text-sm text-muted-foreground">
                            Saat login, kamu akan diminta PIN acak dari aplikasi
                            TOTP di ponselmu.
                        </p>

                        <Form {...disable.form()}>
                            {({ processing }) => (
                                <Button
                                    variant="destructive"
                                    type="submit"
                                    disabled={processing}
                                    className="gap-2 rounded-xl"
                                >
                                    {processing ? (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    ) : (
                                        <ShieldOff className="size-4" />
                                    )}
                                    Nonaktifkan 2FA
                                </Button>
                            )}
                        </Form>

                        <TwoFactorRecoveryCodes
                            recoveryCodesList={recoveryCodesList}
                            fetchRecoveryCodes={fetchRecoveryCodes}
                            errors={errors}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-xl text-sm text-muted-foreground">
                            Saat 2FA aktif, kamu akan diminta PIN dari aplikasi
                            TOTP di ponselmu setiap kali login.
                        </p>

                        <div className="shrink-0">
                            {hasSetupData ? (
                                <Button
                                    onClick={() => setShowSetupModal(true)}
                                    className="h-10 gap-2 rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                                >
                                    <ShieldCheck className="size-4" />
                                    Lanjutkan pengaturan
                                </Button>
                            ) : (
                                <Form
                                    {...enable.form()}
                                    onSuccess={() => setShowSetupModal(true)}
                                >
                                    {({ processing }) => (
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-10 gap-2 rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                                        >
                                            {processing ? (
                                                <LoaderCircle className="size-4 animate-spin" />
                                            ) : (
                                                <ShieldCheck className="size-4" />
                                            )}
                                            Aktifkan 2FA
                                        </Button>
                                    )}
                                </Form>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </Card>
    );
}

import { Head } from '@inertiajs/react';
import { MonitorSmartphone, Palette, Sparkles } from 'lucide-react';
import AppearanceTabs from '@/components/appearance-tabs';
import { SectionHeading } from '@/components/user-ui';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAppearance } from '@/hooks/use-appearance';
import { edit as editAppearance } from '@/routes/appearance';

const LABEL_TEMA = {
    light: 'Terang',
    dark: 'Gelap',
    system: 'Sistem',
} as const;

export default function Appearance() {
    const { appearance } = useAppearance();

    return (
        <>
            <Head title="Pengaturan Tampilan" />

            <h1 className="sr-only">Pengaturan tampilan</h1>

            <div className="space-y-6">
                <SectionHeading
                    eyebrow="Personalisasi"
                    title="Tampilan"
                    description="Pilih tema yang paling nyaman dipakai saat memesan dan mengecek pesanan."
                    icon={Palette}
                />

                <Card className="overflow-hidden rounded-2xl p-0 shadow-md shadow-emerald-950/5">
                    <div className="relative overflow-hidden border-b border-border/70 bg-gradient-to-r from-emerald-50/80 via-emerald-50/30 to-transparent px-5 py-4 dark:from-emerald-950/30 dark:via-emerald-950/10 dark:to-transparent">
                        <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/70" />
                        <div className="relative flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/15 dark:text-emerald-300">
                                    <Sparkles className="size-[18px]" />
                                </span>
                                <div>
                                    <h2 className="font-semibold">
                                        Mode tampilan
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Berlaku untuk seluruh halaman UmiqFood.
                                    </p>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                            >
                                {LABEL_TEMA[appearance]}
                            </Badge>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6">
                        <AppearanceTabs />

                        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-200">
                            <MonitorSmartphone className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <p>
                                Pilihan tema disimpan di perangkat ini. Mode
                                <span className="font-semibold">
                                    {' '}
                                    Sistem
                                </span>{' '}
                                akan mengikuti pengaturan tema bawaan ponsel
                                atau komputermu.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan tampilan',
            href: editAppearance(),
        },
    ],
};

import { Link, usePage } from '@inertiajs/react';
import {
    Moon,
    ShieldCheck,
    ShoppingBag,
    Sun,
    UtensilsCrossed,
} from 'lucide-react';
import AuthShowcase from '@/components/auth-showcase';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import type {
    AuthLayoutProps,
    AuthShowcase as AuthShowcaseData,
} from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const { authShowcase } = usePage<{
        authShowcase?: AuthShowcaseData | null;
    }>().props;

    return (
        <div className="grid min-h-svh bg-background text-foreground lg:grid-cols-[1.05fr_1fr]">
            <aside className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 p-10 text-white lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col xl:p-14">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_88%_82%,rgba(20,184,166,0.38),transparent_48%)]" />
                <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute top-1/3 -left-28 size-72 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute right-16 bottom-24 size-40 rounded-full bg-white/5 blur-2xl" />

                <Link
                    href="/"
                    className="relative z-10 flex w-fit items-center gap-2.5"
                >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
                        <UtensilsCrossed className="size-5" />
                    </span>
                    <span className="text-xl font-extrabold tracking-tight">
                        Umiq
                        <span className="text-emerald-200">Food</span>
                    </span>
                </Link>

                <div className="relative z-10 flex min-h-0 flex-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.35)_transparent] flex-col lg:overflow-y-auto">
                    <div className="my-auto w-full max-w-xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-50 backdrop-blur">
                            <ShoppingBag className="size-3.5" />
                            Pickup only · tanpa biaya antar
                        </span>

                        <h2 className="mt-4 text-[2rem] leading-[1.08] font-extrabold tracking-tight xl:text-[2.6rem]">
                            Masakan rumahan,
                            <br />
                            <span className="text-emerald-200">
                                siap diambil tanpa antre.
                            </span>
                        </h2>

                        <AuthShowcase
                            showcase={authShowcase}
                            tone="brand"
                            className="mt-6"
                        />
                    </div>
                </div>

                <p className="relative z-10 pt-6 text-xs text-emerald-100/60">
                    © {new Date().getFullYear()} UmiqFood · Masakan rumahan,
                    diambil saat siap.
                </p>
            </aside>

            <main className="relative flex min-h-svh flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_42%)] px-4 py-8 sm:px-6 lg:overflow-y-auto lg:px-10 lg:py-10 dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_42%)]">
                <div className="pointer-events-none absolute -top-28 -right-28 size-72 rounded-full bg-emerald-500/10 blur-3xl lg:hidden" />

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                        updateAppearance(
                            resolvedAppearance === 'dark' ? 'light' : 'dark',
                        )
                    }
                    aria-label="Ganti tema"
                    className="absolute top-4 right-4 z-20 rounded-full border border-border/60 bg-background/70 backdrop-blur sm:top-5 sm:right-5"
                >
                    <Sun className="hidden size-4.5 dark:block" />
                    <Moon className="size-4.5 dark:hidden" />
                </Button>

                <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center pt-8 sm:pt-0">
                    <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/25">
                                <UtensilsCrossed className="size-5" />
                            </span>
                            <span className="text-xl font-extrabold tracking-tight">
                                Umiq
                                <span className="text-emerald-600 dark:text-emerald-400">
                                    Food
                                </span>
                            </span>
                        </Link>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300">
                            <ShoppingBag className="size-3" />
                            Pickup only · bayar saat ambil
                        </span>
                    </div>

                    <div className="mb-6 space-y-2 text-center lg:text-left">
                        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>

                    <div className="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-xl shadow-emerald-950/5 backdrop-blur sm:p-7">
                        {children}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            Bayar cash atau QRIS
                        </span>
                        <span className="flex items-center gap-1.5">
                            <ShoppingBag className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            Tanpa biaya antar
                        </span>
                    </div>

                    <Link
                        href="/"
                        className="mt-4 text-center text-xs text-muted-foreground transition hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                        Kembali ke beranda
                    </Link>

                    <AuthShowcase
                        showcase={authShowcase}
                        tone="default"
                        className="mt-8 border-t border-border/60 pt-6 lg:hidden"
                    />
                </div>
            </main>
        </div>
    );
}

import { Link, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    Home,
    LogOut,
    Menu,
    Moon,
    Settings,
    ShoppingBag,
    Sun,
    UtensilsCrossed,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from 'cn';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useAppearance } from '@/hooks/use-appearance';
import type { KeranjangRingkas } from '@/types';

interface SharedProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        } | null;
    };
    keranjang: KeranjangRingkas;
    pesananAktif: number;
    [key: string]: unknown;
}

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const page = usePage<SharedProps>();
    const { auth, keranjang, pesananAktif } = page.props;
    const url = page.url;
    const [menuTerbuka, setMenuTerbuka] = useState(false);
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const tab = new URLSearchParams(url.split('?')[1] ?? '').get('tab');
    const diAkun = url.startsWith('/akun');

    const navigasi = [
        {
            label: 'Beranda',
            href: '/home',
            icon: Home,
            aktif: url.startsWith('/home'),
            badge: 0,
        },
        {
            label: 'Pesanan',
            href: '/akun?tab=pesanan',
            icon: ClipboardList,
            aktif: diAkun && tab !== 'keranjang',
            badge: pesananAktif,
        },
        {
            label: 'Keranjang',
            href: '/akun?tab=keranjang',
            icon: ShoppingBag,
            aktif: diAkun && tab === 'keranjang',
            badge: keranjang.jumlah,
        },
    ];

    const inisial = auth.user?.name?.charAt(0).toUpperCase() ?? 'U';

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-600/30">
                            <UtensilsCrossed className="size-4.5" />
                        </span>
                        <span className="text-lg font-extrabold tracking-tight">
                            Umiq
                            <span className="text-emerald-600 dark:text-emerald-400">
                                Food
                            </span>
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        {navigasi.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    'relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
                                    item.aktif
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                <item.icon className="size-4" />
                                {item.label}
                                {item.badge > 0 && (
                                    <span className="flex min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-bold text-white">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-1.5">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                updateAppearance(
                                    resolvedAppearance === 'dark'
                                        ? 'light'
                                        : 'dark',
                                )
                            }
                            aria-label="Ganti tema"
                            className="hidden rounded-full md:inline-flex"
                        >
                            <Sun className="hidden size-4.5 dark:block" />
                            <Moon className="size-4.5 dark:hidden" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="hidden items-center gap-2 rounded-full border border-border p-1 pr-3 transition hover:bg-muted md:flex"
                                >
                                    <Avatar className="size-8">
                                        <AvatarFallback className="bg-emerald-600 text-xs font-semibold text-white">
                                            {inisial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
                                        {auth.user?.name}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <p className="text-sm font-semibold">
                                        {auth.user?.name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {auth.user?.email}
                                    </p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/akun">
                                        <ClipboardList className="size-4" />
                                        Pesanan saya
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/profile">
                                        <Settings className="size-4" />
                                        Pengaturan akun
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full text-red-600 focus:text-red-600 dark:text-red-400"
                                    >
                                        <LogOut className="size-4" />
                                        Keluar
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Sheet open={menuTerbuka} onOpenChange={setMenuTerbuka}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full md:hidden"
                                    aria-label="Buka menu"
                                >
                                    <Menu className="size-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="flex w-[86vw] flex-col overflow-y-auto sm:max-w-sm"
                            >
                                <SheetHeader className="pr-10 text-left">
                                    <SheetTitle>Menu</SheetTitle>
                                    <SheetDescription className="sr-only">
                                        Navigasi, profil, dan pengaturan
                                        tampilan UmiqFood.
                                    </SheetDescription>
                                </SheetHeader>

                                <div className="mt-4 flex flex-col gap-1 px-2">
                                    <div className="mb-2 flex items-center gap-3 rounded-2xl border border-border/70 bg-gradient-to-br from-emerald-50 to-teal-50 p-3 dark:from-emerald-950/40 dark:to-teal-950/25">
                                        <Avatar className="size-10">
                                            <AvatarFallback className="bg-emerald-600 text-sm font-semibold text-white">
                                                {inisial}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {auth.user?.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {auth.user?.email}
                                            </p>
                                        </div>
                                    </div>

                                    {navigasi.map((item) => (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            onClick={() =>
                                                setMenuTerbuka(false)
                                            }
                                            className={cn(
                                                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                                                item.aktif
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                    : 'text-muted-foreground hover:bg-muted',
                                            )}
                                        >
                                            <item.icon className="size-4.5" />
                                            <span className="flex-1">
                                                {item.label}
                                            </span>
                                            {item.badge > 0 && (
                                                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>

                                <div className="my-3 h-px bg-border" />

                                <div className="px-2">
                                    <p className="px-1 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Tampilan
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateAppearance(
                                                resolvedAppearance === 'dark'
                                                    ? 'light'
                                                    : 'dark',
                                            )
                                        }
                                        aria-pressed={
                                            resolvedAppearance === 'dark'
                                        }
                                        className="flex w-full items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2.5 text-left transition hover:bg-muted"
                                    >
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                            <Sun className="hidden size-4 dark:block" />
                                            <Moon className="size-4 dark:hidden" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-medium">
                                                {resolvedAppearance === 'dark'
                                                    ? 'Mode terang'
                                                    : 'Mode gelap'}
                                            </span>
                                            <span className="block text-[11px] text-muted-foreground">
                                                Ketuk untuk mengganti tema
                                            </span>
                                        </span>
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                                                resolvedAppearance === 'dark'
                                                    ? 'bg-emerald-600'
                                                    : 'bg-muted-foreground/30',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all',
                                                    resolvedAppearance ===
                                                        'dark'
                                                        ? 'left-[22px]'
                                                        : 'left-0.5',
                                                )}
                                            />
                                        </span>
                                    </button>
                                </div>

                                <div className="my-3 h-px bg-border" />

                                <div className="mt-auto flex flex-col gap-1 px-2 pb-4">
                                    <Link
                                        href="/settings/profile"
                                        onClick={() => setMenuTerbuka(false)}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted"
                                    >
                                        <Settings className="size-4.5" />
                                        Pengaturan akun
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        onClick={() => setMenuTerbuka(false)}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                    >
                                        <LogOut className="size-4.5" />
                                        Keluar
                                    </Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-border/70 bg-muted/30">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
                    <p>
                        © {new Date().getFullYear()} UmiqFood — masakan rumahan,
                        diambil saat siap.
                    </p>
                    <p className="flex items-center gap-1.5">
                        <ShoppingBag className="size-3.5" />
                        Pickup only · tanpa biaya antar
                    </p>
                </div>
            </footer>
        </div>
    );
}

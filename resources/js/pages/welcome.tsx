import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ChefHat,
    Clock,
    ShieldCheck,
    Star,
    Utensils,
    Sparkles,
    Megaphone,
} from 'lucide-react';
import { useEffect, useRef, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Kategori {
    id: number;
    nama: string;
    icon?: string;
    masakans_count?: number;
}

interface Masakan {
    id: number;
    nama: string;
    deskripsi: string | null;
    harga_format: string;
    foto_url: string | null;
    jumlah_porsi: number;
    kategori?: Kategori;
}

// Kartu foto dengan skeleton saat gambar masih loading
function FotoMenu({
    src,
    alt,
    className,
    emoji,
}: {
    src: string | null;
    alt: string;
    className?: string;
    emoji?: string;
}) {
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement | null>(null);

    // Gambar yang sudah ter-cache tidak selalu memicu event onLoad,
    // jadi cek statusnya saat komponen pertama kali dirender.
    useEffect(() => {
        if (imgRef.current?.complete) setLoaded(true);
    }, []);

    if (!src) {
        return (
            <div className={`${className} flex items-center justify-center bg-emerald-100 text-5xl`}>
                {emoji || <Utensils className="h-10 w-10 text-emerald-500" />}
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <Skeleton className="absolute inset-0 rounded-none" />
                    <Spinner className="z-10 size-6 text-emerald-600" />
                </div>
            )}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                className={`h-full w-full object-cover transition duration-300 ${
                    loaded ? 'opacity-100' : 'opacity-0'
                }`}
            />
        </div>
    );
}

export default function Welcome() {
    const { auth, masakans, kategoris } = usePage<{
        auth: { user: { name: string; role: string } | null };
        masakans: Masakan[];
        kategoris: Kategori[];
    }>().props;

    const [halaman, setHalaman] = useState(1);
    const perHalaman = 6;

    const totalHalaman = Math.max(1, Math.ceil(masakans.length / perHalaman));
    const menuHalamanIni = masakans.slice(
        (halaman - 1) * perHalaman,
        halaman * perHalaman,
    );

    const dataChart = useMemo(
        () =>
            kategoris
                .filter((k) => (k.masakans_count ?? 0) > 0)
                .map((k) => ({ nama: k.nama, menu: k.masakans_count ?? 0 })),
        [kategoris],
    );

    const chartConfig = {
        menu: { label: 'Jumlah Menu', color: 'var(--color-emerald-600, #059669)' },
    } satisfies ChartConfig;

    const featured = masakans.slice(0, 4);

    return (
        <>
            <Head title="UmiqFood — Selamat Datang" />

            <div className="min-h-screen bg-emerald-50/50">
                {/* Alert promo */}
                <div className="bg-emerald-800 py-2">
                    <Alert className="mx-auto max-w-6xl border-none bg-transparent px-6 py-0 text-emerald-100">
                        <Megaphone className="size-4" />
                        <AlertTitle className="mb-0 text-sm">
                            Promo hari ini: gratis ongkir untuk pemesanan pertamamu!
                        </AlertTitle>
                        <AlertDescription className="sr-only">
                            Berlaku untuk semua menu di UmiqFood.
                        </AlertDescription>
                    </Alert>
                </div>

                {/* Navbar */}
                <nav className="sticky top-0 z-50 border-b border-emerald-100 bg-white/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🍱</span>
                            <span className="text-xl font-bold text-emerald-600">
                                UmiqFood
                            </span>
                        </div>

                        <div className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
                            <a href="#menu" className="transition hover:text-emerald-600">Menu</a>
                            <a href="#kategori" className="transition hover:text-emerald-600">Kategori</a>
                            <a href="#cara-pesan" className="transition hover:text-emerald-600">Cara Pesan</a>
                        </div>

                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={auth.user.role === 'admin' ? '/dashboard' : '/home'}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                                >
                                    {auth.user.role === 'admin' ? (
                                        <>Dashboard Admin</>
                                    ) : (
                                        <>Halaman User <ArrowRight className="h-4 w-4" /></>
                                    )}
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero + Carousel menu unggulan */}
                <section className="relative overflow-hidden">
                    <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2 md:py-20">
                        <div>
                            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
                                <ChefHat className="h-4 w-4" /> Masakan rumahan, rasa juara
                            </span>
                            <h1 className="mb-4 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
                                Lapar? Pesan Masakan{' '}
                                <span className="text-emerald-600">Favoritmu</span> di UmiqFood!
                            </h1>
                            <p className="mb-8 text-lg text-gray-500">
                                Pilih menu, pesan dalam hitungan menit, nikmati
                                tanpa repot masak. Semudah itu!
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="#menu"
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                                >
                                    Lihat Menu <ArrowRight className="h-4 w-4" />
                                </Link>
                                {!auth.user && (
                                    <Link
                                        href="/register"
                                        className="rounded-xl border border-emerald-200 bg-white px-6 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"
                                    >
                                        Daftar Sekarang
                                    </Link>
                                )}
                            </div>

                            <div className="mt-10 grid grid-cols-3 gap-4 text-center">
                                {[
                                    { icon: Utensils, label: 'Menu Beragam' },
                                    { icon: Clock, label: 'Pesan Cepat' },
                                    { icon: ShieldCheck, label: 'Terpercaya' },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <p className="text-xs font-medium text-gray-600">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Carousel foto menu */}
                        <div className="relative">
                            <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-emerald-200/60 blur-3xl" />
                            <Carousel className="relative w-full">
                                <CarouselContent className="ml-2">
                                    {featured.map((item) => (
                                        <CarouselItem key={item.id} className="pl-2">
                                            <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-lg">
                                                <FotoMenu
                                                    src={item.foto_url}
                                                    alt={item.nama}
                                                    className="aspect-video w-full"
                                                    emoji="🍱"
                                                />
                                                <div className="flex items-center justify-between p-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            {item.nama}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {item.kategori?.icon} {item.kategori?.nama || '-'}
                                                        </p>
                                                    </div>
                                                    <span className="font-bold text-emerald-600">
                                                        {item.harga_format}
                                                    </span>
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-2 size-9 border-emerald-100 bg-white/90 text-emerald-700 hover:bg-emerald-50" />
                                <CarouselNext className="right-2 size-9 border-emerald-100 bg-white/90 text-emerald-700 hover:bg-emerald-50" />
                            </Carousel>

                            <div className="mt-4 rounded-2xl bg-emerald-600 p-5 text-white shadow-lg shadow-emerald-600/30">
                                <div className="flex items-center gap-1 text-yellow-300">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-current" />
                                    ))}
                                </div>
                                <p className="mt-2 text-sm font-medium">
                                    "Masakannya enak-enak, pesannya gampang!"
                                </p>
                                <p className="mt-1 text-xs text-emerald-200">
                                    — Pelanggan UmiqFood
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Kategori + Chart */}
                <section id="kategori" className="mx-auto max-w-6xl px-6 py-12">
                    <h2 className="mb-6 text-2xl font-bold text-gray-900">
                        Mau masakan apa hari ini?
                    </h2>
                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="flex flex-wrap content-start gap-3">
                            {kategoris.map((kategori) => (
                                <div
                                    key={kategori.id}
                                    className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
                                >
                                    <span className="text-lg">{kategori.icon}</span>
                                    {kategori.nama}
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                                        {kategori.masakans_count ?? 0}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Chart menu per kategori */}
                        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                <Sparkles className="h-4 w-4 text-emerald-600" />
                                Menu per Kategori
                            </p>
                            <ChartContainer config={chartConfig} className="h-40 w-full">
                                <BarChart data={dataChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="nama"
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={11}
                                        interval={0}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent nameKey="menu" />} />
                                    <Bar dataKey="menu" fill="var(--color-menu)" radius={6} />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </div>
                </section>

                {/* Menu + Pagination */}
                <section id="menu" className="mx-auto max-w-6xl px-6 py-12">
                    <div className="mb-6 flex items-end justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Menu Andalan</h2>
                            <p className="text-sm text-gray-500">
                                {masakans.length} masakan tersedia — halaman {halaman} dari {totalHalaman}
                            </p>
                        </div>
                        <Link
                            href={auth.user ? '/home' : '/login'}
                            className="hidden items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 sm:inline-flex"
                        >
                            Lihat semua <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {masakans.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-12 text-center">
                            <div className="mb-3 text-4xl">🍽️</div>
                            <p className="font-medium text-gray-700">Menu belum tersedia</p>
                            <p className="text-sm text-gray-400">
                                Admin belum menambahkan menu. Nantikan update menunya!
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {menuHalamanIni.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group flex flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <Drawer>
                                            <DrawerTrigger asChild>
                                                <button type="button" className="text-left focus:outline-none">
                                                    <FotoMenu
                                                        src={item.foto_url}
                                                        alt={item.nama}
                                                        className="aspect-video w-full"
                                                        emoji="🍱"
                                                    />
                                                </button>
                                            </DrawerTrigger>
                                            <DrawerContent>
                                                <div className="mx-auto w-full max-w-md pb-8">
                                                    <DrawerHeader>
                                                        <DrawerTitle className="text-lg font-bold">
                                                            {item.kategori?.icon} {item.nama}
                                                        </DrawerTitle>
                                                        <DrawerDescription>
                                                            {item.deskripsi || 'Masakan spesial buatan rumahan.'}
                                                        </DrawerDescription>
                                                    </DrawerHeader>

                                                    <div className="px-4">
                                                        <FotoMenu
                                                            src={item.foto_url}
                                                            alt={item.nama}
                                                            className="aspect-video w-full rounded-xl"
                                                            emoji="🍱"
                                                        />
                                                        {/* Detail dalam bentuk tabel */}
                                                        <Table className="mt-4">
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead colSpan={2} className="text-xs text-gray-400">
                                                                        Detail Menu
                                                                    </TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                <TableRow>
                                                                    <TableCell className="text-gray-500">Kategori</TableCell>
                                                                    <TableCell className="text-right font-medium">
                                                                        {item.kategori?.icon} {item.kategori?.nama || '-'}
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell className="text-gray-500">Harga</TableCell>
                                                                    <TableCell className="text-right font-bold text-emerald-600">
                                                                        {item.harga_format}
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell className="text-gray-500">Status</TableCell>
                                                                    <TableCell className="text-right">
                                                                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                                                            Tersedia
                                                                        </span>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            </DrawerContent>
                                        </Drawer>

                                        <div className="flex flex-1 flex-col p-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-400">
                                                    {item.kategori?.icon} {item.kategori?.nama || '-'}
                                                </span>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        item.jumlah_porsi > 0
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {item.jumlah_porsi > 0
                                                        ? `Sisa ${item.jumlah_porsi} porsi`
                                                        : 'Porsi habis'}
                                                </span>
                                            </div>
                                            <h3 className="mt-1 font-semibold text-gray-900">{item.nama}</h3>
                                            <p className="mt-0.5 line-clamp-2 min-h-10 text-sm text-gray-500">
                                                {item.deskripsi || 'Masakan spesial buatan rumahan.'}
                                            </p>
                                            <div className="mt-auto flex items-center justify-between pt-3">
                                                <span className="font-bold text-emerald-600">
                                                    {item.harga_format}
                                                </span>

                                                {/* Konfirmasi pesan pakai AlertDialog */}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Link
                                                            href={auth.user ? '/home' : '/login'}
                                                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                                                        >
                                                            + Pesan
                                                        </Link>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Lanjut ke pemesanan?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Kamu akan diarahkan ke katalog lengkap untuk
                                                                memesan {item.nama} ({item.harga_format}).
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction asChild>
                                                                <Link href={auth.user ? '/home' : '/login'}>
                                                                    {auth.user ? 'Lanjut' : 'Login dulu'}
                                                                </Link>
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination menu */}
                            {totalHalaman > 1 && (
                                <Pagination className="mt-8">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#menu"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setHalaman((h) => Math.max(1, h - 1));
                                                }}
                                                className={halaman === 1 ? 'pointer-events-none opacity-40' : ''}
                                            />
                                        </PaginationItem>
                                        {[...Array(totalHalaman)].map((_, i) => (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    href="#menu"
                                                    isActive={halaman === i + 1}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setHalaman(i + 1);
                                                    }}
                                                >
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                href="#menu"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setHalaman((h) => Math.min(totalHalaman, h + 1));
                                                }}
                                                className={halaman === totalHalaman ? 'pointer-events-none opacity-40' : ''}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </>
                    )}
                </section>

                {/* Cara Pesan */}
                <section id="cara-pesan" className="mx-auto max-w-6xl px-6 py-12">
                    <div className="rounded-3xl bg-emerald-600 px-8 py-12 text-center text-white md:px-16">
                        <h2 className="mb-2 text-2xl font-bold md:text-3xl">Pesan dalam 3 langkah</h2>
                        <p className="mb-10 text-emerald-200">Semudah itu, masakan siap dinikmati.</p>
                        <div className="grid gap-8 md:grid-cols-3">
                            {[
                                { emoji: '📝', title: '1. Pilih Menu', desc: 'Jelajahi katalog masakan dan pilih favoritmu.' },
                                { emoji: '🛒', title: '2. Masukkan Keranjang', desc: 'Atur pesanan sesuai selera dan jumlahnya.' },
                                { emoji: '🍽️', title: '3. Pesanan Siap', desc: 'Tunggu konfirmasi, lalu nikmati masakannya!' },
                            ].map((step) => (
                                <div key={step.title} className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                                    <div className="mb-3 text-4xl">{step.emoji}</div>
                                    <h3 className="mb-1 font-semibold">{step.title}</h3>
                                    <p className="text-sm text-emerald-100">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-emerald-100 bg-white">
                    <div className="mx-auto max-w-6xl px-6 py-10">
                        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                            <div>
                                <div className="mb-1 flex items-center gap-2">
                                    <span className="text-2xl">🍱</span>
                                    <span className="text-lg font-bold text-emerald-600">UmiqFood</span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Masakan rumahan favorit, pesan di mana aja.
                                </p>
                            </div>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                Pesan Sekarang
                            </Link>
                        </div>
                        <p className="mt-8 text-center text-xs text-gray-400">
                            © {new Date().getFullYear()} UmiqFood. Semua hak dilindungi.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

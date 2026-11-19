import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpDown,
    ArrowUpRight,
    BadgeCheck,
    ChefHat,
    Clock,
    Flame,
    Leaf,
    LogOut,
    Megaphone,
    Menu as MenuIcon,
    Moon,
    Search,
    Settings,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Sun,
    Timer,
    Utensils,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from 'cn';

import { PublicMenuDialog } from '@/components/public-menu-dialog';
import { RatingStars } from '@/components/rating-stars';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    HeroParallax,
    type HeroParallaxProduct,
} from '@/components/ui/hero-parallax';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useAppearance } from '@/hooks/use-appearance';
import type { Kategori, Masakan } from '@/types';

interface AuthUser {
    name: string;
    email?: string;
    role: string;
}

const PER_HALAMAN = 6;

const PALET_HERO = [
    'from-emerald-500 via-teal-500 to-emerald-700',
    'from-amber-400 via-orange-500 to-rose-500',
    'from-sky-500 via-cyan-500 to-teal-600',
    'from-orange-500 via-rose-500 to-red-600',
    'from-lime-400 via-emerald-500 to-teal-700',
    'from-cyan-500 via-sky-500 to-blue-600',
];

const FITUR_HERO = [
    ['Pesan cepat', '3 langkah', 'Pilih, pesan, lalu nikmati.', '⚡'],
    ['Stok terpantau', 'Real-time', 'Sisa porsi selalu jelas.', '📦'],
    ['Resep otomatis', 'Per porsi', 'Bahan dihitung otomatis.', '🧾'],
    ['Bahan terjaga', 'Inventori', 'Stok bahan rapi dan akurat.', '🥬'],
    ['Tanpa ongkir', 'Pickup only', 'Ambil sendiri di outlet.', '🛍️'],
    ['Fresh dimasak', 'Sesuai pesanan', 'Hangat saat diambil.', '🍳'],
    ['Rasa rumahan', 'Bumbu khas', 'Dimasak dengan resep keluarga.', '💚'],
    ['Menu harian', 'Selalu baru', 'Pilihan berganti tiap hari.', '🍱'],
    ['Higienis', 'Terjaga', 'Proses bersih dan aman.', '🛡️'],
    ['Mudah dipesan', 'Tanpa ribet', 'Dari HP atau laptop.', '📱'],
    ['Harga ramah', 'Tanpa biaya tersembunyi', 'Ramah kantong.', '🪙'],
    ['Favorit pelanggan', 'Rating 4.9', 'Disukai banyak orang.', '⭐'],
] as const;

const OPSI_URUT = [
    { value: 'terbaru', label: 'Terbaru' },
    { value: 'harga-rendah', label: 'Harga terendah' },
    { value: 'harga-tinggi', label: 'Harga tertinggi' },
    { value: 'porsi', label: 'Porsi terbanyak' },
] as const;

type Urutan = (typeof OPSI_URUT)[number]['value'];

interface Testimoni {
    nama: string;
    peran: string;
    inisial: string;
    rating: number;
    menu: string;
    isi: string;
    terverifikasi?: boolean;
}

const TESTIMONI: Testimoni[] = [
    {
        nama: 'Rina Astuti',
        peran: 'Pelanggan setia',
        inisial: 'RA',
        rating: 5,
        menu: 'Nasi Goreng Spesial Umiq',
        isi: 'Masakannya enak dan porsinya pas. Pesannya gampang, tinggal datang ambil saat statusnya sudah siap.',
    },
    {
        nama: 'Dimas Saputra',
        peran: 'Mahasiswa',
        inisial: 'DS',
        rating: 5,
        menu: 'Ayam Geprek Sambal Korek',
        isi: 'Harga ramah kantong, rasa rumahan. Ambil sendiri di outlet juga cepat, tidak perlu antre lama.',
    },
    {
        nama: 'Nadia Putri',
        peran: 'Karyawan',
        inisial: 'NP',
        rating: 4,
        menu: 'Es Teh Manis Jumbo',
        isi: 'Suka karena menunya jelas, ada info sisa porsi. Jadi tahu mana yang masih tersedia sebelum pesan.',
    },
];

// Kartu foto dengan skeleton saat gambar masih dimuat
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

    // Gambar yang sudah ter-cache tidak selalu memicu onLoad
    useEffect(() => {
        if (imgRef.current?.complete) {
            setLoaded(true);
        }
    }, []);

    if (!src) {
        return (
            <div
                className={`${className} flex items-center justify-center bg-emerald-50 text-5xl dark:bg-emerald-950/40`}
            >
                {emoji || (
                    <Utensils className="size-10 text-emerald-500 dark:text-emerald-400" />
                )}
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Skeleton className="absolute inset-0 rounded-none" />
                    <Spinner className="z-10 size-6 text-emerald-600 dark:text-emerald-400" />
                </div>
            )}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                className={`h-full w-full object-cover transition duration-500 ${
                    loaded ? 'opacity-100' : 'opacity-0'
                }`}
            />
        </div>
    );
}

function Brand({ compact = false }: { compact?: boolean }) {
    return (
        <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 transition group-hover:scale-105">
                <Utensils className="size-5" />
            </span>
            <span className="flex flex-col leading-none">
                <span className="text-lg font-extrabold tracking-tight">
                    Umiq
                    <span className="text-emerald-600 dark:text-emerald-400">
                        Food
                    </span>
                </span>
                {!compact && (
                    <span className="mt-1 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                        Masakan rumahan
                    </span>
                )}
            </span>
        </Link>
    );
}

function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'left',
}: {
    eyebrow: string;
    title: string;
    description?: string;
    align?: 'left' | 'center';
}) {
    return (
        <div
            className={
                align === 'center'
                    ? 'mx-auto max-w-2xl text-center'
                    : 'max-w-2xl'
            }
        >
            <Badge
                variant="outline"
                className="mb-3 gap-1.5 border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
            >
                <Sparkles className="size-3" />
                {eyebrow}
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title}
            </h2>
            {description && (
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    {description}
                </p>
            )}
        </div>
    );
}

function MenuCard({
    item,
    onDetail,
}: {
    item: Masakan;
    onDetail: (item: Masakan) => void;
}) {
    const habis = item.jumlah_porsi <= 0;
    const jumlahUlasan = item.reviews_count ?? item.reviews?.length ?? 0;
    const rata = Number(item.reviews_avg_rating ?? 0);

    return (
        <Card
            role="button"
            tabIndex={0}
            aria-label={`Lihat detail ${item.nama}`}
            onClick={() => onDetail(item)}
            onKeyDown={(event) => {
                if (event.target !== event.currentTarget) {
                    return;
                }

                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onDetail(item);
                }
            }}
            className="group flex cursor-pointer flex-col gap-0 overflow-hidden border-border/70 p-0 shadow-sm transition duration-300 outline-none hover:-translate-y-1 hover:border-emerald-300/70 hover:shadow-xl hover:shadow-emerald-900/5 focus-visible:ring-2 focus-visible:ring-emerald-500/60 dark:hover:border-emerald-800"
        >
            <div className="relative">
                <FotoMenu
                    src={item.foto_url}
                    alt={item.nama}
                    className={`aspect-[4/3] w-full transition duration-500 group-hover:scale-[1.03] ${
                        habis ? 'grayscale' : ''
                    }`}
                    emoji="🍱"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70" />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <Badge className="border-0 bg-white/90 text-gray-800 backdrop-blur dark:bg-black/60 dark:text-white">
                        {item.kategori?.icon} {item.kategori?.nama || 'Menu'}
                    </Badge>
                </div>
                <div className="absolute top-3 right-3">
                    <Badge
                        className={
                            habis
                                ? 'border-0 bg-red-600 text-white'
                                : 'border-0 bg-emerald-600 text-white'
                        }
                    >
                        {habis ? 'Habis' : `${item.jumlah_porsi} porsi`}
                    </Badge>
                </div>
                {habis && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/55 backdrop-blur-[1px]">
                        <span className="rounded-full bg-background px-4 py-1.5 text-xs font-semibold text-foreground shadow">
                            Stok habis
                        </span>
                    </div>
                )}
                {!habis && (
                    <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-emerald-700 opacity-0 shadow transition group-hover:opacity-100 dark:bg-black/70 dark:text-emerald-300">
                        Lihat detail
                        <ArrowUpRight className="size-3" />
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-foreground">
                        {item.nama}
                    </h3>
                    <span className="shrink-0 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {item.harga_format}
                    </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {item.deskripsi || 'Masakan spesial buatan rumahan.'}
                </p>

                <div className="mt-3 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                    {jumlahUlasan > 0 ? (
                        <>
                            <RatingStars value={rata} />
                            <span className="font-semibold text-foreground">
                                {rata.toFixed(1)}
                            </span>
                            <span className="truncate">
                                ({jumlahUlasan} ulasan)
                            </span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="size-3.5 shrink-0 text-amber-500" />
                            <span className="truncate">
                                Menu baru · belum ada ulasan
                            </span>
                        </>
                    )}
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <div>
                        <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                            Harga
                        </p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {item.harga_format}
                        </p>
                    </div>

                    <Button
                        type="button"
                        size="sm"
                        onClick={(event) => {
                            event.stopPropagation();
                            onDetail(item);
                        }}
                        className="gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white"
                    >
                        Detail
                        <ArrowUpRight className="size-3.5" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}

function inisialNama(nama: string): string {
    return (
        nama
            .split(' ')
            .map((bagian) => bagian[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'U'
    );
}

function TestimoniCard({ ulasan }: { ulasan: Testimoni }) {
    return (
        <Card className="flex h-[198px] w-[300px] flex-col gap-3 border-border/70 p-5 shadow-sm sm:w-[340px]">
            <div className="flex items-center justify-between gap-2">
                <RatingStars value={ulasan.rating} size="md" />
                <span className="max-w-[55%] truncate text-[11px] text-muted-foreground">
                    {ulasan.menu}
                </span>
            </div>
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                “{ulasan.isi}”
            </p>
            <div className="mt-auto flex items-center gap-3">
                <Avatar className="size-10">
                    <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {ulasan.inisial}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="flex items-center gap-1 text-sm font-semibold">
                        <span className="truncate">{ulasan.nama}</span>
                        {ulasan.terverifikasi && (
                            <BadgeCheck className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {ulasan.peran}
                    </p>
                </div>
            </div>
        </Card>
    );
}

export default function Welcome() {
    const { auth, masakans, kategoris } = usePage<{
        auth: { user: AuthUser | null };
        masakans: Masakan[];
        kategoris: Kategori[];
    }>().props;

    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [promoTerbuka, setPromoTerbuka] = useState(true);
    const [halaman, setHalaman] = useState(1);
    const [query, setQuery] = useState('');
    const [kategoriAktif, setKategoriAktif] = useState<number | null>(null);
    const [urutan, setUrutan] = useState<Urutan>('terbaru');
    const [detail, setDetail] = useState<Masakan | null>(null);

    const admin = auth.user?.role === 'admin';
    const tujuan = admin ? '/dashboard' : '/home';
    const labelTujuan = admin ? 'Buka dashboard' : 'Pesan sekarang';
    const inisial = inisialNama(auth.user?.name ?? 'U');

    const toggleTema = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    const totalPorsi = useMemo(
        () =>
            masakans.reduce(
                (total, item) => total + (item.jumlah_porsi ?? 0),
                0,
            ),
        [masakans],
    );

    const totalUlasan = useMemo(
        () =>
            masakans.reduce(
                (total, item) =>
                    total + (item.reviews_count ?? item.reviews?.length ?? 0),
                0,
            ),
        [masakans],
    );

    const testimoni = useMemo<Testimoni[]>(() => {
        const dariUlasan = masakans
            .flatMap((item) =>
                (item.reviews ?? []).map((ulasan) => ({
                    ulasan,
                    menu: item.nama,
                })),
            )
            .filter(({ ulasan }) => (ulasan.komentar ?? '').trim().length > 0)
            .sort(
                (a, b) =>
                    new Date(b.ulasan.created_at).getTime() -
                    new Date(a.ulasan.created_at).getTime(),
            )
            .slice(0, 12)
            .map(({ ulasan, menu }) => ({
                nama: ulasan.nama,
                peran: ulasan.terverifikasi
                    ? 'Pembeli terverifikasi'
                    : 'Pelanggan',
                inisial: inisialNama(ulasan.nama),
                rating: ulasan.rating,
                menu,
                isi: ulasan.komentar ?? '',
                terverifikasi: ulasan.terverifikasi,
            }));

        return dariUlasan.length > 0 ? dariUlasan : TESTIMONI;
    }, [masakans]);

    const hasilFilter = useMemo(() => {
        const kataKunci = query.trim().toLowerCase();

        const hasil = masakans.filter((item) => {
            const cocokKategori =
                kategoriAktif === null || item.kategori?.id === kategoriAktif;
            const cocokKataKunci =
                kataKunci === '' ||
                item.nama.toLowerCase().includes(kataKunci) ||
                (item.deskripsi ?? '').toLowerCase().includes(kataKunci) ||
                (item.kategori?.nama ?? '').toLowerCase().includes(kataKunci);

            return cocokKategori && cocokKataKunci;
        });

        switch (urutan) {
            case 'harga-rendah':
                return [...hasil].sort((a, b) => a.harga - b.harga);
            case 'harga-tinggi':
                return [...hasil].sort((a, b) => b.harga - a.harga);
            case 'porsi':
                return [...hasil].sort(
                    (a, b) => b.jumlah_porsi - a.jumlah_porsi,
                );
            default:
                return hasil;
        }
    }, [masakans, query, kategoriAktif, urutan]);

    const totalHalaman = Math.max(
        1,
        Math.ceil(hasilFilter.length / PER_HALAMAN),
    );
    const menuHalamanIni = hasilFilter.slice(
        (halaman - 1) * PER_HALAMAN,
        halaman * PER_HALAMAN,
    );

    useEffect(() => {
        setHalaman(1);
    }, [query, kategoriAktif, urutan]);

    const heroProducts = useMemo<HeroParallaxProduct[]>(() => {
        const menu = masakans.slice(0, 3).map((item, index) => ({
            id: `menu-${item.id}`,
            title: item.nama,
            subtitle: item.kategori?.nama ?? 'Menu',
            description: item.deskripsi ?? 'Masakan rumahan spesial.',
            emoji: item.kategori?.icon ?? '🍱',
            meta:
                item.jumlah_porsi > 0 ? `${item.jumlah_porsi} porsi` : 'Habis',
            link: '#menu',
            accent: PALET_HERO[index % PALET_HERO.length],
        }));

        const kategori = kategoris.map((item, index) => ({
            id: `kategori-${item.id}`,
            title: item.nama,
            subtitle: 'Kategori',
            description: `${item.masakans_count ?? 0} menu tersedia`,
            emoji: item.icon ?? '🍽️',
            link: '#kategori',
            accent: PALET_HERO[(index + 2) % PALET_HERO.length],
        }));

        const fitur = FITUR_HERO.map(
            ([title, subtitle, description, emoji], index) => ({
                id: `fitur-${index}`,
                title,
                subtitle,
                description,
                emoji,
                link: '#cara-pesan',
                accent: PALET_HERO[(index + 4) % PALET_HERO.length],
            }),
        );

        return [...menu, ...kategori, ...fitur].slice(0, 18);
    }, [masakans, kategoris]);

    const labelUrutan =
        OPSI_URUT.find((opsi) => opsi.value === urutan)?.label ?? 'Terbaru';
    const kategoriTerpilih = kategoris.find(
        (kategori) => kategori.id === kategoriAktif,
    );

    const keMenu = () => {
        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
    };

    const pilihKategori = (id: number | null) => {
        setKategoriAktif(id);
        keMenu();
    };

    return (
        <>
            <Head title="UmiqFood — Masakan Rumahan, Pesan Tanpa Repot" />

            <div className="min-h-screen bg-background text-foreground">
                {/* Promo bar */}
                {promoTerbuka && (
                    <div className="bg-emerald-800 text-emerald-50">
                        <Alert className="mx-auto flex max-w-7xl items-center gap-2 border-none bg-transparent px-4 py-1.5 text-emerald-50 sm:px-6 lg:px-8">
                            <Megaphone className="size-4 shrink-0" />
                            <AlertTitle className="mb-0 flex-1 text-xs font-medium text-emerald-50 sm:text-sm">
                                Pickup only: pesan sekarang, ambil saat siap —
                                tanpa biaya antar.
                            </AlertTitle>
                            <AlertDescription className="sr-only">
                                Semua pesanan diambil sendiri di outlet
                                UmiqFood.
                            </AlertDescription>
                            <button
                                type="button"
                                onClick={() => setPromoTerbuka(false)}
                                className="rounded-md p-1 transition hover:bg-emerald-700"
                                aria-label="Tutup promo"
                            >
                                <X className="size-3.5" />
                            </button>
                        </Alert>
                    </div>
                )}

                {/* Navbar */}
                <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                        <Brand compact />

                        <NavigationMenu
                            viewport={false}
                            className="hidden lg:flex"
                        >
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <a
                                            href="#menu"
                                            className={navigationMenuTriggerStyle()}
                                        >
                                            Menu
                                        </a>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>
                                        Kategori
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="grid w-[22rem] grid-cols-2 gap-1 p-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    pilihKategori(null)
                                                }
                                                className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                                            >
                                                <Utensils className="size-4 text-emerald-600 dark:text-emerald-400" />
                                                Semua menu
                                            </button>
                                            {kategoris.map((kategori) => (
                                                <button
                                                    key={kategori.id}
                                                    type="button"
                                                    onClick={() =>
                                                        pilihKategori(
                                                            kategori.id,
                                                        )
                                                    }
                                                    className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                                                >
                                                    <span>{kategori.icon}</span>
                                                    <span className="flex-1 truncate">
                                                        {kategori.nama}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {kategori.masakans_count ??
                                                            0}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <a
                                            href="#cara-pesan"
                                            className={navigationMenuTriggerStyle()}
                                        >
                                            Cara Pesan
                                        </a>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={toggleTema}
                                aria-label="Ganti tema"
                                className="hidden rounded-full md:inline-flex"
                            >
                                <Sun className="hidden size-4.5 dark:block" />
                                <Moon className="size-4.5 dark:hidden" />
                            </Button>

                            {auth.user ? (
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
                                                {auth.user.name}
                                            </span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-56"
                                    >
                                        <DropdownMenuLabel className="font-normal">
                                            <p className="text-sm font-semibold">
                                                {auth.user.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {auth.user.email}
                                            </p>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={
                                                    auth.user.role === 'admin'
                                                        ? '/dashboard'
                                                        : '/akun'
                                                }
                                            >
                                                <ShoppingBag className="size-4" />
                                                {auth.user.role === 'admin'
                                                    ? 'Dashboard admin'
                                                    : 'Pesanan saya'}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/settings/profile">
                                                <Settings className="size-4" />
                                                Pengaturan
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            asChild
                                            variant="destructive"
                                        >
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="w-full"
                                            >
                                                <LogOut className="size-4" />
                                                Keluar
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="hidden items-center gap-2 md:flex">
                                    <Button variant="ghost" asChild>
                                        <Link href="/login">Login</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                                    >
                                        <Link href="/register">Daftar</Link>
                                    </Button>
                                </div>
                            )}

                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full lg:hidden"
                                        aria-label="Buka menu"
                                    >
                                        <MenuIcon className="size-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="right"
                                    className="w-[86vw] overflow-y-auto sm:max-w-sm"
                                >
                                    <SheetHeader className="pr-12">
                                        <SheetTitle className="sr-only">
                                            Menu UmiqFood
                                        </SheetTitle>
                                        <SheetDescription className="sr-only">
                                            Navigasi halaman, kategori, dan akun
                                            UmiqFood.
                                        </SheetDescription>
                                        <Brand />
                                    </SheetHeader>

                                    {auth.user && (
                                        <>
                                            <div className="mx-3 rounded-2xl border border-border/70 bg-muted/30 p-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-10">
                                                        <AvatarFallback className="bg-emerald-600 text-xs font-semibold text-white">
                                                            {inisial}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold">
                                                            {auth.user.name}
                                                        </p>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {auth.user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <SheetClose asChild>
                                                    <Link
                                                        href="/settings/profile"
                                                        className="mt-3 flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-2 text-xs font-medium transition hover:bg-muted"
                                                    >
                                                        <Settings className="size-3.5" />
                                                        Profil &amp; pengaturan
                                                    </Link>
                                                </SheetClose>
                                            </div>
                                            <Separator />
                                        </>
                                    )}

                                    <nav className="flex flex-col gap-1 px-3">
                                        <SheetClose asChild>
                                            <a
                                                href="#menu"
                                                className="rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-muted"
                                            >
                                                Menu
                                            </a>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <a
                                                href="#kategori"
                                                className="rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-muted"
                                            >
                                                Kategori
                                            </a>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <a
                                                href="#cara-pesan"
                                                className="rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-muted"
                                            >
                                                Cara Pesan
                                            </a>
                                        </SheetClose>
                                    </nav>
                                    <Separator />
                                    <div className="px-3">
                                        <p className="mb-2 px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Kategori
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {kategoris.map((kategori) => (
                                                <SheetClose
                                                    key={kategori.id}
                                                    asChild
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            pilihKategori(
                                                                kategori.id,
                                                            )
                                                        }
                                                        className="rounded-full border border-border px-3 py-1.5 text-xs font-medium transition hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                                    >
                                                        {kategori.icon}{' '}
                                                        {kategori.nama}
                                                    </button>
                                                </SheetClose>
                                            ))}
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="px-3">
                                        <p className="mb-2 px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Tampilan
                                        </p>
                                        <button
                                            type="button"
                                            onClick={toggleTema}
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
                                                    {resolvedAppearance ===
                                                    'dark'
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
                                                    resolvedAppearance ===
                                                        'dark'
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
                                    <div className="mt-auto space-y-2 p-4">
                                        {auth.user ? (
                                            <>
                                                <Button
                                                    asChild
                                                    className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                                                >
                                                    <Link
                                                        href={
                                                            auth.user.role ===
                                                            'admin'
                                                                ? '/dashboard'
                                                                : '/akun'
                                                        }
                                                    >
                                                        {auth.user.role ===
                                                        'admin'
                                                            ? 'Dashboard admin'
                                                            : 'Pesanan saya'}
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    asChild
                                                    className="w-full"
                                                >
                                                    <Link
                                                        href="/logout"
                                                        method="post"
                                                        as="button"
                                                    >
                                                        Keluar
                                                    </Link>
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    asChild
                                                    className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                                                >
                                                    <Link href="/register">
                                                        Daftar sekarang
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    asChild
                                                    className="w-full"
                                                >
                                                    <Link href="/login">
                                                        Masuk
                                                    </Link>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <HeroParallax
                    products={heroProducts}
                    header={
                        <div className="relative max-w-4xl">
                            <Badge
                                variant="outline"
                                className="gap-2 border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
                            >
                                <ChefHat className="size-3.5" />
                                Masakan rumahan, rasa juara
                            </Badge>

                            <h1 className="mt-5 max-w-3xl text-4xl leading-[1.08] font-extrabold tracking-tight text-balance text-foreground sm:text-5xl xl:text-6xl">
                                Lapar? Pesan masakan{' '}
                                <span className="text-emerald-600 dark:text-emerald-400">
                                    favoritmu
                                </span>{' '}
                                di UmiqFood
                            </h1>

                            <p className="mt-4 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
                                Pilih menu, pesan dalam hitungan menit, nikmati
                                tanpa repot masak. Semudah itu.
                            </p>

                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    keMenu();
                                }}
                                className="mt-8 w-full max-w-xl"
                            >
                                <div className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-background/90 p-2 shadow-lg shadow-emerald-950/5 backdrop-blur sm:flex-row sm:items-center sm:rounded-full">
                                    <div className="relative flex-1">
                                        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            value={query}
                                            onChange={(event) =>
                                                setQuery(event.target.value)
                                            }
                                            placeholder="Cari nasi goreng, ayam, minuman..."
                                            aria-label="Cari menu"
                                            className="h-11 rounded-xl border-0 bg-transparent pl-10 text-base shadow-none focus-visible:ring-0 sm:rounded-full"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="h-11 rounded-xl bg-emerald-600 px-6 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 sm:rounded-full"
                                    >
                                        Cari menu
                                        <ArrowRight className="size-4" />
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-5 flex flex-wrap items-center gap-2.5">
                                <Button
                                    asChild
                                    className="h-10 rounded-xl bg-emerald-600 px-5 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                                >
                                    <a href="#menu">
                                        Lihat menu
                                        <ArrowRight className="size-4" />
                                    </a>
                                </Button>
                                {!auth.user && (
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="h-10 rounded-xl border-border bg-background/80 px-5 backdrop-blur hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                    >
                                        <Link href="/register">
                                            Daftar sekarang
                                        </Link>
                                    </Button>
                                )}
                            </div>

                            <dl className="mt-5 inline-flex divide-x divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-background/75 shadow-sm backdrop-blur">
                                {[
                                    {
                                        value: masakans.length,
                                        label: 'Menu',
                                    },
                                    {
                                        value: kategoris.length,
                                        label: 'Kategori',
                                    },
                                    {
                                        value: totalPorsi,
                                        label: 'Porsi',
                                    },
                                    {
                                        value: totalUlasan,
                                        label: 'Ulasan',
                                    },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="flex items-baseline gap-1.5 px-4 py-2"
                                    >
                                        <dd className="text-base leading-none font-bold tracking-tight">
                                            {stat.value}
                                        </dd>
                                        <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">
                                            {stat.label}
                                        </dt>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    }
                />

                {/* Keunggulan */}
                <section className="border-y border-border/70 bg-muted/30">
                    <div className="mx-auto grid max-w-7xl gap-3 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
                        {[
                            {
                                icon: Utensils,
                                title: 'Menu beragam',
                                desc: 'Pilihan masakan rumahan setiap hari.',
                            },
                            {
                                icon: Timer,
                                title: 'Pesan cepat',
                                desc: 'Praktis, tanpa antre dan tanpa ribet.',
                            },
                            {
                                icon: ShieldCheck,
                                title: 'Bahan terjaga',
                                desc: 'Stok dan resep terkelola dengan rapi.',
                            },
                            {
                                icon: Leaf,
                                title: 'Rasa rumahan',
                                desc: 'Dimasak fresh sesuai pesananmu.',
                            },
                        ].map((fitur) => (
                            <div
                                key={fitur.title}
                                className="flex items-start gap-3 rounded-xl p-2"
                            >
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                    <fitur.icon className="size-5" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">
                                        {fitur.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {fitur.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Kategori + Chart */}
                <section
                    id="kategori"
                    className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"
                >
                    <div className="mx-auto max-w-7xl">
                        <SectionHeading
                            eyebrow="Kategori"
                            title="Mau masakan apa hari ini?"
                            description="Pilih kategori untuk menyaring menu yang tampil di bawah."
                        />

                        <div className="mt-8">
                            <Card className="p-5 sm:p-6">
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setKategoriAktif(null)}
                                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                                            kategoriAktif === null
                                                ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                                                : 'border-border bg-background hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40'
                                        }`}
                                    >
                                        <Utensils className="size-4" />
                                        Semua
                                        <span
                                            className={`rounded-full px-1.5 text-xs ${
                                                kategoriAktif === null
                                                    ? 'bg-white/20'
                                                    : 'bg-muted'
                                            }`}
                                        >
                                            {masakans.length}
                                        </span>
                                    </button>

                                    {kategoris.map((kategori) => {
                                        const aktif =
                                            kategoriAktif === kategori.id;

                                        return (
                                            <button
                                                key={kategori.id}
                                                type="button"
                                                onClick={() =>
                                                    setKategoriAktif(
                                                        aktif
                                                            ? null
                                                            : kategori.id,
                                                    )
                                                }
                                                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                                                    aktif
                                                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                                                        : 'border-border bg-background hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40'
                                                }`}
                                            >
                                                <span>{kategori.icon}</span>
                                                {kategori.nama}
                                                <span
                                                    className={`rounded-full px-1.5 text-xs ${
                                                        aktif
                                                            ? 'bg-white/20'
                                                            : 'bg-muted'
                                                    }`}
                                                >
                                                    {kategori.masakans_count ??
                                                        0}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/40 p-4">
                                    <p className="flex items-center gap-2 text-sm font-medium">
                                        <Flame className="size-4 text-emerald-600 dark:text-emerald-400" />
                                        Tips memesan
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Cek badge porsi pada kartu menu. Menu
                                        dengan stok habis tetap bisa dilihat
                                        detailnya, tetapi belum bisa dipesan.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Menu */}
                <section
                    id="menu"
                    className="scroll-mt-24 border-y border-border/70 bg-muted/30 px-4 py-16 sm:px-6 lg:px-8"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div>
                                <SectionHeading
                                    eyebrow="Menu"
                                    title="Menu Hari Ini"
                                    description={`${hasilFilter.length} dari ${masakans.length} masakan siap dipesan.`}
                                />
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                {(query !== '' ||
                                    kategoriTerpilih !== undefined) && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        {query !== '' && (
                                            <Badge
                                                variant="outline"
                                                className="gap-1 py-1"
                                            >
                                                “{query}”
                                                <button
                                                    type="button"
                                                    onClick={() => setQuery('')}
                                                    aria-label="Hapus pencarian"
                                                >
                                                    <X className="size-3" />
                                                </button>
                                            </Badge>
                                        )}
                                        {kategoriTerpilih && (
                                            <Badge
                                                variant="outline"
                                                className="gap-1 py-1"
                                            >
                                                {kategoriTerpilih.icon}{' '}
                                                {kategoriTerpilih.nama}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setKategoriAktif(null)
                                                    }
                                                    aria-label="Hapus filter kategori"
                                                >
                                                    <X className="size-3" />
                                                </button>
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="justify-between gap-2 bg-background"
                                        >
                                            <span className="flex items-center gap-2">
                                                <ArrowUpDown className="size-4" />
                                                {labelUrutan}
                                            </span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-48"
                                    >
                                        <DropdownMenuLabel>
                                            Urutkan menu
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup
                                            value={urutan}
                                            onValueChange={(value) =>
                                                setUrutan(value as Urutan)
                                            }
                                        >
                                            {OPSI_URUT.map((opsi) => (
                                                <DropdownMenuRadioItem
                                                    key={opsi.value}
                                                    value={opsi.value}
                                                >
                                                    {opsi.label}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {menuHalamanIni.length === 0 ? (
                            <Card className="mt-8 items-center gap-3 border-dashed p-10 text-center">
                                <span className="flex size-14 items-center justify-center rounded-full bg-muted">
                                    <Search className="size-6 text-muted-foreground" />
                                </span>
                                <div>
                                    <p className="font-semibold">
                                        Menu tidak ditemukan
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Coba kata kunci lain atau hapus filter
                                        yang aktif.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setQuery('');
                                        setKategoriAktif(null);
                                    }}
                                >
                                    Reset filter
                                </Button>
                            </Card>
                        ) : (
                            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {menuHalamanIni.map((item) => (
                                    <MenuCard
                                        key={item.id}
                                        item={item}
                                        onDetail={setDetail}
                                    />
                                ))}
                            </div>
                        )}

                        {totalHalaman > 1 && (
                            <Pagination className="mt-10">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#menu"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                setHalaman((sebelumnya) =>
                                                    Math.max(1, sebelumnya - 1),
                                                );
                                            }}
                                            className={
                                                halaman === 1
                                                    ? 'pointer-events-none opacity-40'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>
                                    {[...Array(totalHalaman)].map(
                                        (_, index) => (
                                            <PaginationItem key={index}>
                                                <PaginationLink
                                                    href="#menu"
                                                    isActive={
                                                        halaman === index + 1
                                                    }
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        setHalaman(index + 1);
                                                    }}
                                                >
                                                    {index + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ),
                                    )}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#menu"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                setHalaman((sebelumnya) =>
                                                    Math.min(
                                                        totalHalaman,
                                                        sebelumnya + 1,
                                                    ),
                                                );
                                            }}
                                            className={
                                                halaman === totalHalaman
                                                    ? 'pointer-events-none opacity-40'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                </section>

                {/* Testimoni */}
                <section className="px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <SectionHeading
                            eyebrow="Testimoni"
                            title="Kata pelanggan"
                            description="Cerita singkat dari mereka yang sudah mencoba masakan UmiqFood."
                            align="center"
                        />

                        <InfiniteMovingCards
                            items={testimoni}
                            renderItem={(ulasan) => (
                                <TestimoniCard ulasan={ulasan} />
                            )}
                            direction="left"
                            speed="slow"
                            ariaLabel="Ulasan pelanggan UmiqFood"
                            className="mt-8"
                        />
                    </div>
                </section>

                {/* Cara pesan + CTA */}
                <section
                    id="cara-pesan"
                    className="scroll-mt-24 px-4 pb-16 sm:px-6 lg:px-8"
                >
                    <div className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 px-5 py-12 text-white shadow-2xl shadow-emerald-900/20 sm:px-8 lg:px-12">
                        <div className="mx-auto max-w-2xl text-center">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                                <Clock className="size-3.5" />
                                Cepat dan praktis
                            </span>
                            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                                Pesan dalam 3 langkah
                            </h2>
                            <p className="mt-2 text-sm text-emerald-100 sm:text-base">
                                Semudah itu, masakan siap dinikmati.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-4 md:grid-cols-3">
                            {[
                                {
                                    icon: Utensils,
                                    title: 'Pilih menu',
                                    desc: 'Jelajahi katalog dan temukan masakan favoritmu.',
                                },
                                {
                                    icon: ShoppingBag,
                                    title: 'Masukkan keranjang',
                                    desc: 'Atur pesanan sesuai selera dan jumlahnya.',
                                },
                                {
                                    icon: ChefHat,
                                    title: 'Siap dinikmati',
                                    desc: 'Tunggu konfirmasi, lalu nikmati masakannya.',
                                },
                            ].map((langkah, index) => (
                                <div
                                    key={langkah.title}
                                    className="relative rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                                >
                                    <span className="absolute top-4 right-4 text-3xl font-black text-white/15">
                                        0{index + 1}
                                    </span>
                                    <span className="flex size-10 items-center justify-center rounded-lg bg-white/15">
                                        <langkah.icon className="size-5" />
                                    </span>
                                    <h3 className="mt-4 font-semibold">
                                        {langkah.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-emerald-100">
                                        {langkah.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-white/10 p-5 sm:flex-row">
                            <div>
                                <p className="font-semibold">
                                    Siap pesan masakan hari ini?
                                </p>
                                <p className="text-sm text-emerald-100">
                                    Lihat menu yang masih tersedia dan pesan
                                    sekarang.
                                </p>
                            </div>
                            <Button
                                asChild
                                className="w-full shrink-0 bg-white text-emerald-700 hover:bg-emerald-50 sm:w-auto"
                            >
                                <Link href={auth.user ? '/home' : '/login'}>
                                    {auth.user
                                        ? 'Buka halaman user'
                                        : 'Masuk & pesan'}
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border bg-card">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="sm:col-span-2 lg:col-span-1">
                                <Brand />
                                <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                                    Masakan rumahan favorit, pesan di mana aja.
                                    Dibuat sederhana agar kamu bisa fokus
                                    menikmati makanan.
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold">
                                    Jelajahi
                                </p>
                                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                    <li>
                                        <a
                                            href="#menu"
                                            className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                                        >
                                            Menu
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#kategori"
                                            className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                                        >
                                            Kategori
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#cara-pesan"
                                            className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                                        >
                                            Cara pesan
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <p className="text-sm font-semibold">Akun</p>
                                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                    {auth.user ? (
                                        <>
                                            <li>
                                                <Link
                                                    href={
                                                        auth.user.role ===
                                                        'admin'
                                                            ? '/dashboard'
                                                            : '/home'
                                                    }
                                                    className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                                                >
                                                    {auth.user.role === 'admin'
                                                        ? 'Dashboard admin'
                                                        : 'Halaman user'}
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="/settings/profile"
                                                    className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                                                >
                                                    Pengaturan akun
                                                </Link>
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li>
                                                <Link
                                                    href="/login"
                                                    className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                                                >
                                                    Masuk
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="/register"
                                                    className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                                                >
                                                    Daftar
                                                </Link>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <div>
                                <p className="text-sm font-semibold">
                                    Kenapa UmiqFood?
                                </p>
                                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                                        Stok bahan terkelola
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Timer className="size-4 text-emerald-600 dark:text-emerald-400" />
                                        Pesan tanpa antre
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Leaf className="size-4 text-emerald-600 dark:text-emerald-400" />
                                        Rasa rumahan
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <Separator className="my-8" />

                        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
                            <p>
                                © {new Date().getFullYear()} UmiqFood. Semua hak
                                dilindungi.
                            </p>
                            <p>
                                Dibuat dengan{' '}
                                <span className="text-emerald-600 dark:text-emerald-400">
                                    ♥
                                </span>{' '}
                                untuk pencinta masakan rumahan.
                            </p>
                        </div>
                    </div>
                </footer>

                <PublicMenuDialog
                    menu={detail}
                    onClose={() => setDetail(null)}
                    pesanHref={tujuan}
                    pesanLabel={labelTujuan}
                    tamu={!auth.user}
                />
            </div>
        </>
    );
}

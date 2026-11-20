import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpDown,
    BadgeCheck,
    CheckCircle2,
    ChefHat,
    ChevronRight,
    ClipboardList,
    Clock,
    Flame,
    MapPin,
    MessageSquareQuote,
    Minus,
    PackageCheck,
    Plus,
    RotateCcw,
    Search,
    Send,
    ShoppingBag,
    Sparkles,
    Star,
    UtensilsCrossed,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from 'cn';
import { EmptyState, FilterChip, SectionHeading } from '@/components/user-ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { Kategori, KeranjangRingkas, Masakan, Review } from '@/types';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            role: string;
        } | null;
    };
    masakans: Masakan[];
    kategoris: Kategori[];
    keranjang: KeranjangRingkas;
    pesananAktif: number;
    menuSelesai: number[];
    errors?: {
        ulasan?: string;
    };
    [key: string]: unknown;
}

function formatRupiah(value: number): string {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(value);
}

function formatTanggal(value: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function rataRating(item: Masakan): number {
    return Number(item.reviews_avg_rating ?? 0);
}

function jumlahUlasan(item: Masakan): number {
    return item.reviews_count ?? item.reviews?.length ?? 0;
}

type Urutan = 'rekomendasi' | 'termurah' | 'termahal' | 'rating' | 'porsi';

const OPSI_URUT: { value: Urutan; label: string }[] = [
    { value: 'rekomendasi', label: 'Rekomendasi' },
    { value: 'termurah', label: 'Harga termurah' },
    { value: 'termahal', label: 'Harga tertinggi' },
    { value: 'rating', label: 'Rating tertinggi' },
    { value: 'porsi', label: 'Porsi terbanyak' },
];

function Bintang({ nilai, className }: { nilai: number; className?: string }) {
    return (
        <span
            className={cn('flex items-center gap-0.5', className)}
            aria-label={`${nilai} dari 5 bintang`}
        >
            {[1, 2, 3, 4, 5].map((bintang) => (
                <Star
                    key={bintang}
                    className={cn(
                        'size-3.5',
                        bintang <= Math.round(nilai)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/35',
                    )}
                />
            ))}
        </span>
    );
}

export default function UserHome() {
    const {
        auth,
        masakans,
        kategoris,
        keranjang,
        pesananAktif,
        menuSelesai,
        errors,
    } = usePage<Props>().props;

    const [search, setSearch] = useState('');
    const [kategoriAktif, setKategoriAktif] = useState<number | 'semua'>(
        'semua',
    );
    const [urutan, setUrutan] = useState<Urutan>('rekomendasi');
    const [menambah, setMenambah] = useState<number | null>(null);
    const [detail, setDetail] = useState<Masakan | null>(null);
    const [jumlah, setJumlah] = useState(1);
    const [rating, setRating] = useState(5);
    const [komentar, setKomentar] = useState('');
    const [mengirimUlasan, setMengirimUlasan] = useState(false);

    // Setelah ulasan tersimpan, segarkan data di dialog tanpa menutupnya.
    useEffect(() => {
        setDetail((sebelumnya) => {
            if (!sebelumnya) {
                return sebelumnya;
            }

            return (
                masakans.find((item) => item.id === sebelumnya.id) ?? sebelumnya
            );
        });
    }, [masakans]);

    const hasil = useMemo(() => {
        const kataKunci = search.trim().toLowerCase();
        const tersaring = masakans.filter((item) => {
            const cocokKategori =
                kategoriAktif === 'semua' || item.kategori_id === kategoriAktif;
            const cocokCari =
                kataKunci === '' ||
                item.nama.toLowerCase().includes(kataKunci) ||
                (item.deskripsi ?? '').toLowerCase().includes(kataKunci);

            return cocokKategori && cocokCari;
        });

        switch (urutan) {
            case 'termurah':
                return tersaring.sort((a, b) => a.harga - b.harga);
            case 'termahal':
                return tersaring.sort((a, b) => b.harga - a.harga);
            case 'rating':
                return tersaring.sort((a, b) => rataRating(b) - rataRating(a));
            case 'porsi':
                return tersaring.sort(
                    (a, b) => b.jumlah_porsi - a.jumlah_porsi,
                );
            default:
                return tersaring;
        }
    }, [masakans, search, kategoriAktif, urutan]);

    const jumlahPerKategori = useMemo(() => {
        const peta = new Map<number, number>();
        masakans.forEach((item) => {
            peta.set(item.kategori_id, (peta.get(item.kategori_id) ?? 0) + 1);
        });
        return peta;
    }, [masakans]);

    const totalPorsi = useMemo(
        () => masakans.reduce((total, item) => total + item.jumlah_porsi, 0),
        [masakans],
    );

    const labelUrutan =
        OPSI_URUT.find((opsi) => opsi.value === urutan)?.label ?? 'Rekomendasi';
    const adaFilter = search.trim() !== '' || kategoriAktif !== 'semua';

    const kosongkanFilter = () => {
        setSearch('');
        setKategoriAktif('semua');
        setUrutan('rekomendasi');
    };

    const bukaDetail = (item: Masakan) => {
        setDetail(item);
        setJumlah(1);

        const ulasanMilikSaya = item.reviews?.find(
            (ulasan) => ulasan.user_id === auth.user?.id,
        );

        setRating(ulasanMilikSaya?.rating ?? 5);
        setKomentar(ulasanMilikSaya?.komentar ?? '');
    };

    const tambahKeKeranjang = (item: Masakan, banyak = 1) => {
        setMenambah(item.id);
        router.post(
            `/keranjang/${item.id}`,
            { jumlah: banyak },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setMenambah(null),
            },
        );
    };

    const tambahDariDetail = () => {
        if (!detail) {
            return;
        }

        setMenambah(detail.id);
        router.post(
            `/keranjang/${detail.id}`,
            { jumlah },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setDetail(null),
                onFinish: () => setMenambah(null),
            },
        );
    };

    const kirimUlasan = () => {
        if (!detail) {
            return;
        }

        setMengirimUlasan(true);
        router.post(
            `/menu/${detail.id}/ulasan`,
            { rating, komentar },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setMengirimUlasan(false),
            },
        );
    };

    const daftarUlasan: Review[] = detail?.reviews ?? [];
    const ulasanSaya = daftarUlasan.find(
        (ulasan) => ulasan.user_id === auth.user?.id,
    );
    const bolehMengulas = detail ? menuSelesai.includes(detail.id) : false;

    return (
        <>
            <Head title="Beranda" />

            <div className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6">
                {/* Sapaan + pickup info */}
                <section className="relative overflow-hidden rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 px-6 py-8 text-white shadow-xl shadow-emerald-950/10 sm:px-10 sm:py-10 dark:border-emerald-900/60">
                    <div className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-white/10 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-amber-300/20 blur-3xl" />

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-xl">
                            <Badge className="mb-4 gap-1.5 border-0 bg-white/15 px-3 py-1.5 text-white backdrop-blur">
                                <MapPin className="size-3.5" />
                                Pickup only · ambil saat siap
                            </Badge>
                            <p className="text-sm font-medium text-emerald-100">
                                Selamat datang kembali 👋
                            </p>
                            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                                Halo, {auth.user?.name ?? 'Sahabat Umiq'}!
                            </h1>
                            <p className="mt-2 max-w-md text-sm leading-relaxed text-emerald-50/90 sm:text-base">
                                Pilih menu favoritmu, pesan sekarang, lalu ambil
                                di outlet begitu selesai dimasak. Tanpa antre,
                                tanpa biaya antar.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <Button
                                asChild
                                className="h-11 gap-2 rounded-xl bg-white px-5 text-emerald-700 shadow-sm hover:bg-emerald-50"
                            >
                                <Link href="/akun?tab=keranjang">
                                    <ShoppingBag className="size-4" />
                                    Keranjang
                                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
                                        {keranjang.jumlah}
                                    </span>
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="h-11 gap-2 rounded-xl border-white/30 bg-white/10 px-5 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                            >
                                <Link href="/akun?tab=pesanan">
                                    <ClipboardList className="size-4" />
                                    Pesanan saya
                                    {pesananAktif > 0 && (
                                        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-amber-950">
                                            {pesananAktif} aktif
                                        </span>
                                    )}
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Info ringkas */}
                    <div className="relative mt-8 grid gap-2 sm:grid-cols-3">
                        {[
                            {
                                icon: UtensilsCrossed,
                                value: `${masakans.length} menu`,
                                label: 'Pilihan masakan rumahan',
                            },
                            {
                                icon: Flame,
                                value: `${totalPorsi} porsi`,
                                label: 'Siap diambil hari ini',
                            },
                            {
                                icon: Clock,
                                value: '± 30 menit',
                                label: 'Estimasi selesai dimasak',
                            },
                        ].map((info) => (
                            <div
                                key={info.label}
                                className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 backdrop-blur"
                            >
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                                    <info.icon className="size-4" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold">
                                        {info.value}
                                    </p>
                                    <p className="truncate text-[11px] text-emerald-50/80">
                                        {info.label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pesanan aktif */}
                {pesananAktif > 0 && (
                    <Link
                        href="/akun?tab=pesanan"
                        className="group mt-5 flex items-center justify-between gap-4 rounded-2xl border border-amber-200/70 bg-amber-50/70 px-4 py-3.5 transition hover:border-amber-300 hover:bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 dark:hover:bg-amber-950/50"
                    >
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                                <ChefHat className="size-5" />
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                    Kamu punya {pesananAktif} pesanan aktif
                                </p>
                                <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                                    Cek nomor antrian dan status masaknya di
                                    sini.
                                </p>
                            </div>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-amber-700 transition group-hover:translate-x-0.5 dark:text-amber-300" />
                    </Link>
                )}

                {/* Pencarian + kategori */}
                <section id="menu" className="mt-10 scroll-mt-24">
                    <SectionHeading
                        eyebrow="Menu hari ini"
                        title="Mau masakan apa?"
                        description={`${hasil.length} dari ${masakans.length} menu siap dipesan. Pilih kategori atau cari favoritmu.`}
                        icon={UtensilsCrossed}
                        action={
                            <Badge
                                variant="outline"
                                className="gap-1.5 self-start border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 sm:self-auto dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                            >
                                <Flame className="size-3.5" />
                                {totalPorsi} porsi tersedia
                            </Badge>
                        }
                    />

                    <div className="mt-5 rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative w-full sm:max-w-sm">
                                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari nasi goreng, ayam..."
                                    aria-label="Cari masakan"
                                    className="h-11 rounded-xl border-border/80 bg-background pr-10 pl-10 shadow-sm"
                                />
                                {search !== '' && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        aria-label="Hapus pencarian"
                                        className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="h-11 gap-2 rounded-xl bg-background"
                                        >
                                            <ArrowUpDown className="size-4" />
                                            {labelUrutan}
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
                                {adaFilter && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={kosongkanFilter}
                                        className="h-11 gap-1.5 rounded-xl text-muted-foreground hover:text-foreground"
                                    >
                                        <RotateCcw className="size-3.5" />
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-4">
                            <FilterChip
                                active={kategoriAktif === 'semua'}
                                onClick={() => setKategoriAktif('semua')}
                                icon={<UtensilsCrossed className="size-4" />}
                                count={masakans.length}
                            >
                                Semua
                            </FilterChip>
                            {kategoris.map((kategori) => (
                                <FilterChip
                                    key={kategori.id}
                                    active={kategoriAktif === kategori.id}
                                    onClick={() =>
                                        setKategoriAktif(kategori.id)
                                    }
                                    icon={<span>{kategori.icon ?? '🍽️'}</span>}
                                    count={
                                        kategori.masakans_count ??
                                        jumlahPerKategori.get(kategori.id) ??
                                        0
                                    }
                                >
                                    {kategori.nama}
                                </FilterChip>
                            ))}
                        </div>

                        {adaFilter && (
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span>Menyaring:</span>
                                {search.trim() !== '' && (
                                    <Badge
                                        variant="outline"
                                        className="gap-1 py-1"
                                    >
                                        “{search.trim()}”
                                        <button
                                            type="button"
                                            onClick={() => setSearch('')}
                                            aria-label="Hapus pencarian"
                                            className="rounded-full p-0.5 hover:bg-muted"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </Badge>
                                )}
                                {kategoriAktif !== 'semua' && (
                                    <Badge
                                        variant="outline"
                                        className="gap-1 py-1"
                                    >
                                        {
                                            kategoris.find(
                                                (kategori) =>
                                                    kategori.id ===
                                                    kategoriAktif,
                                            )?.nama
                                        }
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setKategoriAktif('semua')
                                            }
                                            aria-label="Hapus filter kategori"
                                            className="rounded-full p-0.5 hover:bg-muted"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </Badge>
                                )}
                                <span className="font-medium text-emerald-700 dark:text-emerald-300">
                                    {hasil.length} hasil
                                </span>
                            </div>
                        )}

                        <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50/60 px-3 py-2 text-xs text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                            <Flame className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <p>
                                Cek badge porsi pada kartu menu. Menu habis
                                tetap bisa dilihat, tapi belum bisa dipesan.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Daftar menu */}
                <section className="mt-6">
                    {hasil.length === 0 ? (
                        <EmptyState
                            icon={Search}
                            title="Menu tidak ditemukan"
                            description="Coba kata kunci lain atau pilih kategori “Semua” untuk melihat semua masakan."
                            action={
                                <Button
                                    type="button"
                                    onClick={kosongkanFilter}
                                    className="h-10 gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    <RotateCcw className="size-4" />
                                    Reset filter
                                </Button>
                            }
                        />
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {hasil.map((item) => {
                                const habis = item.jumlah_porsi < 1;
                                const sedangMenambah = menambah === item.id;
                                const ulasan = jumlahUlasan(item);
                                const rata = rataRating(item);

                                return (
                                    <Card
                                        key={item.id}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Lihat detail ${item.nama}`}
                                        onClick={() => bukaDetail(item)}
                                        onKeyDown={(event) => {
                                            if (
                                                event.target !==
                                                event.currentTarget
                                            ) {
                                                return;
                                            }

                                            if (
                                                event.key === 'Enter' ||
                                                event.key === ' '
                                            ) {
                                                event.preventDefault();
                                                bukaDetail(item);
                                            }
                                        }}
                                        className="group cursor-pointer overflow-hidden rounded-2xl border-border/70 p-0 shadow-sm transition duration-300 outline-none hover:-translate-y-1 hover:border-emerald-300/70 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-emerald-500/60 dark:hover:border-emerald-800"
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                            {item.foto_url ? (
                                                <img
                                                    src={item.foto_url}
                                                    alt={item.nama}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.28),transparent_55%),radial-gradient(circle_at_75%_80%,rgba(20,184,166,0.24),transparent_50%)]">
                                                    <span className="text-5xl drop-shadow-sm">
                                                        {item.kategori?.icon ??
                                                            '🍱'}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5" />

                                            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                                                <Badge className="gap-1 border-0 bg-background/85 text-foreground shadow-sm backdrop-blur">
                                                    <span>
                                                        {item.kategori?.icon ??
                                                            '🍽️'}
                                                    </span>
                                                    {item.kategori?.nama ??
                                                        'Menu'}
                                                </Badge>
                                                <Badge
                                                    className={cn(
                                                        'border-0 shadow-sm backdrop-blur',
                                                        habis
                                                            ? 'bg-red-600/90 text-white'
                                                            : 'bg-emerald-600/90 text-white',
                                                    )}
                                                >
                                                    <Flame className="size-3" />
                                                    {habis
                                                        ? 'Habis'
                                                        : `Sisa ${item.jumlah_porsi} porsi`}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex flex-col p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="text-base font-bold tracking-tight">
                                                    {item.nama}
                                                </h3>
                                                <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-500/10 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                    {item.harga_format}
                                                </span>
                                            </div>
                                            <p className="mt-1 line-clamp-2 min-h-9 text-sm text-muted-foreground">
                                                {item.deskripsi ||
                                                    'Masakan spesial buatan rumahan.'}
                                            </p>

                                            <div className="mt-3 flex items-center justify-between gap-2">
                                                <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                                                    {ulasan > 0 ? (
                                                        <>
                                                            <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                                                            <span className="font-semibold text-foreground">
                                                                {rata.toFixed(
                                                                    1,
                                                                )}
                                                            </span>
                                                            <span className="truncate">
                                                                ({ulasan}{' '}
                                                                ulasan)
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="size-3.5 shrink-0 text-amber-500" />
                                                            <span className="truncate">
                                                                Menu baru ·
                                                                belum ada ulasan
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                                    Detail
                                                    <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" />
                                                </span>
                                            </div>

                                            <Button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    tambahKeKeranjang(item);
                                                }}
                                                disabled={
                                                    habis || sedangMenambah
                                                }
                                                className="mt-3 h-10 w-full gap-2 rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 disabled:bg-muted disabled:text-muted-foreground"
                                            >
                                                {sedangMenambah ? (
                                                    'Menambahkan...'
                                                ) : habis ? (
                                                    'Porsi habis'
                                                ) : (
                                                    <>
                                                        <Plus className="size-4" />
                                                        Tambah ke keranjang
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Cara ambil */}
                <section className="mt-12 overflow-hidden rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-card to-teal-50/60 p-5 shadow-sm sm:p-6 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:via-card dark:to-teal-950/20">
                    <SectionHeading
                        eyebrow="Cara ambil"
                        title="Pesan, masak, lalu ambil di outlet"
                        description="Tanpa antre, tanpa biaya antar — ambil begitu pesanan siap."
                        icon={MapPin}
                        action={
                            <Badge className="gap-1.5 self-start border-0 bg-emerald-600 text-white shadow-sm sm:self-auto">
                                <MapPin className="size-3.5" />
                                Pickup only
                            </Badge>
                        }
                    />

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        {[
                            {
                                nomor: '1',
                                icon: ClipboardList,
                                judul: 'Pilih & checkout',
                                detail: 'Tentukan pengambil dan metode bayar.',
                            },
                            {
                                nomor: '2',
                                icon: ChefHat,
                                judul: 'Pantau antrian',
                                detail: 'Lihat status masakan dari dapur.',
                            },
                            {
                                nomor: '3',
                                icon: PackageCheck,
                                judul: 'Ambil di outlet',
                                detail: 'Tunjukkan kode pesanan ke kasir.',
                            },
                        ].map((langkah, index) => (
                            <div
                                key={langkah.nomor}
                                className="relative rounded-2xl border border-border/70 bg-card/80 p-4"
                            >
                                {index < 2 && (
                                    <ChevronRight className="absolute top-1/2 -right-3.5 hidden size-5 -translate-y-1/2 text-emerald-500/60 sm:block" />
                                )}
                                <div className="flex items-center gap-3">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                                        <langkah.icon className="size-4" />
                                    </span>
                                    <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
                                        Langkah {langkah.nomor}
                                    </span>
                                </div>
                                <p className="mt-3 text-sm font-semibold">
                                    {langkah.judul}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {langkah.detail}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Dialog detail menu */}
            <Dialog
                open={detail !== null}
                onOpenChange={(terbuka) => {
                    if (!terbuka) {
                        setDetail(null);
                    }
                }}
            >
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
                    {detail && (
                        <>
                            <DialogHeader className="sr-only">
                                <DialogTitle>{detail.nama}</DialogTitle>
                                <DialogDescription>
                                    Foto, harga, ketersediaan porsi, dan
                                    komentar pelanggan untuk {detail.nama}.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="relative h-56 overflow-hidden rounded-xl bg-muted sm:h-72">
                                {detail.foto_url ? (
                                    <img
                                        src={detail.foto_url}
                                        alt={detail.nama}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.3),transparent_55%),radial-gradient(circle_at_75%_80%,rgba(20,184,166,0.26),transparent_50%)]">
                                        <span className="text-6xl drop-shadow-sm">
                                            {detail.kategori?.icon ?? '🍱'}
                                        </span>
                                    </div>
                                )}

                                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                                    <Badge className="gap-1 border-0 bg-background/85 text-foreground shadow-sm backdrop-blur">
                                        <span>
                                            {detail.kategori?.icon ?? '🍽️'}
                                        </span>
                                        {detail.kategori?.nama ?? 'Menu'}
                                    </Badge>
                                    <Badge
                                        className={cn(
                                            'border-0 shadow-sm backdrop-blur',
                                            detail.jumlah_porsi < 1
                                                ? 'bg-red-600/90 text-white'
                                                : 'bg-emerald-600/90 text-white',
                                        )}
                                    >
                                        {detail.jumlah_porsi < 1
                                            ? 'Habis'
                                            : `Sisa ${detail.jumlah_porsi} porsi`}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                                        {detail.nama}
                                    </h2>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                            ± 30 menit
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                            Ambil di outlet
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                            Halal · dimasak fresh
                                        </span>
                                    </div>
                                </div>
                                <span className="shrink-0 rounded-xl bg-emerald-50 px-3 py-1.5 text-lg font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                    {detail.harga_format}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-muted/30 px-3.5 py-2.5">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-2xl font-extrabold tracking-tight">
                                        {jumlahUlasan(detail) > 0
                                            ? rataRating(detail).toFixed(1)
                                            : '—'}
                                    </span>
                                    <div>
                                        <Bintang nilai={rataRating(detail)} />
                                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                                            {jumlahUlasan(detail)} ulasan
                                            pelanggan
                                        </p>
                                    </div>
                                </div>
                                <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <MessageSquareQuote className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                    Komentar asli pembeli
                                </span>
                            </div>

                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {detail.deskripsi ||
                                    'Masakan spesial buatan rumahan, dimasak fresh saat dipesan.'}
                            </p>

                            <div
                                className={cn(
                                    'flex items-start gap-2.5 rounded-xl border px-3.5 py-3',
                                    detail.jumlah_porsi < 1
                                        ? 'border-red-200 bg-red-50/70 dark:border-red-900/60 dark:bg-red-950/30'
                                        : detail.jumlah_porsi <= 3
                                          ? 'border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30'
                                          : 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/25',
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex size-8 shrink-0 items-center justify-center rounded-lg',
                                        detail.jumlah_porsi < 1
                                            ? 'bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-300'
                                            : detail.jumlah_porsi <= 3
                                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
                                    )}
                                >
                                    <Flame className="size-4" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold">
                                        {detail.jumlah_porsi < 1
                                            ? 'Porsi hari ini habis'
                                            : `Tersedia ${detail.jumlah_porsi} porsi hari ini`}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {detail.jumlah_porsi < 1
                                            ? 'Coba menu lain atau cek lagi besok ya.'
                                            : detail.jumlah_porsi <= 3
                                              ? 'Tinggal sedikit — amankan porsimu sekarang.'
                                              : 'Porsi terbatas dan dimasak fresh setelah dipesan.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="inline-flex h-11 shrink-0 items-center justify-between rounded-xl border border-border/80 bg-card">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setJumlah((nilai) =>
                                                Math.max(1, nilai - 1),
                                            )
                                        }
                                        disabled={jumlah <= 1}
                                        className="flex size-11 items-center justify-center rounded-l-xl transition hover:bg-muted disabled:opacity-40"
                                        aria-label="Kurangi jumlah"
                                    >
                                        <Minus className="size-4" />
                                    </button>
                                    <span className="w-10 text-center text-sm font-bold">
                                        {jumlah}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setJumlah((nilai) =>
                                                Math.min(
                                                    detail.jumlah_porsi,
                                                    nilai + 1,
                                                ),
                                            )
                                        }
                                        disabled={
                                            jumlah >= detail.jumlah_porsi ||
                                            detail.jumlah_porsi < 1
                                        }
                                        className="flex size-11 items-center justify-center rounded-r-xl transition hover:bg-muted disabled:opacity-40"
                                        aria-label="Tambah jumlah"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>

                                <Button
                                    type="button"
                                    onClick={tambahDariDetail}
                                    disabled={
                                        detail.jumlah_porsi < 1 ||
                                        menambah === detail.id
                                    }
                                    className="h-11 flex-1 gap-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:bg-muted disabled:text-muted-foreground"
                                >
                                    <ShoppingBag className="size-4" />
                                    {menambah === detail.id
                                        ? 'Menambahkan...'
                                        : detail.jumlah_porsi < 1
                                          ? 'Porsi habis'
                                          : `Tambah ke keranjang · ${formatRupiah(detail.harga * jumlah)}`}
                                </Button>
                            </div>

                            <Separator />

                            <section>
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="flex items-center gap-2 font-semibold">
                                        <MessageSquareQuote className="size-4 text-emerald-600 dark:text-emerald-400" />
                                        Komentar pelanggan
                                    </h3>
                                    <span className="text-xs text-muted-foreground">
                                        {jumlahUlasan(detail)} ulasan
                                    </span>
                                </div>

                                <div className="mt-3 space-y-2.5">
                                    {daftarUlasan.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
                                            <MessageSquareQuote className="mx-auto size-5 text-muted-foreground" />
                                            <p className="mt-2 text-sm font-medium">
                                                Belum ada komentar
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Jadi yang pertama mencoba dan
                                                bagikan pendapatmu.
                                            </p>
                                        </div>
                                    ) : (
                                        daftarUlasan.map((ulasan) => (
                                            <div
                                                key={ulasan.id}
                                                className="rounded-xl border border-border/70 p-3.5"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                                                        {ulasan.nama
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                            <p className="text-sm font-semibold">
                                                                {ulasan.nama}
                                                            </p>
                                                            {ulasan.terverifikasi && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                                    <BadgeCheck className="size-3" />
                                                                    Pembeli
                                                                    terverifikasi
                                                                </span>
                                                            )}
                                                            {ulasan.user_id ===
                                                                auth.user
                                                                    ?.id && (
                                                                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                                    Ulasanmu
                                                                </span>
                                                            )}
                                                            <span className="ml-auto text-[11px] text-muted-foreground">
                                                                {formatTanggal(
                                                                    ulasan.created_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <Bintang
                                                            nilai={
                                                                ulasan.rating
                                                            }
                                                            className="mt-1"
                                                        />
                                                        {ulasan.komentar && (
                                                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                                                {
                                                                    ulasan.komentar
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="mt-3 rounded-xl border border-border/70 bg-muted/30 p-3.5">
                                    {bolehMengulas ? (
                                        <>
                                            <h4 className="text-sm font-semibold">
                                                {ulasanSaya
                                                    ? 'Perbarui ulasanmu'
                                                    : 'Bagikan pengalamanmu'}
                                            </h4>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Kamu sudah mencoba menu ini.
                                                Beri bintang dan komentar
                                                singkat.
                                            </p>

                                            <div className="mt-2.5 flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map(
                                                    (bintang) => (
                                                        <button
                                                            key={bintang}
                                                            type="button"
                                                            onClick={() =>
                                                                setRating(
                                                                    bintang,
                                                                )
                                                            }
                                                            aria-label={`Beri ${bintang} bintang`}
                                                            className="rounded-md p-0.5 transition hover:scale-110"
                                                        >
                                                            <Star
                                                                className={cn(
                                                                    'size-6',
                                                                    bintang <=
                                                                        rating
                                                                        ? 'fill-amber-400 text-amber-400'
                                                                        : 'text-muted-foreground/35',
                                                                )}
                                                            />
                                                        </button>
                                                    ),
                                                )}
                                                <span className="ml-1 text-xs font-medium text-muted-foreground">
                                                    {rating}/5
                                                </span>
                                            </div>

                                            <textarea
                                                value={komentar}
                                                onChange={(event) =>
                                                    setKomentar(
                                                        event.target.value,
                                                    )
                                                }
                                                rows={2}
                                                maxLength={500}
                                                placeholder="Bagaimana rasa, porsi, dan pelayanannya?"
                                                className="mt-2 w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                                            />

                                            {errors?.ulasan && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {errors.ulasan}
                                                </p>
                                            )}

                                            <div className="mt-2 flex items-center justify-between gap-2">
                                                <span className="text-[11px] text-muted-foreground">
                                                    {komentar.length}/500
                                                </span>
                                                <Button
                                                    type="button"
                                                    onClick={kirimUlasan}
                                                    disabled={mengirimUlasan}
                                                    size="sm"
                                                    className="gap-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                                >
                                                    <Send className="size-3.5" />
                                                    {mengirimUlasan
                                                        ? 'Mengirim...'
                                                        : ulasanSaya
                                                          ? 'Perbarui ulasan'
                                                          : 'Kirim ulasan'}
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-start gap-2.5">
                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                <MessageSquareQuote className="size-4" />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Ingin ikut berkomentar?
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    Ulasan terbuka setelah
                                                    pesananmu berstatus selesai.
                                                    Yuk pesan menu ini dulu!
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

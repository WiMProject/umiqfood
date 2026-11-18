import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    ChefHat,
    ClipboardList,
    Clock,
    Flame,
    MapPin,
    Plus,
    Search,
    ShoppingBag,
    Sparkles,
    UtensilsCrossed,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from 'cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Kategori, KeranjangRingkas, Masakan } from '@/types';

interface Props {
    auth: {
        user: { name: string; role: string } | null;
    };
    masakans: Masakan[];
    kategoris: Kategori[];
    keranjang: KeranjangRingkas;
    pesananAktif: number;
    [key: string]: unknown;
}

export default function UserHome() {
    const { auth, masakans, kategoris, keranjang, pesananAktif } =
        usePage<Props>().props;

    const [search, setSearch] = useState('');
    const [kategoriAktif, setKategoriAktif] = useState<number | 'semua'>(
        'semua',
    );
    const [menambah, setMenambah] = useState<number | null>(null);

    const hasil = useMemo(() => {
        const kataKunci = search.trim().toLowerCase();

        return masakans.filter((item) => {
            const cocokKategori =
                kategoriAktif === 'semua' || item.kategori_id === kategoriAktif;
            const cocokCari =
                kataKunci === '' ||
                item.nama.toLowerCase().includes(kataKunci) ||
                (item.deskripsi ?? '').toLowerCase().includes(kataKunci);

            return cocokKategori && cocokCari;
        });
    }, [masakans, search, kategoriAktif]);

    const totalPorsi = useMemo(
        () => masakans.reduce((total, item) => total + item.jumlah_porsi, 0),
        [masakans],
    );

    const tambahKeKeranjang = (item: Masakan) => {
        setMenambah(item.id);
        router.post(
            `/keranjang/${item.id}`,
            { jumlah: 1 },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setMenambah(null),
            },
        );
    };

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
                <section className="mt-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-600 uppercase dark:text-emerald-400">
                                Menu hari ini
                            </p>
                            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
                                Mau makan apa?
                            </h2>
                        </div>

                        <div className="relative w-full sm:max-w-xs">
                            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari nasi goreng, ayam..."
                                aria-label="Cari masakan"
                                className="h-11 rounded-xl border-border/80 bg-card pl-10 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setKategoriAktif('semua')}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
                                kategoriAktif === 'semua'
                                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                                    : 'border-border/80 bg-card text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40',
                            )}
                        >
                            <UtensilsCrossed className="size-4" />
                            Semua
                        </button>
                        {kategoris.map((kategori) => (
                            <button
                                key={kategori.id}
                                type="button"
                                onClick={() => setKategoriAktif(kategori.id)}
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
                                    kategoriAktif === kategori.id
                                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                                        : 'border-border/80 bg-card text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40',
                                )}
                            >
                                <span>{kategori.icon ?? '🍽️'}</span>
                                {kategori.nama}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Daftar menu */}
                <section className="mt-6">
                    {hasil.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <Search className="size-5" />
                            </div>
                            <p className="mt-4 font-semibold">
                                Menu tidak ditemukan
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Coba kata kunci lain atau pilih kategori
                                &quot;Semua&quot;.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {hasil.map((item) => {
                                const habis = item.jumlah_porsi < 1;
                                const sedangMenambah = menambah === item.id;

                                return (
                                    <Card
                                        key={item.id}
                                        className="group overflow-hidden border-border/70 p-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
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
                                                <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                    {item.harga_format}
                                                </span>
                                            </div>
                                            <p className="mt-1 line-clamp-2 min-h-9 text-sm text-muted-foreground">
                                                {item.deskripsi ||
                                                    'Masakan spesial buatan rumahan.'}
                                            </p>

                                            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                                Halal · dimasak fresh
                                                <span className="mx-0.5">
                                                    ·
                                                </span>
                                                <Sparkles className="size-3.5 text-amber-500" />
                                                Favorit pelanggan
                                            </div>

                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    tambahKeKeranjang(item)
                                                }
                                                disabled={
                                                    habis || sedangMenambah
                                                }
                                                className="mt-4 h-10 w-full gap-2 rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 disabled:bg-muted disabled:text-muted-foreground"
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
                <section className="mt-12 rounded-2xl border border-border/70 bg-muted/30 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-600 uppercase dark:text-emerald-400">
                                Cara ambil
                            </p>
                            <h3 className="mt-1 text-lg font-bold">
                                Pesan, masak, lalu ambil di outlet
                            </h3>
                        </div>
                        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                            {[
                                ['1', 'Pilih menu & checkout'],
                                ['2', 'Pantau nomor antrian'],
                                ['3', 'Ambil saat status siap'],
                            ].map(([nomor, teks]) => (
                                <div
                                    key={nomor}
                                    className="flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-2"
                                >
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                                        {nomor}
                                    </span>
                                    {teks}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

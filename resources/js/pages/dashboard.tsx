import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    ArrowUpRight,
    Banknote,
    Boxes,
    CalendarDays,
    CheckCircle2,
    ChefHat,
    ClipboardList,
    Coins,
    ImageUp,
    LayoutDashboard,
    PackageCheck,
    PackageX,
    QrCode,
    ReceiptText,
    TrendingUp,
    UtensilsCrossed,
    Wallet,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { dashboard } from '@/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Order } from '@/types';

interface Kategori {
    id: number;
    nama: string;
    icon?: string;
}

interface Masakan {
    id: number;
    nama: string;
    harga_format: string;
    tersedia: boolean;
    jumlah_porsi: number;
    porsi_dipesan: number;
    porsi_tersedia: number;
    foto_url: string | null;
    kategori?: Kategori;
}

interface TrenPendapatan {
    tanggal: string;
    label: string;
    pendapatan: number;
    transaksi: number;
}

interface Props {
    stats: {
        totalMenu: number;
        tersedia: number;
        habis: number;
        totalKategori: number;
        totalBahan: number;
        stokKritis: number;
        pesananAktif: number;
        siapDiambil: number;
        pesananHariIni: number;
        pesananSelesaiHariIni: number;
        pendapatanHariIni: number;
        pembayaranLunasHariIni: number;
        pendapatanTujuhHari: number;
        totalPendapatan: number;
        pembayaranTertunda: number;
        tagihanTertunda: number;
    };
    trenPendapatan: TrenPendapatan[];
    menuPerKategori: { nama: string; menu: number }[];
    pesananTertunda: Order[];
    qrisImageUrl: string | null;
    masakans: Masakan[];
}

const TONES = {
    emerald:
        'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-300',
    sky: 'bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-300',
    amber: 'bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-300',
    rose: 'bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-300',
    teal: 'bg-teal-500/10 text-teal-600 ring-teal-500/20 dark:text-teal-300',
} as const;

type Tone = keyof typeof TONES;

function formatRupiah(value: number): string {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(value);
}

function formatRupiahSingkat(value: number): string {
    if (value >= 1_000_000) {
        const juta = value / 1_000_000;

        return `Rp ${juta.toLocaleString('id-ID', { maximumFractionDigits: 1 })}jt`;
    }

    if (value >= 1_000) {
        return `Rp ${Math.round(value / 1_000)}rb`;
    }

    return `Rp ${value}`;
}

function formatTanggalPendek(tanggal: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
    }).format(new Date(`${tanggal}T00:00:00`));
}

function MobileRevenueList({ data }: { data: TrenPendapatan[] }) {
    const maksimum = Math.max(...data.map((item) => item.pendapatan), 1);

    return (
        <div className="space-y-2.5 sm:hidden">
            {data.map((item) => (
                <div
                    key={item.tanggal}
                    className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5"
                >
                    <div className="flex items-baseline justify-between gap-3">
                        <p className="text-xs font-semibold">
                            {item.label}{' '}
                            <span className="font-normal text-muted-foreground">
                                · {formatTanggalPendek(item.tanggal)}
                            </span>
                        </p>
                        <p
                            className={`shrink-0 text-xs font-bold ${
                                item.pendapatan > 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            {item.pendapatan > 0
                                ? formatRupiah(item.pendapatan)
                                : 'Rp 0'}
                        </p>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-500/10">
                        <div
                            aria-hidden="true"
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-[width] duration-300"
                            style={{
                                width: `${Math.max(
                                    (item.pendapatan / maksimum) * 100,
                                    item.pendapatan > 0 ? 8 : 0,
                                )}%`,
                            }}
                        />
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                        {item.transaksi} transaksi
                    </p>
                </div>
            ))}
        </div>
    );
}

function MobileCategoryList({
    data,
}: {
    data: { nama: string; menu: number }[];
}) {
    const maksimum = Math.max(...data.map((item) => item.menu), 1);

    return (
        <div className="space-y-3 sm:hidden">
            {data.map((item) => (
                <div key={item.nama}>
                    <div className="flex items-baseline justify-between gap-3">
                        <p className="min-w-0 truncate text-xs font-semibold">
                            {item.nama}
                        </p>
                        <p className="shrink-0 text-xs font-bold text-teal-600 dark:text-teal-400">
                            {item.menu} menu
                        </p>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-teal-500/10">
                        <div
                            aria-hidden="true"
                            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-[width] duration-300"
                            style={{
                                width: `${(item.menu / maksimum) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    tone,
}: {
    label: string;
    value: string | number;
    hint: string;
    icon: typeof Coins;
    tone: Tone;
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-emerald-500/5 blur-2xl" />
            <span
                className={`relative flex size-10 items-center justify-center rounded-xl ring-1 ${TONES[tone]}`}
            >
                <Icon className="size-5" />
            </span>
            <p className="relative mt-4 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </p>
            <p className="relative mt-1 text-2xl font-extrabold tracking-tight">
                {value}
            </p>
            <p className="relative mt-1 text-[11px] text-muted-foreground">
                {hint}
            </p>
        </div>
    );
}

export default function Dashboard({
    stats,
    trenPendapatan,
    menuPerKategori,
    pesananTertunda,
    qrisImageUrl,
    masakans,
}: Props) {
    const [qrTerbuka, setQrTerbuka] = useState(false);
    const [memvalidasi, setMemvalidasi] = useState<number | null>(null);
    const inputQris = useRef<HTMLInputElement | null>(null);
    const qrForm = useForm<{ qris: File | null }>({ qris: null });

    const totalTren = trenPendapatan.reduce(
        (total, item) => total + item.pendapatan,
        0,
    );

    const chartPendapatanConfig = {
        pendapatan: {
            label: 'Pendapatan',
            color: '#10b981',
        },
    } satisfies ChartConfig;

    const chartKategoriConfig = {
        menu: {
            label: 'Jumlah menu',
            color: '#14b8a6',
        },
    } satisfies ChartConfig;

    const tanggalHariIni = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    const statUtama = [
        {
            label: 'Pendapatan hari ini',
            value: formatRupiah(stats.pendapatanHariIni),
            hint: `${stats.pembayaranLunasHariIni} pembayaran lunas · 7 hari ${formatRupiah(stats.pendapatanTujuhHari)}`,
            icon: Coins,
            tone: 'emerald' as const,
        },
        {
            label: 'Pesanan hari ini',
            value: stats.pesananHariIni,
            hint: `${stats.pesananSelesaiHariIni} sudah selesai diambil`,
            icon: ClipboardList,
            tone: 'sky' as const,
        },
        {
            label: 'Pesanan aktif',
            value: stats.pesananAktif,
            hint: `${stats.siapDiambil} siap diambil pelanggan`,
            icon: ChefHat,
            tone: 'amber' as const,
        },
        {
            label: 'Belum dibayar',
            value: stats.pembayaranTertunda,
            hint: `Total tagihan ${formatRupiah(stats.tagihanTertunda)}`,
            icon: Wallet,
            tone: 'rose' as const,
        },
    ];

    const statKatalog = [
        {
            label: 'Total menu',
            value: stats.totalMenu,
            icon: UtensilsCrossed,
            tone: 'emerald' as const,
        },
        {
            label: 'Tersedia',
            value: stats.tersedia,
            icon: PackageCheck,
            tone: 'teal' as const,
        },
        {
            label: 'Habis',
            value: stats.habis,
            icon: PackageX,
            tone: 'rose' as const,
        },
        {
            label: 'Kategori',
            value: stats.totalKategori,
            icon: LayoutDashboard,
            tone: 'sky' as const,
        },
        {
            label: 'Bahan baku',
            value: stats.totalBahan,
            icon: Boxes,
            tone: 'amber' as const,
        },
        {
            label: 'Stok kritis',
            value: stats.stokKritis,
            icon: AlertTriangle,
            tone:
                stats.stokKritis > 0 ? ('rose' as const) : ('emerald' as const),
        },
    ];

    const unggahQris = (berkas: File | null) => {
        if (!berkas) {
            return;
        }

        qrForm.setData('qris', berkas);
        qrForm.post('/dashboard/qris', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                qrForm.reset();
                if (inputQris.current) {
                    inputQris.current.value = '';
                }
            },
        });
    };

    const tandaiLunas = (order: Order) => {
        setMemvalidasi(order.id);
        router.patch(
            `/pesanan/${order.id}/bayar`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setMemvalidasi(null),
            },
        );
    };

    return (
        <>
            <Head title="Dashboard Admin" />

            <div className="flex flex-col gap-5 p-4 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-600 uppercase dark:text-emerald-400">
                            Dashboard admin
                        </p>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                            Selamat datang, Admin! 🍱
                        </h1>
                        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                            Pantau menu, pesanan, dan pembayaran pickup dari
                            satu tempat.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            className="gap-1.5 rounded-full border-border/70 bg-card px-3 py-1.5 text-xs font-medium"
                        >
                            <CalendarDays className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            {tanggalHariIni}
                        </Badge>
                        <Button
                            asChild
                            size="sm"
                            className="gap-1.5 rounded-full bg-emerald-600 px-4 text-white hover:bg-emerald-700"
                        >
                            <Link href="/pesanan">
                                Lihat pesanan
                                <ArrowRight className="size-3.5" />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* QRIS + validasi pembayaran */}
                <Card className="overflow-hidden p-0 shadow-sm">
                    <div className="grid lg:grid-cols-[320px_1fr] xl:grid-cols-[350px_1fr]">
                        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 text-white sm:p-6">
                            <div className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-full border border-white/10" />
                            <div className="pointer-events-none absolute -bottom-20 -left-10 size-44 rounded-full bg-white/5 blur-2xl" />

                            <div className="relative flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-semibold tracking-[0.2em] text-emerald-100/80 uppercase">
                                        Pembayaran
                                    </p>
                                    <h2 className="mt-1 text-lg font-bold">
                                        QRIS UmiqFood
                                    </h2>
                                </div>
                                <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                                    <QrCode className="size-5" />
                                </span>
                            </div>

                            <div className="relative mx-auto mt-4 w-full max-w-[210px] rounded-2xl bg-white p-2.5 shadow-2xl shadow-emerald-950/30">
                                {qrisImageUrl ? (
                                    <img
                                        src={qrisImageUrl}
                                        alt="QRIS pembayaran UmiqFood"
                                        className="aspect-square w-full rounded-xl object-contain"
                                    />
                                ) : (
                                    <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50 px-4 text-center text-emerald-700">
                                        <QrCode className="size-8" />
                                        <p className="text-xs font-semibold">
                                            QRIS belum diunggah
                                        </p>
                                        <p className="text-[10px] leading-relaxed text-emerald-600">
                                            Unggah gambar QRIS merchant agar
                                            bisa ditunjukkan ke pelanggan.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <p className="relative mt-3 text-center text-[11px] leading-relaxed text-emerald-100/85">
                                Tunjukkan QR ini ke pelanggan di kasir. Nominal
                                diisi dari aplikasi pembayaran mereka.
                            </p>

                            <div className="relative mt-3 flex flex-wrap items-center justify-center gap-2">
                                <input
                                    ref={inputQris}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    onChange={(event) =>
                                        unggahQris(
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    disabled={qrForm.processing}
                                    onClick={() => inputQris.current?.click()}
                                    className="h-8 gap-1.5 rounded-full bg-white/15 text-white hover:bg-white/25"
                                >
                                    <ImageUp className="size-3.5" />
                                    {qrForm.processing
                                        ? 'Mengunggah...'
                                        : qrisImageUrl
                                          ? 'Ganti QRIS'
                                          : 'Unggah QRIS'}
                                </Button>
                                {qrisImageUrl && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setQrTerbuka(true)}
                                        className="h-8 rounded-full text-emerald-50 hover:bg-white/15 hover:text-white"
                                    >
                                        Perbesar
                                    </Button>
                                )}
                            </div>

                            {qrForm.errors.qris && (
                                <p className="relative mt-2 text-center text-[11px] font-medium text-rose-200">
                                    {qrForm.errors.qris}
                                </p>
                            )}
                        </div>

                        <div className="p-5 sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <p className="flex items-center gap-2 text-sm font-semibold">
                                        <ReceiptText className="size-4 text-emerald-600 dark:text-emerald-400" />
                                        Validasi pembayaran
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Cocokkan notifikasi QRIS atau uang cash
                                        sebelum menandai pesanan lunas.
                                    </p>
                                </div>
                                <Badge
                                    variant={
                                        stats.pembayaranTertunda > 0
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    className="rounded-full"
                                >
                                    {stats.pembayaranTertunda} menunggu
                                </Badge>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2.5">
                                <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 p-3 dark:border-amber-900/60 dark:bg-amber-950/30">
                                    <p className="text-[10px] font-medium tracking-wide text-amber-700 uppercase dark:text-amber-300">
                                        Belum dibayar
                                    </p>
                                    <p className="mt-1 text-lg font-extrabold text-amber-800 dark:text-amber-200">
                                        {stats.pembayaranTertunda} pesanan
                                    </p>
                                    <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                                        {formatRupiah(stats.tagihanTertunda)}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                                    <p className="text-[10px] font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
                                        Lunas hari ini
                                    </p>
                                    <p className="mt-1 text-lg font-extrabold text-emerald-800 dark:text-emerald-200">
                                        {stats.pembayaranLunasHariIni}{' '}
                                        pembayaran
                                    </p>
                                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                                        {formatRupiah(stats.pendapatanHariIni)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                {pesananTertunda.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 px-4 py-7 text-center dark:border-emerald-900/60 dark:bg-emerald-950/20">
                                        <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
                                        <p className="text-sm font-semibold">
                                            Semua pembayaran beres
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Tidak ada tagihan yang menunggu
                                            validasi saat ini.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/60">
                                        {pesananTertunda.map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex items-center gap-3 py-2.5"
                                            >
                                                <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                                                    <span className="text-[7px] font-semibold tracking-wider uppercase opacity-70">
                                                        Antri
                                                    </span>
                                                    <span className="text-xs leading-none font-extrabold">
                                                        {String(
                                                            order.nomor_antrian,
                                                        ).padStart(3, '0')}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold">
                                                        {order.kode}
                                                    </p>
                                                    <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                                                        {order.metode_pembayaran ===
                                                        'qris' ? (
                                                            <QrCode className="size-3" />
                                                        ) : (
                                                            <Banknote className="size-3" />
                                                        )}
                                                        {order.nama_pengambil}
                                                        {' · '}
                                                        {
                                                            order.metode_pembayaran_label
                                                        }
                                                    </p>
                                                </div>
                                                <span className="shrink-0 text-sm font-bold">
                                                    {order.total_format}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    disabled={
                                                        memvalidasi === order.id
                                                    }
                                                    onClick={() =>
                                                        tandaiLunas(order)
                                                    }
                                                    className="h-8 shrink-0 gap-1 rounded-lg bg-emerald-600 px-2.5 text-white hover:bg-emerald-700"
                                                >
                                                    <CheckCircle2 className="size-3.5" />
                                                    <span className="hidden sm:inline">
                                                        Lunas
                                                    </span>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 flex justify-end">
                                <Link
                                    href="/pesanan"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                                >
                                    Buka semua pesanan
                                    <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statUtama.map((item) => (
                        <StatCard key={item.label} {...item} />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
                    <Card className="p-5 sm:p-6">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="flex items-center gap-2 text-sm font-semibold">
                                    <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                                    Tren pendapatan
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Pembayaran lunas 7 hari terakhir berdasarkan
                                    tanggal bayar.
                                </p>
                            </div>
                            <Badge
                                variant="secondary"
                                className="rounded-full font-semibold"
                            >
                                {formatRupiah(stats.pendapatanTujuhHari)}
                            </Badge>
                        </div>

                        <MobileRevenueList data={trenPendapatan} />

                        <div className="hidden sm:block">
                            {totalTren === 0 ? (
                                <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center">
                                    <Coins className="size-6 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                        Belum ada pembayaran lunas
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Data akan muncul setelah pembayaran
                                        divalidasi.
                                    </p>
                                </div>
                            ) : (
                                <ChartContainer
                                    config={chartPendapatanConfig}
                                    className="h-64 w-full"
                                >
                                    <BarChart
                                        data={trenPendapatan}
                                        margin={{
                                            top: 8,
                                            right: 4,
                                            left: -8,
                                            bottom: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="pendapatan-fill"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#34d399"
                                                    stopOpacity={1}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#059669"
                                                    stopOpacity={0.65}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            vertical={false}
                                            strokeDasharray="3 3"
                                        />
                                        <XAxis
                                            dataKey="label"
                                            tickLine={false}
                                            axisLine={false}
                                            fontSize={11}
                                        />
                                        <YAxis
                                            width={58}
                                            tickLine={false}
                                            axisLine={false}
                                            fontSize={10}
                                            tickFormatter={(value: number) =>
                                                formatRupiahSingkat(value)
                                            }
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    formatter={(value) =>
                                                        formatRupiah(
                                                            Number(value ?? 0),
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                        <Bar
                                            dataKey="pendapatan"
                                            fill="url(#pendapatan-fill)"
                                            radius={[8, 8, 0, 0]}
                                            maxBarSize={56}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </div>

                        <p className="mt-3 text-[11px] text-muted-foreground">
                            Total pendapatan tercatat:{' '}
                            <span className="font-semibold text-foreground">
                                {formatRupiah(stats.totalPendapatan)}
                            </span>
                        </p>
                    </Card>

                    <Card className="p-5 sm:p-6">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="flex items-center gap-2 text-sm font-semibold">
                                    <UtensilsCrossed className="size-4 text-emerald-600 dark:text-emerald-400" />
                                    Menu per kategori
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Distribusi {stats.totalMenu} menu.
                                </p>
                            </div>
                            <Badge variant="secondary" className="rounded-full">
                                {menuPerKategori.length} kategori
                            </Badge>
                        </div>

                        {menuPerKategori.length === 0 ? (
                            <p className="py-10 text-center text-sm text-muted-foreground sm:hidden">
                                Belum ada menu untuk ditampilkan.
                            </p>
                        ) : (
                            <MobileCategoryList data={menuPerKategori} />
                        )}

                        <div className="hidden sm:block">
                            {menuPerKategori.length === 0 ? (
                                <p className="py-10 text-center text-sm text-muted-foreground">
                                    Belum ada menu untuk ditampilkan.
                                </p>
                            ) : (
                                <ChartContainer
                                    config={chartKategoriConfig}
                                    className="h-64 w-full"
                                >
                                    <BarChart
                                        data={menuPerKategori}
                                        layout="vertical"
                                        margin={{
                                            top: 4,
                                            right: 16,
                                            left: 0,
                                            bottom: 4,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="kategori-fill"
                                                x1="0"
                                                y1="0"
                                                x2="1"
                                                y2="0"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#14b8a6"
                                                    stopOpacity={0.75}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#10b981"
                                                    stopOpacity={1}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            horizontal={false}
                                            strokeDasharray="3 3"
                                        />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            type="category"
                                            dataKey="nama"
                                            width={98}
                                            tickLine={false}
                                            axisLine={false}
                                            fontSize={11}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent nameKey="menu" />
                                            }
                                        />
                                        <Bar
                                            dataKey="menu"
                                            fill="url(#kategori-fill)"
                                            radius={[0, 6, 6, 0]}
                                            barSize={18}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1fr_1.65fr]">
                    <Card className="p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold">
                                    Katalog & stok
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Kondisi menu dan bahan baku saat ini.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2.5">
                            {statKatalog.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-muted/20 p-2.5"
                                >
                                    <span
                                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ${TONES[item.tone]}`}
                                    >
                                        <item.icon className="size-4" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-lg leading-none font-extrabold">
                                            {item.value}
                                        </p>
                                        <p className="truncate text-[10px] text-muted-foreground">
                                            {item.label}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {stats.stokKritis > 0 && (
                            <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                <AlertTriangle className="size-3.5 shrink-0" />
                                {stats.stokKritis} bahan baku di bawah stok
                                minimum.
                            </p>
                        )}

                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="mt-4 w-full gap-1.5 rounded-xl"
                        >
                            <Link href="/inventori">
                                Kelola inventori
                                <ArrowUpRight className="size-3.5" />
                            </Link>
                        </Button>
                    </Card>

                    <Card className="overflow-hidden p-0">
                        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
                            <div>
                                <p className="text-sm font-semibold">
                                    Menu terbaru
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Lima menu yang terakhir ditambahkan.
                                </p>
                            </div>
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="gap-1 rounded-lg"
                            >
                                <Link href="/masakan">
                                    Kelola menu
                                    <ArrowUpRight className="size-3.5" />
                                </Link>
                            </Button>
                        </div>

                        {masakans.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                Belum ada menu. Klik "Kelola menu" untuk
                                menambahkan.
                            </div>
                        ) : (
                            <ul className="divide-y divide-border/60">
                                {masakans.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-center gap-3 px-5 py-3 transition hover:bg-muted/40 sm:px-6"
                                    >
                                        {item.foto_url ? (
                                            <img
                                                src={item.foto_url}
                                                alt={item.nama}
                                                className="size-10 rounded-xl border object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                                                <UtensilsCrossed className="size-4.5" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {item.nama}
                                            </p>
                                            <p className="truncate text-[11px] text-muted-foreground">
                                                {item.kategori?.icon}{' '}
                                                {item.kategori?.nama || '-'} ·{' '}
                                                {item.jumlah_porsi} porsi ·{' '}
                                                {item.porsi_dipesan} dipesan ·{' '}
                                                {item.porsi_tersedia} tersedia
                                            </p>
                                        </div>
                                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                            {item.harga_format}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={`hidden rounded-full text-[10px] sm:inline-flex ${
                                                item.tersedia
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                    : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300'
                                            }`}
                                        >
                                            {item.tersedia
                                                ? 'Tersedia'
                                                : 'Habis'}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>

            <Dialog open={qrTerbuka} onOpenChange={setQrTerbuka}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>QRIS UmiqFood</DialogTitle>
                        <DialogDescription>
                            Tampilkan QR ini ke pelanggan untuk pembayaran di
                            kasir.
                        </DialogDescription>
                    </DialogHeader>
                    {qrisImageUrl && (
                        <img
                            src={qrisImageUrl}
                            alt="QRIS pembayaran UmiqFood"
                            className="mx-auto w-full max-w-xs rounded-xl border bg-white object-contain p-2"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

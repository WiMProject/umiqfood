import { Head, router } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    Boxes,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    Clock3,
    Coins,
    Printer,
    QrCode,
    RotateCcw,
    TrendingUp,
    TriangleAlert,
    UtensilsCrossed,
    Wallet,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { AdminTableCard, StatusPill } from '@/components/admin-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateInput } from '@/components/ui/date-input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Ringkasan {
    pemasukan: number;
    pemasukan_cash: number;
    pemasukan_qris: number;
    transaksi: number;
    pengeluaran: number;
    jumlah_pengeluaran: number;
    laba: number;
    margin_persen: number;
    porsi_terjual: number;
    pesanan: number;
    pesanan_selesai: number;
    pesanan_aktif: number;
    pesanan_dibatalkan: number;
    stok_kritis: number;
    nilai_stok: number;
}

interface Pembayaran {
    id: number;
    kode: string;
    order_kode: string;
    pelanggan: string;
    metode: string;
    metode_label: string;
    jumlah: number;
    waktu: string | null;
}

interface MenuTerlaris {
    nama: string;
    porsi: number;
    penjualan: number;
}

interface Pengeluaran {
    id: number;
    deskripsi: string;
    kategori_label: string;
    jumlah: number;
    waktu: string | null;
    petugas: string;
}

interface KategoriPengeluaran {
    kategori: string;
    label: string;
    total: number;
    jumlah_transaksi: number;
}

interface StokKritis {
    nama: string;
    satuan: string;
    stok: number;
    stok_minimum: number;
}

interface Props {
    tanggal: string;
    tanggalHariIni: string;
    labelTanggal: string;
    hariIni: boolean;
    dibuatPada: string;
    ringkasan: Ringkasan;
    pembayaran: Pembayaran[];
    menuTerlaris: MenuTerlaris[];
    pengeluaran: Pengeluaran[];
    perKategoriPengeluaran: KategoriPengeluaran[];
    stokKritis: StokKritis[];
}

function formatRupiah(value: number): string {
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
}

function formatAngka(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 2,
    }).format(value);
}

function formatJam(value: string | null): string {
    return value ?? '-';
}

function persen(bagian: number, total: number): number {
    return total > 0 ? Math.round((bagian / total) * 100) : 0;
}

function BarisMetode({
    icon: Icon,
    label,
    value,
    porsi,
    warna,
    batang,
}: {
    icon: LucideIcon;
    label: string;
    value: number;
    porsi: number;
    warna: string;
    batang: string;
}) {
    return (
        <div>
            <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
                    <Icon className={cn('size-4 shrink-0', warna)} />
                    <span className="truncate">{label}</span>
                </span>
                <span className="shrink-0 font-bold tabular-nums">
                    {formatRupiah(value)}
                </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                    className={cn('h-full rounded-full', batang)}
                    style={{ width: `${porsi}%` }}
                />
            </div>
            <p className="mt-1 text-right text-[10px] text-muted-foreground tabular-nums">
                {porsi}% dari pemasukan
            </p>
        </div>
    );
}

function StatistikKecil({
    label,
    value,
    icon: Icon,
    warna,
}: {
    label: string;
    value: number;
    icon: LucideIcon;
    warna: string;
}) {
    return (
        <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/25 p-3">
            <span
                className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                    warna,
                )}
            >
                <Icon className="size-4" />
            </span>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="text-sm font-extrabold text-foreground tabular-nums">
                    {value}
                </p>
            </div>
        </div>
    );
}

export default function AdminLaporanTutupHariIndex({
    tanggal,
    tanggalHariIni,
    labelTanggal,
    hariIni,
    dibuatPada,
    ringkasan,
    pembayaran,
    menuTerlaris,
    pengeluaran,
    perKategoriPengeluaran,
    stokKritis,
}: Props) {
    const [filterTanggal, setFilterTanggal] = useState(tanggal);

    useEffect(() => {
        setFilterTanggal(tanggal);
    }, [tanggal]);

    const terapkanFilter = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/laporan/tutup-hari',
            { tanggal: filterTanggal },
            { preserveState: true, preserveScroll: true },
        );
    };

    const kembaliKeHariIni = () => {
        setFilterTanggal(tanggalHariIni);

        router.get(
            '/laporan/tutup-hari',
            { tanggal: tanggalHariIni },
            { preserveState: true, preserveScroll: true },
        );
    };

    const kartuRingkasan = [
        {
            label: 'Pemasukan',
            value: formatRupiah(ringkasan.pemasukan),
            hint: `${ringkasan.transaksi} transaksi lunas`,
            icon: ArrowUpRight,
            warna: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
        },
        {
            label: 'Pengeluaran',
            value: formatRupiah(ringkasan.pengeluaran),
            hint: `${ringkasan.jumlah_pengeluaran} catatan uang keluar`,
            icon: ArrowDownRight,
            warna: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300',
        },
        {
            label: ringkasan.laba >= 0 ? 'Laba' : 'Rugi',
            value: formatRupiah(Math.abs(ringkasan.laba)),
            hint: `Margin ${ringkasan.margin_persen}% dari pemasukan`,
            icon: TrendingUp,
            warna:
                ringkasan.laba >= 0
                    ? 'bg-teal-500/10 text-teal-700 ring-teal-500/20 dark:text-teal-300'
                    : 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300',
        },
        {
            label: 'Porsi terjual',
            value: `${formatAngka(ringkasan.porsi_terjual)} porsi`,
            hint: 'Dipotong saat pembayaran lunas',
            icon: UtensilsCrossed,
            warna: 'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300',
        },
    ];

    const porsiCash = persen(ringkasan.pemasukan_cash, ringkasan.pemasukan);
    const porsiQris = persen(ringkasan.pemasukan_qris, ringkasan.pemasukan);
    const totalKategori = perKategoriPengeluaran.reduce(
        (total, item) => total + item.total,
        0,
    );

    return (
        <>
            <Head title="Tutup Hari" />

            <div className="area-cetak mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="text-center lg:text-left">
                        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
                                <ClipboardCheck className="size-5" />
                            </span>
                            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                Rekap Tutup Hari
                            </h1>
                            {hariIni && (
                                <StatusPill tone="emerald">Hari ini</StatusPill>
                            )}
                        </div>
                        <p className="mt-2 text-sm font-medium text-foreground">
                            {labelTanggal}
                        </p>
                        <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-muted-foreground lg:justify-start">
                            <Clock3 className="size-3" />
                            Dibuat {formatJam(dibuatPada)} WIB
                        </p>
                    </div>

                    <form
                        onSubmit={terapkanFilter}
                        className="print-hide flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-end"
                    >
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="tanggal-rekap"
                                className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                            >
                                Tanggal rekap
                            </Label>
                            <DateInput
                                id="tanggal-rekap"
                                value={filterTanggal}
                                onChange={(event) =>
                                    setFilterTanggal(event.target.value)
                                }
                                className="sm:w-44"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="h-10 gap-2 rounded-xl bg-emerald-600 px-5 font-semibold text-white shadow-sm hover:bg-emerald-700"
                        >
                            <CalendarDays className="size-4" />
                            Terapkan
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={kembaliKeHariIni}
                            disabled={hariIni}
                            className="h-10 gap-2 rounded-xl"
                        >
                            <RotateCcw className="size-4" />
                            Hari ini
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.print()}
                            className="h-10 gap-2 rounded-xl"
                        >
                            <Printer className="size-4" />
                            Cetak
                        </Button>
                    </form>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {kartuRingkasan.map((item) => (
                        <Card
                            key={item.label}
                            className="break-card relative overflow-hidden rounded-2xl border-border/70 bg-card p-4 shadow-sm"
                        >
                            <div className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-emerald-500/5" />
                            <div className="relative flex items-start gap-3">
                                <span
                                    className={cn(
                                        'flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset sm:size-10',
                                        item.warna,
                                    )}
                                >
                                    <item.icon className="size-4.5 sm:size-5" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase sm:text-[11px]">
                                        {item.label}
                                    </p>
                                    <p className="mt-1 text-base font-extrabold tracking-tight text-foreground tabular-nums sm:text-2xl">
                                        {item.value}
                                    </p>
                                </div>
                            </div>
                            <p className="relative mt-3 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                                {item.hint}
                            </p>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-5 xl:grid-cols-3">
                    <Card className="break-card rounded-2xl border-border/70 p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                <Coins className="size-4" />
                            </span>
                            <div>
                                <h2 className="text-sm font-semibold text-foreground">
                                    Pemasukan per metode
                                </h2>
                                <p className="text-[11px] text-muted-foreground">
                                    Berdasarkan pembayaran lunas
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 space-y-5">
                            <BarisMetode
                                icon={Banknote}
                                label="Bayar di tempat"
                                value={ringkasan.pemasukan_cash}
                                porsi={porsiCash}
                                warna="text-teal-600 dark:text-teal-400"
                                batang="bg-teal-500"
                            />
                            <BarisMetode
                                icon={QrCode}
                                label="QRIS di kasir"
                                value={ringkasan.pemasukan_qris}
                                porsi={porsiQris}
                                warna="text-emerald-600 dark:text-emerald-400"
                                batang="bg-emerald-500"
                            />
                        </div>
                        <p className="mt-5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                            Total{' '}
                            <span className="font-semibold text-foreground tabular-nums">
                                {ringkasan.transaksi}
                            </span>{' '}
                            transaksi lunas pada tanggal ini.
                        </p>
                    </Card>

                    <Card className="break-card rounded-2xl border-border/70 p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300">
                                <ClipboardList className="size-4" />
                            </span>
                            <div>
                                <h2 className="text-sm font-semibold text-foreground">
                                    Status pesanan
                                </h2>
                                <p className="text-[11px] text-muted-foreground">
                                    Pesanan dengan tanggal ini
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-2.5">
                            <StatistikKecil
                                label="Total"
                                value={ringkasan.pesanan}
                                icon={ClipboardList}
                                warna="bg-slate-500/10 text-slate-600 dark:text-slate-300"
                            />
                            <StatistikKecil
                                label="Selesai"
                                value={ringkasan.pesanan_selesai}
                                icon={CheckCircle2}
                                warna="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            />
                            <StatistikKecil
                                label="Aktif"
                                value={ringkasan.pesanan_aktif}
                                icon={Clock3}
                                warna="bg-amber-500/10 text-amber-700 dark:text-amber-300"
                            />
                            <StatistikKecil
                                label="Dibatalkan"
                                value={ringkasan.pesanan_dibatalkan}
                                icon={TriangleAlert}
                                warna="bg-rose-500/10 text-rose-700 dark:text-rose-300"
                            />
                        </div>
                    </Card>

                    <Card className="break-card rounded-2xl border-border/70 p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300">
                                <Boxes className="size-4" />
                            </span>
                            <div>
                                <h2 className="text-sm font-semibold text-foreground">
                                    Kondisi stok
                                </h2>
                                <p className="text-[11px] text-muted-foreground">
                                    Bahan baku saat rekap dibuat
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-rose-50/70 p-3 dark:bg-rose-950/20">
                                <p className="text-[10px] font-semibold tracking-wide text-rose-700 uppercase dark:text-rose-300">
                                    Stok kritis
                                </p>
                                <p className="mt-1 text-xl font-extrabold text-rose-700 tabular-nums dark:text-rose-300">
                                    {ringkasan.stok_kritis}
                                </p>
                            </div>
                            <div className="rounded-xl bg-emerald-50/70 p-3 dark:bg-emerald-950/20">
                                <p className="text-[10px] font-semibold tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
                                    Nilai stok
                                </p>
                                <p className="mt-1 text-sm font-extrabold text-emerald-700 tabular-nums dark:text-emerald-300">
                                    {formatRupiah(ringkasan.nilai_stok)}
                                </p>
                            </div>
                        </div>
                        {stokKritis.length > 0 ? (
                            <div className="mt-4 space-y-2">
                                {stokKritis.slice(0, 3).map((bahan) => (
                                    <div
                                        key={bahan.nama}
                                        className="flex items-center justify-between gap-2 text-[11px]"
                                    >
                                        <span className="min-w-0 truncate font-medium text-foreground">
                                            {bahan.nama}
                                        </span>
                                        <span className="shrink-0 text-muted-foreground tabular-nums">
                                            {formatAngka(bahan.stok)} /{' '}
                                            {formatAngka(bahan.stok_minimum)}{' '}
                                            {bahan.satuan}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 text-xs text-muted-foreground">
                                Semua stok bahan berada di atas batas minimum.
                            </p>
                        )}
                    </Card>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <AdminTableCard
                        title="Menu Terlaris"
                        description="Porsi terjual dari pembayaran lunas tanggal ini."
                        count={menuTerlaris.length}
                        icon={UtensilsCrossed}
                    >
                        {menuTerlaris.length === 0 ? (
                            <p className="px-4 py-10 text-center text-xs text-muted-foreground">
                                Belum ada menu terjual pada tanggal ini.
                            </p>
                        ) : (
                            <div className="divide-y divide-border/60">
                                {menuTerlaris.map((menu, indeks) => (
                                    <div
                                        key={menu.nama}
                                        className="flex items-center gap-3 px-4 py-3 sm:px-5"
                                    >
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                                            {indeks + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {menu.nama}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground tabular-nums">
                                                {formatAngka(menu.porsi)} porsi
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-sm font-bold text-emerald-700 tabular-nums dark:text-emerald-300">
                                            {formatRupiah(menu.penjualan)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </AdminTableCard>

                    <AdminTableCard
                        title="Pengeluaran per Kategori"
                        description="Uang keluar yang dicatat pada tanggal ini."
                        count={perKategoriPengeluaran.length}
                        icon={Wallet}
                    >
                        {perKategoriPengeluaran.length === 0 ? (
                            <p className="px-4 py-10 text-center text-xs text-muted-foreground">
                                Belum ada pengeluaran pada tanggal ini.
                            </p>
                        ) : (
                            <div className="space-y-4 p-4 sm:p-5">
                                {perKategoriPengeluaran.map((kategori) => (
                                    <div key={kategori.kategori}>
                                        <div className="flex items-center justify-between gap-3 text-xs">
                                            <span className="font-semibold text-foreground">
                                                {kategori.label}
                                            </span>
                                            <span className="shrink-0 font-bold text-rose-700 tabular-nums dark:text-rose-300">
                                                {formatRupiah(kategori.total)}
                                            </span>
                                        </div>
                                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-rose-500"
                                                style={{
                                                    width: `${persen(kategori.total, totalKategori)}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="mt-1 text-[10px] text-muted-foreground">
                                            {kategori.jumlah_transaksi}{' '}
                                            transaksi
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </AdminTableCard>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <AdminTableCard
                        title="Pembayaran Lunas"
                        description="Transaksi yang masuk pada tanggal ini."
                        count={pembayaran.length}
                        icon={ArrowUpRight}
                    >
                        {pembayaran.length === 0 ? (
                            <p className="px-4 py-10 text-center text-xs text-muted-foreground">
                                Belum ada pembayaran lunas pada tanggal ini.
                            </p>
                        ) : (
                            <div className="divide-y divide-border/60">
                                {pembayaran.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5 px-4 py-3 sm:px-5"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {item.pelanggan}
                                            </p>
                                            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                                                <span>{item.order_kode}</span>
                                                <span>·</span>
                                                <span>{item.metode_label}</span>
                                                <span>·</span>
                                                <span>
                                                    {formatJam(item.waktu)}
                                                </span>
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-sm font-extrabold text-emerald-700 tabular-nums dark:text-emerald-300">
                                            +{formatRupiah(item.jumlah)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </AdminTableCard>

                    <AdminTableCard
                        title="Catatan Pengeluaran"
                        description="Rincian uang keluar terbaru pada tanggal ini."
                        count={pengeluaran.length}
                        icon={Wallet}
                    >
                        {pengeluaran.length === 0 ? (
                            <p className="px-4 py-10 text-center text-xs text-muted-foreground">
                                Belum ada catatan pengeluaran pada tanggal ini.
                            </p>
                        ) : (
                            <div className="divide-y divide-border/60">
                                {pengeluaran.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5 px-4 py-3 sm:px-5"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {item.deskripsi}
                                            </p>
                                            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                                                <span>
                                                    {item.kategori_label}
                                                </span>
                                                <span>·</span>
                                                <span>{item.petugas}</span>
                                                <span>·</span>
                                                <span>
                                                    {formatJam(item.waktu)}
                                                </span>
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-sm font-extrabold text-rose-700 tabular-nums dark:text-rose-300">
                                            -{formatRupiah(item.jumlah)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </AdminTableCard>
                </div>
            </div>
        </>
    );
}

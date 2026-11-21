import { Head, router } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    Coins,
    Info,
    RotateCcw,
    Scale,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
    AdminTableCard,
    StatusPill,
    TableHead,
} from '@/components/admin-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Ringkasan {
    pemasukan: number;
    pengeluaran: number;
    laba: number;
    margin_persen: number;
    transaksi: number;
    nilai_stok: number;
}

interface Harian {
    tanggal: string;
    label: string;
    pemasukan: number;
    pengeluaran: number;
}

interface KategoriPengeluaran {
    kategori: string;
    label: string;
    total: number;
    jumlah_transaksi: number;
}

interface MarginMenu {
    nama: string;
    harga: number;
    hpp: number;
    margin: number;
    margin_persen: number;
}

interface Props {
    ringkasan: Ringkasan;
    harian: Harian[];
    perKategori: KategoriPengeluaran[];
    marginMenu: MarginMenu[];
    dari: string;
    sampai: string;
}

const grafikConfig = {
    pemasukan: { label: 'Pemasukan', color: '#10b981' },
    pengeluaran: { label: 'Pengeluaran', color: '#f43f5e' },
} satisfies ChartConfig;

function formatRupiah(value: number): string {
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
}

function formatRupiahSingkat(value: number): string {
    if (Math.abs(value) >= 1_000_000) {
        return `Rp ${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}jt`;
    }

    if (Math.abs(value) >= 1_000) {
        return `Rp ${Math.round(value / 1_000)}rb`;
    }

    return `Rp ${value}`;
}

function toneMargin(persen: number): 'emerald' | 'amber' | 'rose' {
    if (persen >= 40) {
        return 'emerald';
    }

    if (persen >= 20) {
        return 'amber';
    }

    return 'rose';
}

export default function AdminLaporanLabaRugiIndex({
    ringkasan,
    harian,
    perKategori,
    marginMenu,
    dari,
    sampai,
}: Props) {
    const [filterDari, setFilterDari] = useState(dari);
    const [filterSampai, setFilterSampai] = useState(sampai);

    useEffect(() => {
        setFilterDari(dari);
        setFilterSampai(sampai);
    }, [dari, sampai]);

    const terapkanFilter = (event: React.FormEvent) => {
        event.preventDefault();

        router.get(
            '/laporan/laba-rugi',
            { dari: filterDari, sampai: filterSampai },
            { preserveState: true, preserveScroll: true },
        );
    };

    const resetFilter = () => {
        const hariIni = new Date().toLocaleDateString('en-CA');
        const awalBulan = `${hariIni.slice(0, 7)}-01`;

        setFilterDari(awalBulan);
        setFilterSampai(hariIni);
        router.get(
            '/laporan/laba-rugi',
            { dari: awalBulan, sampai: hariIni },
            { preserveState: true, preserveScroll: true },
        );
    };

    const adaTransaksi = ringkasan.pemasukan > 0 || ringkasan.pengeluaran > 0;
    const totalKategori = perKategori.reduce(
        (total, item) => total + item.total,
        0,
    );

    const kartuStats = [
        {
            label: 'Pemasukan',
            value: formatRupiah(ringkasan.pemasukan),
            hint: `${ringkasan.transaksi} pembayaran lunas`,
            icon: ArrowUpRight,
            warna: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/15 dark:text-emerald-300',
            aksen: 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent',
        },
        {
            label: 'Pengeluaran',
            value: formatRupiah(ringkasan.pengeluaran),
            hint: 'Uang keluar pada periode ini',
            icon: ArrowDownRight,
            warna: 'bg-rose-500/10 text-rose-600 ring-rose-500/15 dark:text-rose-300',
            aksen: 'bg-gradient-to-r from-rose-400 via-rose-500 to-transparent',
        },
        {
            label: ringkasan.laba >= 0 ? 'Laba' : 'Rugi',
            value: formatRupiah(Math.abs(ringkasan.laba)),
            hint: 'Pemasukan dikurangi pengeluaran',
            icon: TrendingUp,
            warna:
                ringkasan.laba >= 0
                    ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/15 dark:text-emerald-300'
                    : 'bg-rose-500/10 text-rose-600 ring-rose-500/15 dark:text-rose-300',
            aksen:
                ringkasan.laba >= 0
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-transparent'
                    : 'bg-gradient-to-r from-rose-400 via-rose-500 to-transparent',
        },
        {
            label: 'Margin',
            value: `${ringkasan.margin_persen}%`,
            hint: `Nilai stok ${formatRupiah(ringkasan.nilai_stok)}`,
            icon: Coins,
            warna: 'bg-sky-500/10 text-sky-600 ring-sky-500/15 dark:text-sky-300',
            aksen: 'bg-gradient-to-r from-sky-400 via-sky-500 to-transparent',
        },
    ];

    return (
        <>
            <Head title="Laporan Laba Rugi" />

            <div className="flex flex-col gap-5 p-4 sm:p-6">
                <div className="relative overflow-hidden rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50 via-teal-50/70 to-card p-5 shadow-sm sm:p-6 dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-card">
                    <div className="pointer-events-none absolute -top-12 -right-10 size-44 rounded-full bg-teal-400/10 blur-2xl" />
                    <div className="pointer-events-none absolute -right-4 -bottom-16 size-40 rounded-full bg-emerald-400/10 blur-3xl" />
                    <div className="relative flex items-start gap-4">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/25">
                            <Scale className="size-6" />
                        </span>
                        <div>
                            <p className="text-[11px] font-bold tracking-[0.18em] text-emerald-700 uppercase dark:text-emerald-400">
                                Laporan
                            </p>
                            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Laba rugi
                            </h1>
                            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                                Pemasukan berasal dari pembayaran lunas.
                                Pengeluaran diambil dari catatan uang keluar.
                            </p>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={terapkanFilter}
                    className="flex flex-col gap-4 rounded-2xl border border-emerald-100/70 bg-gradient-to-r from-card via-emerald-50/30 to-card p-4 shadow-sm sm:flex-row sm:items-end dark:border-emerald-900/40 dark:via-emerald-950/10"
                >
                    <div className="grid flex-1 grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="laporan-dari"
                                className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                            >
                                Dari
                            </Label>
                            <Input
                                id="laporan-dari"
                                type="date"
                                value={filterDari}
                                onChange={(event) =>
                                    setFilterDari(event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="laporan-sampai"
                                className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                            >
                                Sampai
                            </Label>
                            <Input
                                id="laporan-sampai"
                                type="date"
                                value={filterSampai}
                                onChange={(event) =>
                                    setFilterSampai(event.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            className="h-10 flex-1 gap-2 rounded-xl bg-emerald-600 px-5 font-semibold text-white shadow-sm hover:bg-emerald-700 sm:flex-none"
                        >
                            <CalendarDays className="size-4" />
                            Terapkan
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetFilter}
                            className="h-10 gap-2 rounded-xl"
                            title="Kembali ke bulan ini"
                        >
                            <RotateCcw className="size-4" />
                            <span className="sm:hidden">Reset</span>
                        </Button>
                    </div>
                </form>

                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {kartuStats.map((item) => (
                        <Card
                            key={item.label}
                            className="group relative gap-0 overflow-hidden px-4 pt-5 pb-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <span
                                className={cn(
                                    'absolute inset-x-0 top-0 h-1 opacity-80',
                                    item.aksen,
                                )}
                            />
                            <div className="flex items-start justify-between gap-2">
                                <span
                                    className={cn(
                                        'flex size-10 items-center justify-center rounded-xl ring-1 ring-inset',
                                        item.warna,
                                    )}
                                >
                                    <item.icon className="size-5" />
                                </span>
                                <p className="text-right text-[10px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
                                    {item.label}
                                </p>
                            </div>
                            <p className="mt-3 text-lg font-extrabold tracking-tight tabular-nums sm:text-xl">
                                {item.value}
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                {item.hint}
                            </p>
                        </Card>
                    ))}
                </div>

                <Card className="relative gap-4 overflow-hidden border-emerald-100/70 p-4 shadow-sm sm:p-5 dark:border-emerald-900/40">
                    <span className="pointer-events-none absolute -top-20 right-10 size-40 rounded-full bg-emerald-400/5 blur-3xl" />
                    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15 dark:text-emerald-300">
                                <TrendingUp className="size-4.5" />
                            </span>
                            <div>
                                <h2 className="text-base font-bold tracking-tight">
                                    Arus kas harian
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Perbandingan uang masuk dan uang keluar per
                                    tanggal.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-500/15 dark:text-emerald-300">
                                <span className="size-2 rounded-full bg-emerald-500" />
                                Pemasukan
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-600 ring-1 ring-rose-500/15 dark:text-rose-300">
                                <span className="size-2 rounded-full bg-rose-500" />
                                Pengeluaran
                            </span>
                        </div>
                    </div>

                    {adaTransaksi ? (
                        <ChartContainer
                            config={grafikConfig}
                            className="h-72 w-full"
                        >
                            <BarChart
                                data={harian}
                                margin={{
                                    top: 8,
                                    right: 4,
                                    left: -8,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    vertical={false}
                                    strokeDasharray="3 3"
                                />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={11}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    width={58}
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={10}
                                    tickFormatter={formatRupiahSingkat}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value) =>
                                                formatRupiah(Number(value ?? 0))
                                            }
                                        />
                                    }
                                />
                                <Bar
                                    dataKey="pemasukan"
                                    fill="#10b981"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={24}
                                />
                                <Bar
                                    dataKey="pengeluaran"
                                    fill="#f43f5e"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={24}
                                />
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 to-card text-center dark:border-emerald-900/50 dark:from-emerald-950/20">
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                                <Wallet className="size-6" />
                            </span>
                            <p className="mt-1 text-sm font-semibold">
                                Belum ada transaksi pada periode ini
                            </p>
                            <p className="max-w-xs text-xs text-muted-foreground">
                                Pembayaran lunas dan catatan pengeluaran akan
                                muncul di sini.
                            </p>
                        </div>
                    )}
                </Card>

                <div className="grid gap-4 xl:grid-cols-2">
                    <AdminTableCard
                        title="Pengeluaran per kategori"
                        description="Ringkasan uang keluar pada periode yang dipilih."
                        count={perKategori.length}
                        icon={Wallet}
                    >
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border/70 bg-muted/30">
                                <tr>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead align="center">
                                        Transaksi
                                    </TableHead>
                                    <TableHead align="right">Total</TableHead>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {perKategori.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-4 py-10 text-center"
                                        >
                                            <div className="mx-auto flex max-w-[220px] flex-col items-center gap-2">
                                                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                                                    <Wallet className="size-5" />
                                                </span>
                                                <p className="text-sm font-medium text-foreground">
                                                    Belum ada pengeluaran
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Catatan uang keluar akan
                                                    dikelompokkan di sini.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    perKategori.map((item) => (
                                        <tr
                                            key={item.kategori}
                                            className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="size-2 shrink-0 rounded-full bg-emerald-500/80" />
                                                    <span className="font-medium text-foreground">
                                                        {item.label}
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-1 w-full max-w-32 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                                                        style={{
                                                            width: `${totalKategori > 0 ? Math.round((item.total / totalKategori) * 100) : 0}%`,
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-muted-foreground tabular-nums">
                                                {item.jumlah_transaksi}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-foreground tabular-nums">
                                                {formatRupiah(item.total)}
                                                <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                                                    (
                                                    {totalKategori > 0
                                                        ? Math.round(
                                                              (item.total /
                                                                  totalKategori) *
                                                                  100,
                                                          )
                                                        : 0}
                                                    %)
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </AdminTableCard>

                    <AdminTableCard
                        title="Estimasi margin per menu"
                        description="Harga jual dikurangi total resep × harga beli bahan."
                        count={marginMenu.length}
                        icon={TrendingUp}
                    >
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border/70 bg-muted/30">
                                <tr>
                                    <TableHead>Menu</TableHead>
                                    <TableHead align="right">HPP</TableHead>
                                    <TableHead align="right">Margin</TableHead>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {marginMenu.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-4 py-10 text-center"
                                        >
                                            <div className="mx-auto flex max-w-[220px] flex-col items-center gap-2">
                                                <span className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300">
                                                    <TrendingUp className="size-5" />
                                                </span>
                                                <p className="text-sm font-medium text-foreground">
                                                    Belum ada margin menu
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Lengkapi resep dan harga
                                                    beli bahan untuk melihat
                                                    estimasi.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    marginMenu.map((item) => (
                                        <tr
                                            key={item.nama}
                                            className="transition-colors hover:bg-sky-50/40 dark:hover:bg-sky-950/10"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-foreground">
                                                    {item.nama}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Jual{' '}
                                                    {formatRupiah(item.harga)}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                                                {formatRupiah(item.hpp)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <StatusPill
                                                    tone={toneMargin(
                                                        item.margin_persen,
                                                    )}
                                                >
                                                    {formatRupiah(item.margin)}{' '}
                                                    · {item.margin_persen}%
                                                </StatusPill>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </AdminTableCard>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 px-4 py-3 text-xs leading-relaxed text-emerald-900 shadow-sm dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-teal-950/20 dark:text-emerald-200">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                        <Info className="size-4" />
                    </span>
                    <p>
                        Laba di atas dihitung secara kas: pemasukan dari
                        pembayaran lunas dikurangi pengeluaran tercatat. Margin
                        per menu adalah estimasi berdasarkan harga beli bahan
                        saat ini, jadi bisa berbeda saat harga bahan berubah.
                    </p>
                </div>
            </div>
        </>
    );
}

AdminLaporanLabaRugiIndex.layout = {
    breadcrumbs: [{ title: 'Laba Rugi', href: '/laporan/laba-rugi' }],
};

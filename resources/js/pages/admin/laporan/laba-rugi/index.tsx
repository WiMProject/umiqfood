import { Head, router } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    Coins,
    Info,
    RotateCcw,
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
            warna: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
        },
        {
            label: 'Pengeluaran',
            value: formatRupiah(ringkasan.pengeluaran),
            hint: 'Uang keluar pada periode ini',
            icon: ArrowDownRight,
            warna: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
        },
        {
            label: ringkasan.laba >= 0 ? 'Laba' : 'Rugi',
            value: formatRupiah(Math.abs(ringkasan.laba)),
            hint: 'Pemasukan dikurangi pengeluaran',
            icon: TrendingUp,
            warna:
                ringkasan.laba >= 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
        },
        {
            label: 'Margin',
            value: `${ringkasan.margin_persen}%`,
            hint: `Nilai stok ${formatRupiah(ringkasan.nilai_stok)}`,
            icon: Coins,
            warna: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
        },
    ];

    return (
        <>
            <Head title="Laporan Laba Rugi" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-600 uppercase dark:text-emerald-400">
                            Laporan
                        </p>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
                            Laba rugi
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Pemasukan berasal dari pembayaran lunas. Pengeluaran
                            diambil dari catatan uang keluar.
                        </p>
                    </div>
                    <form
                        onSubmit={terapkanFilter}
                        className="flex flex-col gap-2 sm:flex-row sm:items-end"
                    >
                        <div className="grid gap-1.5">
                            <Label htmlFor="laporan-dari">Dari</Label>
                            <Input
                                id="laporan-dari"
                                type="date"
                                value={filterDari}
                                onChange={(event) =>
                                    setFilterDari(event.target.value)
                                }
                                className="h-10 rounded-xl bg-card"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="laporan-sampai">Sampai</Label>
                            <Input
                                id="laporan-sampai"
                                type="date"
                                value={filterSampai}
                                onChange={(event) =>
                                    setFilterSampai(event.target.value)
                                }
                                className="h-10 rounded-xl bg-card"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="h-10 gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            <CalendarDays className="size-4" />
                            Terapkan
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetFilter}
                            className="h-10"
                            title="Kembali ke bulan ini"
                        >
                            <RotateCcw className="size-4" />
                        </Button>
                    </form>
                </div>

                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {kartuStats.map((item) => (
                        <Card key={item.label} className="gap-1 p-4">
                            <span
                                className={cn(
                                    'flex size-9 items-center justify-center rounded-xl',
                                    item.warna,
                                )}
                            >
                                <item.icon className="size-4.5" />
                            </span>
                            <p className="mt-2 text-xl font-extrabold tracking-tight">
                                {item.value}
                            </p>
                            <p className="text-xs font-medium text-muted-foreground">
                                {item.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground/80">
                                {item.hint}
                            </p>
                        </Card>
                    ))}
                </div>

                <Card className="gap-4 p-4 sm:p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold">
                                Arus kas harian
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Perbandingan uang masuk dan uang keluar per
                                tanggal.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="size-2.5 rounded-full bg-emerald-500" />
                                Pemasukan
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="size-2.5 rounded-full bg-rose-500" />
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
                        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center">
                            <Wallet className="size-6 text-muted-foreground" />
                            <p className="text-sm font-medium">
                                Belum ada transaksi pada periode ini
                            </p>
                            <p className="text-xs text-muted-foreground">
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
                                            className="px-4 py-10 text-center text-sm text-muted-foreground"
                                        >
                                            Belum ada pengeluaran.
                                        </td>
                                    </tr>
                                ) : (
                                    perKategori.map((item) => (
                                        <tr key={item.kategori}>
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                {item.label}
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
                                            className="px-4 py-10 text-center text-sm text-muted-foreground"
                                        >
                                            Belum ada menu dengan resep lengkap.
                                        </td>
                                    </tr>
                                ) : (
                                    marginMenu.map((item) => (
                                        <tr key={item.nama}>
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

                <div className="flex items-start gap-2 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200">
                    <Info className="mt-0.5 size-4 shrink-0" />
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

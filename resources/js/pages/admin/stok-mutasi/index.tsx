import { Head, router } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowLeftRight,
    ArrowUpRight,
    Boxes,
    ClipboardList,
    Filter,
    RotateCcw,
    UtensilsCrossed,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    AdminTableCard,
    StatusPill,
    TableHead,
} from '@/components/admin-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateInput } from '@/components/ui/date-input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Opsi {
    value: string;
    label: string;
}

interface Mutasi {
    id: number;
    jenis: string;
    sumber: string;
    jenis_label: string;
    sumber_label: string;
    tanda: string;
    jumlah: number;
    satuan: string | null;
    harga_satuan: number | null;
    keterangan: string | null;
    created_at: string;
    bahan_baku?: { id: number; nama: string; satuan: string } | null;
    masakan?: { id: number; nama: string } | null;
    order?: { id: number; kode: string } | null;
    user?: { id: number; name: string } | null;
}

interface Props {
    movements: Mutasi[];
    stats: {
        jumlah: number;
        masuk: number;
        keluar: number;
        porsi_terjual: number;
    };
    filters: { jenis: string; sumber: string; dari: string; sampai: string };
    jenisList: Opsi[];
    sumberList: Opsi[];
}

function formatAngka(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatRupiah(value: number): string {
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
}

function formatWaktu(value: string): string {
    const tanggal = new Date(value);

    if (Number.isNaN(tanggal.getTime())) {
        return '-';
    }

    return tanggal.toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function namaItem(mutasi: Mutasi): string {
    return (
        mutasi.bahan_baku?.nama ??
        mutasi.masakan?.nama ??
        mutasi.keterangan ??
        '-'
    );
}

export default function AdminStokMutasiIndex({
    movements,
    stats,
    filters,
    jenisList,
    sumberList,
}: Props) {
    const [jenis, setJenis] = useState(filters.jenis);
    const [sumber, setSumber] = useState(filters.sumber);
    const [dari, setDari] = useState(filters.dari);
    const [sampai, setSampai] = useState(filters.sampai);

    useEffect(() => {
        setJenis(filters.jenis);
        setSumber(filters.sumber);
        setDari(filters.dari);
        setSampai(filters.sampai);
    }, [filters]);

    const terapkanFilter = (event: React.FormEvent) => {
        event.preventDefault();

        router.get(
            '/stok-mutasi',
            { jenis, sumber, dari, sampai },
            { preserveState: true, preserveScroll: true },
        );
    };

    const resetFilter = () => {
        setJenis('');
        setSumber('');
        setDari('');
        setSampai('');

        router.get(
            '/stok-mutasi',
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const kartuStats = [
        {
            label: 'Total catatan',
            value: `${stats.jumlah} data`,
            hint: 'Pergerakan stok tercatat',
            icon: ClipboardList,
            warna: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
        },
        {
            label: 'Stok masuk',
            value: `${stats.masuk} kali`,
            hint: 'Pembelian, masak, dan pembatalan',
            icon: ArrowUpRight,
            warna: 'bg-teal-500/10 text-teal-700 ring-teal-500/20 dark:text-teal-300',
        },
        {
            label: 'Stok keluar',
            value: `${stats.keluar} kali`,
            hint: 'Pemakaian dan pembayaran',
            icon: ArrowDownRight,
            warna: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300',
        },
        {
            label: 'Porsi terjual',
            value: `${formatAngka(stats.porsi_terjual)} porsi`,
            hint: 'Dipotong saat pembayaran lunas',
            icon: UtensilsCrossed,
            warna: 'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300',
        },
    ];

    return (
        <>
            <Head title="Mutasi Stok" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-1 text-center">
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        Riwayat Mutasi Stok
                    </h1>
                    <p className="text-[12px] leading-relaxed text-muted-foreground sm:text-sm">
                        Lacak setiap perubahan stok bahan baku dan porsi menu,
                        mulai dari pembelian sampai pembayaran.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {kartuStats.map((item) => (
                        <Card
                            key={item.label}
                            className="rounded-2xl border-border/70 bg-card p-4 shadow-sm"
                        >
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
                            <p className="mt-3 text-lg font-extrabold tracking-tight tabular-nums sm:text-2xl">
                                {item.value}
                            </p>
                            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                                {item.hint}
                            </p>
                        </Card>
                    ))}
                </div>

                <form
                    onSubmit={terapkanFilter}
                    className="flex flex-col gap-4 rounded-2xl border border-emerald-100/70 bg-gradient-to-r from-card via-emerald-50/30 to-card p-4 shadow-sm lg:flex-row lg:items-end dark:border-emerald-900/40 dark:via-emerald-950/10"
                >
                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="filter-jenis"
                                className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                            >
                                Jenis
                            </Label>
                            <Select
                                value={jenis || 'semua'}
                                onValueChange={(value) =>
                                    setJenis(value === 'semua' ? '' : value)
                                }
                            >
                                <SelectTrigger id="filter-jenis">
                                    <SelectValue placeholder="Semua jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semua">
                                        Semua jenis
                                    </SelectItem>
                                    {jenisList.map((opsi) => (
                                        <SelectItem
                                            key={opsi.value}
                                            value={opsi.value}
                                        >
                                            {opsi.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="filter-sumber"
                                className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                            >
                                Sumber
                            </Label>
                            <Select
                                value={sumber || 'semua'}
                                onValueChange={(value) =>
                                    setSumber(value === 'semua' ? '' : value)
                                }
                            >
                                <SelectTrigger id="filter-sumber">
                                    <SelectValue placeholder="Semua sumber" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semua">
                                        Semua sumber
                                    </SelectItem>
                                    {sumberList.map((opsi) => (
                                        <SelectItem
                                            key={opsi.value}
                                            value={opsi.value}
                                        >
                                            {opsi.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="filter-dari"
                                className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                            >
                                Dari tanggal
                            </Label>
                            <DateInput
                                id="filter-dari"
                                value={dari}
                                onChange={(event) =>
                                    setDari(event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="filter-sampai"
                                className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                            >
                                Sampai tanggal
                            </Label>
                            <DateInput
                                id="filter-sampai"
                                value={sampai}
                                onChange={(event) =>
                                    setSampai(event.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            className="h-10 flex-1 gap-2 rounded-xl bg-emerald-600 px-5 font-semibold text-white shadow-sm hover:bg-emerald-700 sm:flex-none"
                        >
                            <Filter className="size-4" />
                            Terapkan
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetFilter}
                            className="h-10 gap-2 rounded-xl"
                        >
                            <RotateCcw className="size-4" />
                            Reset
                        </Button>
                    </div>
                </form>

                <AdminTableCard
                    title="Pergerakan Stok"
                    description="Catatan mutasi terakhir (maksimal 200 data)."
                    count={movements.length}
                    icon={ArrowLeftRight}
                >
                    {movements.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
                            <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                <Boxes className="size-5" />
                            </span>
                            <p className="text-sm font-semibold text-foreground">
                                Belum ada mutasi stok
                            </p>
                            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                                Mutasi akan muncul setelah ada pembelian bahan,
                                proses masak, atau pembayaran pesanan.
                            </p>
                        </div>
                    ) : (
                        <>
                            <table className="hidden w-full border-collapse text-center text-sm md:table">
                                <thead className="bg-muted/40">
                                    <tr>
                                        <TableHead align="center">
                                            Waktu
                                        </TableHead>
                                        <TableHead align="center">
                                            Jenis
                                        </TableHead>
                                        <TableHead align="center">
                                            Sumber
                                        </TableHead>
                                        <TableHead align="center">
                                            Bahan / Menu
                                        </TableHead>
                                        <TableHead align="center">
                                            Jumlah
                                        </TableHead>
                                        <TableHead align="center">
                                            Nilai Satuan
                                        </TableHead>
                                        <TableHead align="center">
                                            Petugas
                                        </TableHead>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.map((mutasi) => (
                                        <tr
                                            key={mutasi.id}
                                            className="border-t border-border/60 transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"
                                        >
                                            <td className="px-4 py-3 align-middle text-xs whitespace-nowrap text-muted-foreground">
                                                {formatWaktu(mutasi.created_at)}
                                            </td>
                                            <td className="px-4 py-3 align-middle">
                                                <StatusPill
                                                    tone={
                                                        mutasi.jenis === 'masuk'
                                                            ? 'emerald'
                                                            : 'rose'
                                                    }
                                                    icon={
                                                        mutasi.jenis === 'masuk'
                                                            ? ArrowUpRight
                                                            : ArrowDownRight
                                                    }
                                                >
                                                    {mutasi.jenis_label}
                                                </StatusPill>
                                            </td>
                                            <td className="px-4 py-3 align-middle text-xs font-medium whitespace-nowrap">
                                                {mutasi.sumber_label}
                                            </td>
                                            <td className="px-4 py-3 align-middle">
                                                <p className="text-xs font-semibold text-foreground">
                                                    {namaItem(mutasi)}
                                                </p>
                                                {mutasi.order && (
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {mutasi.order.kode}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 align-middle text-xs font-bold whitespace-nowrap tabular-nums">
                                                <span
                                                    className={
                                                        mutasi.jenis === 'masuk'
                                                            ? 'text-emerald-700 dark:text-emerald-300'
                                                            : 'text-rose-700 dark:text-rose-300'
                                                    }
                                                >
                                                    {mutasi.tanda}
                                                    {formatAngka(
                                                        mutasi.jumlah,
                                                    )}{' '}
                                                    {mutasi.satuan ?? ''}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 align-middle text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                                                {mutasi.harga_satuan !== null
                                                    ? formatRupiah(
                                                          Math.round(
                                                              mutasi.harga_satuan,
                                                          ),
                                                      )
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-3 align-middle text-xs whitespace-nowrap text-muted-foreground">
                                                {mutasi.user?.name ?? '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="divide-y divide-border/60 md:hidden">
                                {movements.map((mutasi) => (
                                    <div
                                        key={mutasi.id}
                                        className="flex flex-col gap-2 p-4"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-foreground">
                                                    {namaItem(mutasi)}
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                    {formatWaktu(
                                                        mutasi.created_at,
                                                    )}
                                                </p>
                                            </div>
                                            <StatusPill
                                                tone={
                                                    mutasi.jenis === 'masuk'
                                                        ? 'emerald'
                                                        : 'rose'
                                                }
                                                icon={
                                                    mutasi.jenis === 'masuk'
                                                        ? ArrowUpRight
                                                        : ArrowDownRight
                                                }
                                            >
                                                {mutasi.jenis_label}
                                            </StatusPill>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                            <span>{mutasi.sumber_label}</span>
                                            {mutasi.order && (
                                                <span>{mutasi.order.kode}</span>
                                            )}
                                            <span>
                                                {mutasi.user?.name ?? '-'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className={cn(
                                                    'text-sm font-extrabold tabular-nums',
                                                    mutasi.jenis === 'masuk'
                                                        ? 'text-emerald-700 dark:text-emerald-300'
                                                        : 'text-rose-700 dark:text-rose-300',
                                                )}
                                            >
                                                {mutasi.tanda}
                                                {formatAngka(
                                                    mutasi.jumlah,
                                                )}{' '}
                                                {mutasi.satuan ?? ''}
                                            </span>
                                            {mutasi.harga_satuan !== null && (
                                                <span className="text-[11px] text-muted-foreground tabular-nums">
                                                    {formatRupiah(
                                                        Math.round(
                                                            mutasi.harga_satuan,
                                                        ),
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </AdminTableCard>
            </div>
        </>
    );
}

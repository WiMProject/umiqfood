import { Head, router } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowLeftRight,
    ArrowUpRight,
    Boxes,
    ClipboardList,
    Clock3,
    Filter,
    ReceiptText,
    RotateCcw,
    UserRound,
    UtensilsCrossed,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

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

interface GayaJenis {
    tone: 'emerald' | 'rose';
    icon: LucideIcon;
    teks: string;
    latar: string;
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

function tanggalDari(value: string): Date | null {
    const tanggal = new Date(value);

    return Number.isNaN(tanggal.getTime()) ? null : tanggal;
}

function formatWaktu(value: string): string {
    const tanggal = tanggalDari(value);

    if (!tanggal) {
        return '-';
    }

    return tanggal.toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function gayaJenis(jenis: string): GayaJenis {
    if (jenis === 'masuk') {
        return {
            tone: 'emerald',
            icon: ArrowUpRight,
            teks: 'text-emerald-700 dark:text-emerald-300',
            latar: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
        };
    }

    return {
        tone: 'rose',
        icon: ArrowDownRight,
        teks: 'text-rose-700 dark:text-rose-300',
        latar: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300',
    };
}

function namaItem(mutasi: Mutasi): string {
    return (
        mutasi.bahan_baku?.nama ??
        mutasi.masakan?.nama ??
        mutasi.keterangan ??
        '-'
    );
}

function jumlahMutasi(mutasi: Mutasi): string {
    return `${mutasi.tanda}${formatAngka(mutasi.jumlah)}${
        mutasi.satuan ? ` ${mutasi.satuan}` : ''
    }`;
}

function KartuMutasi({ mutasi }: { mutasi: Mutasi }) {
    const gaya = gayaJenis(mutasi.jenis);
    const Icon = gaya.icon;

    return (
        <div className="p-4 transition-colors hover:bg-emerald-50/30 sm:px-5 dark:hover:bg-emerald-950/10">
            <div className="flex items-start gap-3">
                <span
                    className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
                        gaya.latar,
                    )}
                >
                    <Icon className="size-5" />
                </span>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm leading-snug font-semibold text-foreground">
                                {namaItem(mutasi)}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock3 className="size-3 shrink-0" />
                                {formatWaktu(mutasi.created_at)}
                            </p>
                        </div>
                        <span
                            className={cn(
                                'shrink-0 text-base font-extrabold whitespace-nowrap tabular-nums',
                                gaya.teks,
                            )}
                        >
                            {jumlahMutasi(mutasi)}
                        </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <StatusPill tone={gaya.tone} icon={Icon}>
                            {mutasi.jenis_label}
                        </StatusPill>
                        <span className="inline-flex items-center rounded-full bg-muted/70 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                            {mutasi.sumber_label}
                        </span>
                        {mutasi.order && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                                <ReceiptText className="size-3" />
                                {mutasi.order.kode}
                            </span>
                        )}
                        {mutasi.user && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                                <UserRound className="size-3" />
                                {mutasi.user.name}
                            </span>
                        )}
                    </div>

                    {mutasi.harga_satuan !== null && (
                        <p className="mt-2.5 text-[11px] text-muted-foreground">
                            Nilai satuan:{' '}
                            <span className="font-semibold text-foreground tabular-nums">
                                {formatRupiah(Math.round(mutasi.harga_satuan))}
                            </span>
                            {mutasi.satuan ? ` / ${mutasi.satuan}` : ''}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function BarisTabel({ mutasi }: { mutasi: Mutasi }) {
    const gaya = gayaJenis(mutasi.jenis);
    const Icon = gaya.icon;

    return (
        <tr className="border-t border-border/60 transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
            <td className="px-3 py-3 align-middle text-xs whitespace-nowrap text-muted-foreground">
                {formatWaktu(mutasi.created_at)}
            </td>
            <td className="px-3 py-3 align-middle">
                <StatusPill tone={gaya.tone} icon={Icon}>
                    {mutasi.jenis_label}
                </StatusPill>
            </td>
            <td className="px-3 py-3 align-middle text-xs font-medium whitespace-nowrap">
                {mutasi.sumber_label}
            </td>
            <td className="px-3 py-3 align-middle">
                <p className="text-xs font-semibold text-foreground">
                    {namaItem(mutasi)}
                </p>
                {mutasi.order && (
                    <p className="text-[10px] text-muted-foreground">
                        {mutasi.order.kode}
                    </p>
                )}
            </td>
            <td className="px-3 py-3 align-middle text-xs font-bold whitespace-nowrap tabular-nums">
                <span className={gaya.teks}>{jumlahMutasi(mutasi)}</span>
            </td>
            <td className="px-3 py-3 align-middle text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                {mutasi.harga_satuan !== null
                    ? formatRupiah(Math.round(mutasi.harga_satuan))
                    : '-'}
            </td>
            <td className="px-3 py-3 align-middle text-xs whitespace-nowrap text-muted-foreground">
                {mutasi.user?.name ?? '-'}
            </td>
        </tr>
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

    const jumlahFilterAktif = [jenis, sumber, dari, sampai].filter(
        Boolean,
    ).length;

    const terapkanFilter = (event: FormEvent) => {
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

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-1.5 text-center">
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        Riwayat Mutasi Stok
                    </h1>
                    <p className="mx-auto max-w-2xl text-[12px] leading-relaxed text-muted-foreground sm:text-sm">
                        Lacak setiap perubahan stok bahan baku dan porsi menu,
                        mulai dari pembelian sampai pembayaran.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {kartuStats.map((item) => (
                        <Card
                            key={item.label}
                            className="relative overflow-hidden rounded-2xl border-border/70 bg-card p-4 shadow-sm"
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

                <form
                    onSubmit={terapkanFilter}
                    className="overflow-hidden rounded-2xl border border-emerald-100/70 bg-card shadow-sm dark:border-emerald-900/40"
                >
                    <div className="flex flex-col gap-2 border-b border-border/60 bg-gradient-to-r from-emerald-50/70 via-emerald-50/25 to-transparent px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:from-emerald-950/25 dark:via-emerald-950/10">
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/15 dark:text-emerald-300">
                                <Filter className="size-4" />
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Filter riwayat
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Sesuaikan jenis, sumber, dan tanggal mutasi.
                                </p>
                            </div>
                        </div>
                        {jumlahFilterAktif > 0 && (
                            <span className="inline-flex w-fit rounded-full border border-emerald-200/80 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                                {jumlahFilterAktif} filter aktif
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-end">
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
                                        setSumber(
                                            value === 'semua' ? '' : value,
                                        )
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
                                    max={sampai || undefined}
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
                                    min={dari || undefined}
                                    onChange={(event) =>
                                        setSampai(event.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:flex">
                            <Button
                                type="submit"
                                className="h-10 gap-2 rounded-xl bg-emerald-600 px-5 font-semibold text-white shadow-sm hover:bg-emerald-700"
                            >
                                <Filter className="size-4" />
                                Terapkan
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetFilter}
                                disabled={jumlahFilterAktif === 0}
                                className="h-10 gap-2 rounded-xl"
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </form>

                <AdminTableCard
                    title="Pergerakan Stok"
                    description={`Menampilkan ${movements.length} dari ${stats.jumlah} catatan (maksimal 200 data terbaru).`}
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
                            {jumlahFilterAktif > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={resetFilter}
                                    className="mt-2 gap-2 rounded-xl"
                                >
                                    <RotateCcw className="size-3.5" />
                                    Reset filter
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <table className="hidden w-full min-w-[900px] border-collapse text-center text-sm lg:table">
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
                                        <BarisTabel
                                            key={mutasi.id}
                                            mutasi={mutasi}
                                        />
                                    ))}
                                </tbody>
                            </table>

                            <div className="divide-y divide-border/60 lg:hidden">
                                {movements.map((mutasi) => (
                                    <KartuMutasi
                                        key={mutasi.id}
                                        mutasi={mutasi}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </AdminTableCard>
            </div>
        </>
    );
}

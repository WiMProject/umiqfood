import { Head, router, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    LoaderCircle,
    Pencil,
    Plus,
    RotateCcw,
    Save,
    Trash2,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

import {
    AdminTableCard,
    StatusPill,
    TableAction,
    TableHead,
} from '@/components/admin-table';
import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Pengeluaran {
    id: number;
    tanggal: string;
    kategori: string;
    deskripsi: string | null;
    jumlah: number;
    jumlah_format: string;
    bahan_baku_id: number | null;
    qty: number | null;
    harga_satuan: number | null;
    bahan_baku?: { id: number; nama: string; satuan: string } | null;
}

interface BahanBaku {
    id: number;
    nama: string;
    satuan: string;
    stok: number;
    harga_beli: number;
}

interface KategoriOpsi {
    value: string;
    label: string;
}

interface Props {
    pengeluarans: Pengeluaran[];
    bahanBakus: BahanBaku[];
    kategoris: KategoriOpsi[];
    filters: { kategori: string; dari: string; sampai: string };
    stats: { total: number; jumlah: number; bahan: number };
}

const KATEGORI_BAHAN = 'bahan_baku';

function formatRupiah(value: number): string {
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
}

function formatTanggal(value: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
}

function tanggalHariIni(): string {
    return new Date().toLocaleDateString('en-CA');
}

export default function AdminPengeluaranIndex({
    pengeluarans,
    bahanBakus,
    kategoris,
    filters,
    stats,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState<Pengeluaran | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Pengeluaran | null>(null);
    const [filterKategori, setFilterKategori] = useState(filters.kategori);
    const [dari, setDari] = useState(filters.dari);
    const [sampai, setSampai] = useState(filters.sampai);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            tanggal: tanggalHariIni(),
            kategori: KATEGORI_BAHAN,
            deskripsi: '',
            jumlah: '' as string | number,
            bahan_baku_id: '' as string | number,
            qty: '' as string | number,
            harga_satuan: '' as string | number,
        });

    const isBahan = data.kategori === KATEGORI_BAHAN;

    const bahanTerpilih = bahanBakus.find(
        (bahan) => String(bahan.id) === String(data.bahan_baku_id),
    );

    const totalBeli = Math.round(
        Number(data.qty || 0) * Number(data.harga_satuan || 0),
    );

    const labelKategori = (kategori: string): string =>
        kategoris.find((item) => item.value === kategori)?.label ?? kategori;

    const bukaTambah = () => {
        setEditing(null);
        reset();
        clearErrors();
        setData({
            tanggal: tanggalHariIni(),
            kategori: KATEGORI_BAHAN,
            deskripsi: '',
            jumlah: '',
            bahan_baku_id: '',
            qty: '',
            harga_satuan: '',
        });
        setIsOpen(true);
    };

    const bukaEdit = (item: Pengeluaran) => {
        setEditing(item);
        setData({
            tanggal: item.tanggal,
            kategori: item.kategori,
            deskripsi: item.deskripsi ?? '',
            jumlah: item.jumlah,
            bahan_baku_id: item.bahan_baku_id ?? '',
            qty: item.qty ?? '',
            harga_satuan: item.harga_satuan ?? '',
        });
        clearErrors();
        setIsOpen(true);
    };

    const tutupDialog = () => {
        setIsOpen(false);
        setEditing(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => tutupDialog(),
        };

        if (editing) {
            put(`/pengeluaran/${editing.id}`, options);

            return;
        }

        post('/pengeluaran', options);
    };

    const hapus = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(`/pengeluaran/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const terapkanFilter = (event: React.FormEvent) => {
        event.preventDefault();

        router.get(
            '/pengeluaran',
            {
                kategori: filterKategori,
                dari,
                sampai,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const resetFilter = () => {
        setFilterKategori('');
        setDari('');
        setSampai('');
        router.get(
            '/pengeluaran',
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const kartuStats = [
        {
            label: 'Total pengeluaran',
            value: formatRupiah(stats.total),
            hint: `${stats.jumlah} transaksi pada filter ini`,
            icon: Wallet,
            warna: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
        },
        {
            label: 'Beli bahan baku',
            value: formatRupiah(stats.bahan),
            hint: 'Otomatis menambah stok',
            icon: Plus,
            warna: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
        },
        {
            label: 'Biaya lainnya',
            value: formatRupiah(stats.total - stats.bahan),
            hint: 'Operasional, gaji, listrik, dll.',
            icon: CalendarDays,
            warna: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
        },
    ];

    return (
        <>
            <Head title="Pengeluaran" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-600 uppercase dark:text-emerald-400">
                            Keuangan
                        </p>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
                            Catatan pengeluaran
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Catat uang keluar, termasuk pembelian bahan yang
                            langsung menambah stok inventori.
                        </p>
                    </div>
                    <Button
                        onClick={bukaTambah}
                        className="gap-2 self-start bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Tambah pengeluaran
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                            <p className="mt-2 text-lg font-extrabold tracking-tight">
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

                <form
                    onSubmit={terapkanFilter}
                    className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm lg:flex-row lg:items-end"
                >
                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="grid gap-1.5">
                            <Label htmlFor="filter-kategori">Kategori</Label>
                            <select
                                id="filter-kategori"
                                value={filterKategori}
                                onChange={(event) =>
                                    setFilterKategori(event.target.value)
                                }
                                className="h-10 rounded-xl border border-input bg-card px-3 text-sm"
                            >
                                <option value="">Semua kategori</option>
                                {kategoris.map((kategori) => (
                                    <option
                                        key={kategori.value}
                                        value={kategori.value}
                                    >
                                        {kategori.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="filter-dari">Dari tanggal</Label>
                            <Input
                                id="filter-dari"
                                type="date"
                                value={dari}
                                onChange={(event) =>
                                    setDari(event.target.value)
                                }
                                className="h-10 rounded-xl bg-card"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="filter-sampai">
                                Sampai tanggal
                            </Label>
                            <Input
                                id="filter-sampai"
                                type="date"
                                value={sampai}
                                onChange={(event) =>
                                    setSampai(event.target.value)
                                }
                                className="h-10 rounded-xl bg-card"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            className="h-10 gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            Terapkan
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetFilter}
                            className="h-10 gap-2"
                        >
                            <RotateCcw className="size-4" />
                            Reset
                        </Button>
                    </div>
                </form>

                <AdminTableCard
                    title="Riwayat pengeluaran"
                    description="Semua uang keluar pada rentang tanggal yang dipilih."
                    count={pengeluarans.length}
                    icon={Wallet}
                    className="hidden xl:block"
                >
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-border/70 bg-muted/30">
                            <tr>
                                <TableHead className="w-[16%]">
                                    Tanggal
                                </TableHead>
                                <TableHead className="w-[20%]">
                                    Kategori
                                </TableHead>
                                <TableHead className="w-[40%]">
                                    Keterangan
                                </TableHead>
                                <TableHead align="right" className="w-[14%]">
                                    Jumlah
                                </TableHead>
                                <TableHead align="center" className="w-[10%]">
                                    Aksi
                                </TableHead>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {pengeluarans.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-14 text-center"
                                    >
                                        <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                                            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                                                <Wallet className="size-5" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">
                                                Belum ada pengeluaran
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Catat biaya pertama untuk mulai
                                                memantau laba rugi.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pengeluarans.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10"
                                    >
                                        <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                                            {formatTanggal(item.tanggal)}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <StatusPill
                                                tone={
                                                    item.kategori ===
                                                    KATEGORI_BAHAN
                                                        ? 'emerald'
                                                        : 'slate'
                                                }
                                            >
                                                {labelKategori(item.kategori)}
                                            </StatusPill>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="font-medium text-foreground">
                                                {item.deskripsi ||
                                                    item.bahan_baku?.nama ||
                                                    '-'}
                                            </p>
                                            {item.qty !== null &&
                                                item.harga_satuan !== null && (
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {item.qty}{' '}
                                                        {
                                                            item.bahan_baku
                                                                ?.satuan
                                                        }{' '}
                                                        ×{' '}
                                                        {formatRupiah(
                                                            item.harga_satuan,
                                                        )}
                                                    </p>
                                                )}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-semibold text-foreground tabular-nums">
                                            {item.jumlah_format}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <TableAction
                                                    label={`Edit pengeluaran ${item.id}`}
                                                    icon={Pencil}
                                                    onClick={() =>
                                                        bukaEdit(item)
                                                    }
                                                />
                                                <TableAction
                                                    label={`Hapus pengeluaran ${item.id}`}
                                                    icon={Trash2}
                                                    tone="rose"
                                                    onClick={() =>
                                                        setDeleteTarget(item)
                                                    }
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </AdminTableCard>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:hidden">
                    {pengeluarans.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
                            Belum ada pengeluaran. Catat biaya pertama untuk
                            mulai memantau laba rugi.
                        </div>
                    ) : (
                        pengeluarans.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-foreground">
                                            {item.deskripsi ||
                                                item.bahan_baku?.nama ||
                                                '-'}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {formatTanggal(item.tanggal)}
                                        </p>
                                    </div>
                                    <StatusPill
                                        tone={
                                            item.kategori === KATEGORI_BAHAN
                                                ? 'emerald'
                                                : 'slate'
                                        }
                                    >
                                        {labelKategori(item.kategori)}
                                    </StatusPill>
                                </div>
                                <p className="mt-3 text-lg font-extrabold text-foreground">
                                    {item.jumlah_format}
                                </p>
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => bukaEdit(item)}
                                        className="h-9 justify-center gap-1.5 rounded-lg px-2 text-xs text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                                    >
                                        <Pencil className="size-3.5" /> Edit
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDeleteTarget(item)}
                                        className="h-9 justify-center gap-1.5 rounded-lg border-rose-200/80 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                    >
                                        <Trash2 className="size-3.5" /> Hapus
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        tutupDialog();
                    }
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editing
                                ? 'Edit pengeluaran'
                                : 'Tambah pengeluaran'}
                        </DialogTitle>
                        <DialogDescription>
                            Pembelian bahan otomatis menambah stok dan
                            memperbarui harga beli acuan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="pengeluaran-tanggal">
                                    Tanggal
                                </Label>
                                <Input
                                    id="pengeluaran-tanggal"
                                    type="date"
                                    value={data.tanggal}
                                    onChange={(event) =>
                                        setData('tanggal', event.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.tanggal} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="pengeluaran-kategori">
                                    Kategori
                                </Label>
                                <select
                                    id="pengeluaran-kategori"
                                    value={data.kategori}
                                    onChange={(event) =>
                                        setData('kategori', event.target.value)
                                    }
                                    className="h-10 rounded-xl border border-input bg-card px-3 text-sm"
                                    required
                                >
                                    {kategoris.map((kategori) => (
                                        <option
                                            key={kategori.value}
                                            value={kategori.value}
                                        >
                                            {kategori.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.kategori} />
                            </div>
                        </div>

                        {isBahan ? (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="pengeluaran-bahan">
                                        Bahan baku
                                    </Label>
                                    <select
                                        id="pengeluaran-bahan"
                                        value={data.bahan_baku_id}
                                        onChange={(event) =>
                                            setData(
                                                'bahan_baku_id',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 rounded-xl border border-input bg-card px-3 text-sm"
                                        required
                                    >
                                        <option value="">
                                            Pilih bahan baku
                                        </option>
                                        {bahanBakus.map((bahan) => (
                                            <option
                                                key={bahan.id}
                                                value={bahan.id}
                                            >
                                                {bahan.nama} (stok {bahan.stok}{' '}
                                                {bahan.satuan})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={errors.bahan_baku_id}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="pengeluaran-qty">
                                            Jumlah beli (
                                            {bahanTerpilih?.satuan ?? 'satuan'})
                                        </Label>
                                        <Input
                                            id="pengeluaran-qty"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={data.qty}
                                            onChange={(event) =>
                                                setData(
                                                    'qty',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="1000"
                                            required
                                        />
                                        <InputError message={errors.qty} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="pengeluaran-harga">
                                            Harga per satuan
                                        </Label>
                                        <Input
                                            id="pengeluaran-harga"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.harga_satuan}
                                            onChange={(event) =>
                                                setData(
                                                    'harga_satuan',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="12000"
                                            required
                                        />
                                        <InputError
                                            message={errors.harga_satuan}
                                        />
                                    </div>
                                </div>
                                <div className="rounded-xl bg-emerald-50/60 p-3 dark:bg-emerald-950/20">
                                    <p className="text-xs text-muted-foreground">
                                        Total pembelian
                                    </p>
                                    <p className="mt-0.5 text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                                        {formatRupiah(totalBeli)}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="grid gap-2">
                                <Label htmlFor="pengeluaran-jumlah">
                                    Jumlah (Rp)
                                </Label>
                                <Input
                                    id="pengeluaran-jumlah"
                                    type="number"
                                    step="1"
                                    min="0"
                                    value={data.jumlah}
                                    onChange={(event) =>
                                        setData('jumlah', event.target.value)
                                    }
                                    placeholder="150000"
                                    required
                                />
                                <InputError message={errors.jumlah} />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="pengeluaran-deskripsi">
                                Keterangan (opsional)
                            </Label>
                            <Input
                                id="pengeluaran-deskripsi"
                                value={data.deskripsi}
                                onChange={(event) =>
                                    setData('deskripsi', event.target.value)
                                }
                                placeholder="Contoh: Beli gas 3 kg"
                                maxLength={150}
                            />
                            <InputError message={errors.deskripsi} />
                        </div>

                        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={tutupDialog}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                {processing ? (
                                    <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                    <Save className="size-4" />
                                )}
                                {editing
                                    ? 'Simpan perubahan'
                                    : 'Simpan pengeluaran'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTarget(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Hapus pengeluaran ini?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Catatan akan dihapus permanen. Jika ini pembelian
                            bahan, stok yang ditambahkan akan dikurangi kembali
                            (jika masih tersedia).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Tidak</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={hapus}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Ya, hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

AdminPengeluaranIndex.layout = {
    breadcrumbs: [{ title: 'Pengeluaran', href: '/pengeluaran' }],
};

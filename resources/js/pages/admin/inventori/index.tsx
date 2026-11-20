import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Boxes,
    PackageCheck,
    PackageX,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

import {
    AdminTableCard,
    StatusPill,
    TableAction,
    TableHead,
} from '@/components/admin-table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BahanBaku {
    id: number;
    nama: string;
    satuan: string;
    stok: number;
    stok_minimum: number;
    stok_menipis: boolean;
    resep_items_count: number;
}

interface Props {
    bahanBakus: BahanBaku[];
    stats: { total: number; menipis: number; habis: number };
}

const satuanUmum = ['gram', 'ml', 'pcs', 'sdm', 'sdt', 'kg', 'liter'];

export default function InventoriIndex({ bahanBakus, stats }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<BahanBaku | null>(null);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        nama: '',
        satuan: 'gram',
        stok: '' as string | number,
        stok_minimum: '' as string | number,
    });

    const openCreateModal = () => {
        setEditingItem(null);
        reset();
        setData({ nama: '', satuan: 'gram', stok: '', stok_minimum: '' });
        setIsOpen(true);
    };

    const openEditModal = (item: BahanBaku) => {
        setEditingItem(item);
        setData({
            nama: item.nama,
            satuan: item.satuan,
            stok: item.stok,
            stok_minimum: item.stok_minimum,
        });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingItem) {
            put(`/inventori/${editingItem.id}`, {
                onSuccess: () => setIsOpen(false),
            });
        } else {
            post('/inventori', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus bahan baku ini?')) {
            router.delete(`/inventori/${id}`);
        }
    };

    const formatAngka = (nilai: number) =>
        new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(
            nilai,
        );

    return (
        <>
            <Head title="Inventori Bahan Baku" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Inventori Bahan Baku 📦
                        </h1>
                        <p className="text-sm text-gray-500">
                            Catat pasokan bahan mentah yang dipakai untuk
                            memasak menu.
                        </p>
                    </div>
                    <Button
                        onClick={openCreateModal}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah Bahan
                    </Button>
                </div>

                {/* Ringkasan */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {[
                        {
                            title: 'Total Bahan',
                            value: stats.total,
                            icon: Boxes,
                            warna: 'bg-emerald-50 text-emerald-600',
                        },
                        {
                            title: 'Stok Menipis',
                            value: stats.menipis,
                            icon: AlertTriangle,
                            warna: 'bg-amber-50 text-amber-600',
                        },
                        {
                            title: 'Stok Habis',
                            value: stats.habis,
                            icon: PackageX,
                            warna: 'bg-red-50 text-red-600',
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-neutral-900"
                        >
                            <div>
                                <p className="text-sm text-gray-500">
                                    {item.title}
                                </p>
                                <p className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
                                    {item.value}
                                </p>
                            </div>
                            <div
                                className={`flex h-11 w-11 items-center justify-center rounded-full ${item.warna}`}
                            >
                                <item.icon className="h-5 w-5" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabel Bahan Baku (layar besar) */}
                <AdminTableCard
                    title="Daftar Bahan Baku"
                    description="Pantau stok, batas minimum, dan pemakaian resep."
                    count={bahanBakus.length}
                    icon={Boxes}
                    className="hidden xl:block"
                >
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-border/70 bg-muted/30">
                            <tr>
                                <TableHead className="min-w-48">
                                    Bahan
                                </TableHead>
                                <TableHead align="right">Stok</TableHead>
                                <TableHead align="right">
                                    Stok Minimum
                                </TableHead>
                                <TableHead align="right">
                                    Dipakai di Resep
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead align="right">Aksi</TableHead>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {bahanBakus.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-14 text-center"
                                    >
                                        <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                                            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                                                <Boxes className="size-5" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">
                                                Belum ada bahan baku
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Klik “Tambah Bahan” untuk mulai
                                                mencatat inventori.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bahanBakus.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10"
                                    >
                                        <td className="px-4 py-3.5 font-semibold text-foreground">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                                    <Boxes className="size-4" />
                                                </div>
                                                {item.nama}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-semibold text-foreground tabular-nums">
                                            {formatAngka(item.stok)}{' '}
                                            <span className="text-xs font-normal text-muted-foreground">
                                                {item.satuan}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right text-muted-foreground tabular-nums">
                                            {formatAngka(item.stok_minimum)}{' '}
                                            <span className="text-xs">
                                                {item.satuan}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <StatusPill tone="slate">
                                                {item.resep_items_count} menu
                                            </StatusPill>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {item.stok <= 0 ? (
                                                <StatusPill tone="rose">
                                                    Habis
                                                </StatusPill>
                                            ) : item.stok_menipis ? (
                                                <StatusPill
                                                    tone="amber"
                                                    icon={AlertTriangle}
                                                >
                                                    Menipis
                                                </StatusPill>
                                            ) : (
                                                <StatusPill
                                                    tone="emerald"
                                                    icon={PackageCheck}
                                                >
                                                    Aman
                                                </StatusPill>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <TableAction
                                                    label={`Edit ${item.nama}`}
                                                    icon={Pencil}
                                                    onClick={() =>
                                                        openEditModal(item)
                                                    }
                                                />
                                                <TableAction
                                                    label={`Hapus ${item.nama}`}
                                                    icon={Trash2}
                                                    tone="rose"
                                                    onClick={() =>
                                                        handleDelete(item.id)
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

                {/* Kartu Bahan Baku (mobile & tablet) */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:hidden">
                    {bahanBakus.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
                            Belum ada bahan baku. Klik “Tambah Bahan” untuk
                            mulai mencatat inventori.
                        </div>
                    ) : (
                        bahanBakus.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-foreground">
                                            {item.nama}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Dipakai di {item.resep_items_count}{' '}
                                            menu
                                        </p>
                                    </div>
                                    {item.stok <= 0 ? (
                                        <StatusPill tone="rose">
                                            Habis
                                        </StatusPill>
                                    ) : item.stok_menipis ? (
                                        <StatusPill
                                            tone="amber"
                                            icon={AlertTriangle}
                                        >
                                            Menipis
                                        </StatusPill>
                                    ) : (
                                        <StatusPill
                                            tone="emerald"
                                            icon={PackageCheck}
                                        >
                                            Aman
                                        </StatusPill>
                                    )}
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-emerald-50/40 p-2.5 dark:bg-emerald-950/10">
                                    <div>
                                        <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            Stok
                                        </p>
                                        <p className="mt-0.5 font-semibold text-foreground tabular-nums">
                                            {formatAngka(item.stok)}{' '}
                                            <span className="text-xs font-normal text-muted-foreground">
                                                {item.satuan}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            Stok minimum
                                        </p>
                                        <p className="mt-0.5 font-semibold text-foreground tabular-nums">
                                            {formatAngka(item.stok_minimum)}{' '}
                                            <span className="text-xs font-normal text-muted-foreground">
                                                {item.satuan}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditModal(item)}
                                        title={`Edit ${item.nama}`}
                                        aria-label={`Edit ${item.nama}`}
                                        className="h-9 justify-center gap-1.5 rounded-lg px-2 text-xs text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                                    >
                                        <Pencil className="size-3.5" /> Edit
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(item.id)}
                                        title={`Hapus ${item.nama}`}
                                        aria-label={`Hapus ${item.nama}`}
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

            {/* Modal Tambah / Edit */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem
                                ? 'Edit Bahan Baku'
                                : 'Tambah Bahan Baku Baru'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="nama">Nama Bahan</Label>
                            <Input
                                id="nama"
                                value={data.nama}
                                onChange={(e) =>
                                    setData('nama', e.target.value)
                                }
                                placeholder="Contoh: Beras, Ayam, Telur"
                                required
                            />
                            {errors.nama && (
                                <span className="text-xs text-red-500">
                                    {errors.nama}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="satuan">Satuan</Label>
                            <select
                                id="satuan"
                                value={data.satuan}
                                onChange={(e) =>
                                    setData('satuan', e.target.value)
                                }
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-ring focus:outline-none"
                                required
                            >
                                {satuanUmum.map((satuan) => (
                                    <option key={satuan} value={satuan}>
                                        {satuan}
                                    </option>
                                ))}
                            </select>
                            {errors.satuan && (
                                <span className="text-xs text-red-500">
                                    {errors.satuan}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="stok">Stok Saat Ini</Label>
                                <Input
                                    id="stok"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.stok}
                                    onChange={(e) =>
                                        setData('stok', e.target.value)
                                    }
                                    placeholder="1000"
                                    required
                                />
                                {errors.stok && (
                                    <span className="text-xs text-red-500">
                                        {errors.stok}
                                    </span>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="stok_minimum">
                                    Stok Minimum
                                </Label>
                                <Input
                                    id="stok_minimum"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.stok_minimum}
                                    onChange={(e) =>
                                        setData('stok_minimum', e.target.value)
                                    }
                                    placeholder="100"
                                    required
                                />
                                {errors.stok_minimum && (
                                    <span className="text-xs text-red-500">
                                        {errors.stok_minimum}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                {processing
                                    ? 'Menyimpan...'
                                    : editingItem
                                      ? 'Simpan Perubahan'
                                      : 'Tambah Bahan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

InventoriIndex.layout = {
    breadcrumbs: [{ title: 'Inventori', href: '/inventori' }],
};

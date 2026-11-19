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

    const { data, setData, post, reset, errors, processing } = useForm({
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
            post(`/inventori/${editingItem.id}`, {
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

                {/* Tabel Bahan Baku (layar sedang ke atas) */}
                <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block dark:border-gray-800 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-neutral-800/50 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4">Bahan</th>
                                    <th className="px-6 py-4">Stok</th>
                                    <th className="px-6 py-4">Stok Minimum</th>
                                    <th className="px-6 py-4">
                                        Dipakai di Resep
                                    </th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {bahanBakus.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-12 text-center text-gray-400"
                                        >
                                            Belum ada bahan baku. Klik "Tambah
                                            Bahan" untuk mulai mencatat
                                            inventori.
                                        </td>
                                    </tr>
                                ) : (
                                    bahanBakus.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="transition hover:bg-gray-50/60 dark:hover:bg-neutral-800/30"
                                        >
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                {item.nama}
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                {formatAngka(item.stok)}{' '}
                                                <span className="text-xs text-gray-400">
                                                    {item.satuan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {formatAngka(item.stok_minimum)}{' '}
                                                <span className="text-xs text-gray-400">
                                                    {item.satuan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                    {item.resep_items_count}{' '}
                                                    menu
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.stok <= 0 ? (
                                                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                                                        Habis
                                                    </span>
                                                ) : item.stok_menipis ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                                        <AlertTriangle className="h-3 w-3" />{' '}
                                                        Menipis
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                                                        <PackageCheck className="h-3 w-3" />{' '}
                                                        Aman
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            openEditModal(item)
                                                        }
                                                        className="h-8 px-2 text-gray-600"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id,
                                                            )
                                                        }
                                                        className="h-8 border-red-200 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Kartu Bahan Baku (mobile) */}
                <div className="space-y-3 md:hidden">
                    {bahanBakus.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-neutral-900">
                            Belum ada bahan baku. Klik "Tambah Bahan" untuk
                            mulai mencatat inventori.
                        </div>
                    ) : (
                        bahanBakus.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-neutral-900"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-gray-900 dark:text-white">
                                            {item.nama}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-400">
                                            Dipakai di {item.resep_items_count}{' '}
                                            menu
                                        </p>
                                    </div>
                                    {item.stok <= 0 ? (
                                        <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                                            Habis
                                        </span>
                                    ) : item.stok_menipis ? (
                                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                            <AlertTriangle className="h-3 w-3" />{' '}
                                            Menipis
                                        </span>
                                    ) : (
                                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                                            <PackageCheck className="h-3 w-3" />{' '}
                                            Aman
                                        </span>
                                    )}
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-2.5 dark:bg-neutral-800/50">
                                    <div>
                                        <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                            Stok
                                        </p>
                                        <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                                            {formatAngka(item.stok)}{' '}
                                            <span className="text-xs font-normal text-gray-400">
                                                {item.satuan}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                            Stok minimum
                                        </p>
                                        <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                                            {formatAngka(item.stok_minimum)}{' '}
                                            <span className="text-xs font-normal text-gray-400">
                                                {item.satuan}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditModal(item)}
                                        className="h-9 justify-center gap-1 px-2 text-xs text-gray-600 dark:text-gray-300"
                                    >
                                        <Pencil className="h-3.5 w-3.5" /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(item.id)}
                                        className="h-9 justify-center gap-1 border-red-200 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" /> Hapus
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

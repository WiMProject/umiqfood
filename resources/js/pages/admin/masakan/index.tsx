import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Utensils } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Kategori {
    id: number;
    nama: string;
    icon?: string;
}

interface Masakan {
    id: number;
    nama: string;
    deskripsi: string | null;
    harga: number;
    harga_format: string;
    foto: string | null;
    foto_url: string | null;
    tersedia: boolean;
    kategori_id: number;
    kategori?: Kategori;
}

interface Props {
    masakans: Masakan[];
    kategoris: Kategori[];
}

export default function MasakanIndex({ masakans, kategoris }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Masakan | null>(null);

    const { data, setData, post, reset, errors, processing } = useForm<{
        nama: string;
        deskripsi: string;
        harga: string | number;
        kategori_id: string | number;
        tersedia: boolean;
        foto: File | null;
        _method?: string;
    }>({
        nama: '',
        deskripsi: '',
        harga: '',
        kategori_id: kategoris[0]?.id || '',
        tersedia: true,
        foto: null,
    });

    const openCreateModal = () => {
        setEditingItem(null);
        reset();
        setData({
            nama: '',
            deskripsi: '',
            harga: '',
            kategori_id: kategoris[0]?.id || '',
            tersedia: true,
            foto: null,
        });
        setIsOpen(true);
    };

    const openEditModal = (item: Masakan) => {
        setEditingItem(item);
        setData({
            nama: item.nama,
            deskripsi: item.deskripsi || '',
            harga: item.harga,
            kategori_id: item.kategori_id,
            tersedia: item.tersedia,
            foto: null,
            _method: 'PUT',
        });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingItem) {
            post(`/masakan/${editingItem.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        } else {
            post('/masakan', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus menu masakan ini?')) {
            router.delete(`/masakan/${id}`);
        }
    };

    return (
        <>
            <Head title="Kelola Menu Masakan" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header Title + Button Tambah */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Kelola Menu Masakan 🍱
                        </h1>
                        <p className="text-sm text-gray-500">
                            Tambah, perbarui, dan atur ketersediaan menu warung Anda.
                        </p>
                    </div>
                    <Button onClick={openCreateModal} className="bg-orange-600 hover:bg-orange-700 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Tambah Masakan
                    </Button>
                </div>

                {/* Tabel Daftar Masakan */}
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-neutral-800/50 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="px-6 py-4">Menu</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Harga</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {masakans.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-400">
                                            Belum ada menu masakan. Silakan klik tombol "Tambah Masakan".
                                        </td>
                                    </tr>
                                ) : (
                                    masakans.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {item.foto_url ? (
                                                        <img
                                                            src={item.foto_url}
                                                            alt={item.nama}
                                                            className="w-12 h-12 object-cover rounded-lg border"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/40 text-orange-600 rounded-lg flex items-center justify-center font-bold">
                                                            <Utensils className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold text-gray-900 dark:text-white">
                                                            {item.nama}
                                                        </div>
                                                        <div className="text-xs text-gray-400 max-w-xs truncate">
                                                            {item.deskripsi || 'Tidak ada deskripsi'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                                    {item.kategori?.icon} {item.kategori?.nama || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-orange-600">
                                                {item.harga_format}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${item.tersedia
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                                        }`}
                                                >
                                                    {item.tersedia ? 'Tersedia' : 'Habis'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditModal(item)}
                                                        className="h-8 px-2 text-gray-600"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(item.id)}
                                                        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
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
            </div>

            {/* Modal Dialog Form Tambah / Edit */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit Menu Masakan' : 'Tambah Menu Masakan Baru'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="nama">Nama Masakan</Label>
                            <Input
                                id="nama"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                placeholder="Contoh: Nasi Goreng Spesial"
                                required
                            />
                            {errors.nama && <span className="text-xs text-red-500">{errors.nama}</span>}
                        </div>

                        <div>
                            <Label htmlFor="kategori">Kategori</Label>
                            <select
                                id="kategori"
                                value={data.kategori_id}
                                onChange={(e) => setData('kategori_id', e.target.value)}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                required
                            >
                                {kategoris.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.nama}
                                    </option>
                                ))}
                            </select>
                            {errors.kategori_id && (
                                <span className="text-xs text-red-500">{errors.kategori_id}</span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="harga">Harga (Rp)</Label>
                            <Input
                                id="harga"
                                type="number"
                                value={data.harga}
                                onChange={(e) => setData('harga', e.target.value)}
                                placeholder="15000"
                                required
                            />
                            {errors.harga && <span className="text-xs text-red-500">{errors.harga}</span>}
                        </div>

                        <div>
                            <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
                            <Input
                                id="deskripsi"
                                value={data.deskripsi}
                                onChange={(e) => setData('deskripsi', e.target.value)}
                                placeholder="Keterangan bahan / rasa..."
                            />
                            {errors.deskripsi && (
                                <span className="text-xs text-red-500">{errors.deskripsi}</span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="foto">Foto Masakan</Label>
                            <Input
                                id="foto"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('foto', e.target.files ? e.target.files[0] : null)}
                            />
                            {errors.foto && <span className="text-xs text-red-500">{errors.foto}</span>}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="tersedia"
                                checked={data.tersedia}
                                onChange={(e) => setData('tersedia', e.target.checked)}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                            />
                            <Label htmlFor="tersedia" className="cursor-pointer">
                                Status Masakan Tersedia (Bisa dipesan)
                            </Label>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                {processing ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Menu'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

MasakanIndex.layout = {
    breadcrumbs: [{ title: 'Menu Masakan', href: '/masakan' }],
};
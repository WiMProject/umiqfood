import { Head, router, useForm } from '@inertiajs/react';
import {
    ChefHat,
    CheckCircle2,
    Pencil,
    Plus,
    Trash2,
    Utensils,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

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

interface Kategori {
    id: number;
    nama: string;
    icon?: string;
}

interface BahanBaku {
    id: number;
    nama: string;
    satuan: string;
    stok: number;
}

interface ResepItem {
    id: number;
    bahan_baku_id: number;
    jumlah: number;
    bahan_baku?: BahanBaku;
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
    jumlah_porsi: number;
    max_porsi: number | null;
    kategori_id: number;
    kategori?: Kategori;
    resep_items?: ResepItem[];
}

interface Props {
    masakans: Masakan[];
    kategoris: Kategori[];
    bahanBakus: BahanBaku[];
}

interface ResepRow {
    bahan_baku_id: string | number;
    jumlah: string | number;
}

export default function MasakanIndex({
    masakans,
    kategoris,
    bahanBakus,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Masakan | null>(null);

    // Dialog masak
    const [masakItem, setMasakItem] = useState<Masakan | null>(null);
    const [masakPorsi, setMasakPorsi] = useState<string | number>(1);

    const { data, setData, post, reset, errors, processing } = useForm<{
        nama: string;
        deskripsi: string;
        harga: string | number;
        kategori_id: string | number;
        tersedia: boolean;
        jumlah_porsi: string | number;
        foto: File | null;
        resep: ResepRow[];
        _method?: string;
    }>({
        nama: '',
        deskripsi: '',
        harga: '',
        kategori_id: kategoris[0]?.id || '',
        tersedia: true,
        jumlah_porsi: 0,
        foto: null,
        resep: [],
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
            jumlah_porsi: 0,
            foto: null,
            resep: [],
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
            jumlah_porsi: item.jumlah_porsi,
            foto: null,
            resep: (item.resep_items || []).map((row) => ({
                bahan_baku_id: row.bahan_baku_id,
                jumlah: row.jumlah,
            })),
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

    const addResepRow = () => {
        const terpakai = new Set(
            data.resep.map((r) => Number(r.bahan_baku_id)),
        );
        const tersedia = bahanBakus.find((b) => !terpakai.has(b.id));

        if (!tersedia) {
            return;
        }

        setData('resep', [
            ...data.resep,
            { bahan_baku_id: tersedia.id, jumlah: '' },
        ]);
    };

    const updateResepRow = (index: number, patch: Partial<ResepRow>) => {
        setData(
            'resep',
            data.resep.map((row, i) =>
                i === index ? { ...row, ...patch } : row,
            ),
        );
    };

    const removeResepRow = (index: number) => {
        setData(
            'resep',
            data.resep.filter((_, i) => i !== index),
        );
    };

    const openMasak = (item: Masakan) => {
        setMasakItem(item);
        setMasakPorsi(1);
    };

    const handleMasak = (e: React.FormEvent) => {
        e.preventDefault();
        if (!masakItem) {
            return;
        }

        router.post(
            `/masakan/${masakItem.id}/masak`,
            { jumlah: masakPorsi },
            {
                preserveScroll: true,
                onSuccess: () => setMasakItem(null),
            },
        );
    };

    // Preview kebutuhan bahan saat akan memasak
    const kebutuhan = useMemo(() => {
        if (!masakItem?.resep_items) {
            return [];
        }

        const porsi = Number(masakPorsi) || 0;

        return masakItem.resep_items.map((row) => {
            const butuh = row.jumlah * porsi;
            const stok = row.bahan_baku?.stok ?? 0;

            return {
                nama: row.bahan_baku?.nama || '-',
                satuan: row.bahan_baku?.satuan || '',
                jumlah: row.jumlah,
                butuh,
                stok,
                cukup: stok >= butuh,
            };
        });
    }, [masakItem, masakPorsi]);

    const semuaCukup = kebutuhan.length > 0 && kebutuhan.every((k) => k.cukup);
    const adaResep = (masakItem?.resep_items?.length ?? 0) > 0;

    const formatAngka = (nilai: number) =>
        new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(
            nilai,
        );

    return (
        <>
            <Head title="Kelola Menu Masakan" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                {/* Header Title + Button Tambah */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Kelola Menu Masakan 🍱
                        </h1>
                        <p className="text-sm text-gray-500">
                            Atur menu, resep bahan, dan jumlah porsi siap jual.
                        </p>
                    </div>
                    <Button
                        onClick={openCreateModal}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah Masakan
                    </Button>
                </div>

                {/* Tabel Daftar Masakan (layar besar) */}
                <AdminTableCard
                    title="Daftar Menu Masakan"
                    description="Harga, resep, dan ketersediaan setiap menu."
                    count={masakans.length}
                    icon={Utensils}
                    className="hidden xl:block"
                >
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-border/70 bg-muted/30">
                            <tr>
                                <TableHead className="min-w-56">Menu</TableHead>
                                <TableHead align="center">Kategori</TableHead>
                                <TableHead align="center">Harga</TableHead>
                                <TableHead align="center">Porsi Siap</TableHead>
                                <TableHead
                                    align="center"
                                    className="hidden 2xl:table-cell"
                                >
                                    Resep
                                </TableHead>
                                <TableHead align="center">Status</TableHead>
                                <TableHead align="center">Aksi</TableHead>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {masakans.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-14 text-center"
                                    >
                                        <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                                            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                                                <Utensils className="size-5" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">
                                                Belum ada menu masakan
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Klik “Tambah Masakan” untuk
                                                membuat menu pertama.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                masakans.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10"
                                    >
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                {item.foto_url ? (
                                                    <img
                                                        src={item.foto_url}
                                                        alt={item.nama}
                                                        className="size-11 shrink-0 rounded-xl border border-border/70 object-cover ring-2 ring-emerald-50 dark:ring-emerald-950/40"
                                                    />
                                                ) : (
                                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                                        <Utensils className="size-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-foreground">
                                                        {item.nama}
                                                    </div>
                                                    <div className="max-w-48 truncate text-xs text-muted-foreground">
                                                        {item.deskripsi ||
                                                            'Tidak ada deskripsi'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <StatusPill tone="slate">
                                                {item.kategori?.icon}{' '}
                                                {item.kategori?.nama || '-'}
                                            </StatusPill>
                                        </td>
                                        <td className="px-4 py-3.5 text-center font-semibold text-emerald-700 tabular-nums dark:text-emerald-300">
                                            {item.harga_format}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-semibold text-foreground tabular-nums">
                                                    {item.jumlah_porsi} porsi
                                                </span>
                                                {item.max_porsi !== null && (
                                                    <span className="text-xs text-muted-foreground">
                                                        maks. {item.max_porsi}{' '}
                                                        dari stok
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="hidden px-4 py-3.5 text-center 2xl:table-cell">
                                            <StatusPill tone="slate">
                                                {item.resep_items?.length || 0}{' '}
                                                bahan
                                            </StatusPill>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <StatusPill
                                                tone={
                                                    item.tersedia
                                                        ? 'emerald'
                                                        : 'rose'
                                                }
                                                icon={
                                                    item.tersedia
                                                        ? CheckCircle2
                                                        : XCircle
                                                }
                                            >
                                                {item.tersedia
                                                    ? 'Tersedia'
                                                    : 'Habis'}
                                            </StatusPill>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openMasak(item)
                                                    }
                                                    title={`Masak ${item.nama}`}
                                                    aria-label={`Masak ${item.nama}`}
                                                    className="h-8 gap-1.5 rounded-lg border-emerald-200 px-2.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                                                >
                                                    <ChefHat className="size-3.5" />
                                                    Masak
                                                </Button>
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

                {/* Kartu Daftar Masakan (mobile & tablet) */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:hidden">
                    {masakans.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
                            Belum ada menu masakan. Klik “Tambah Masakan” untuk
                            membuat menu pertama.
                        </div>
                    ) : (
                        masakans.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
                            >
                                <div className="flex items-start gap-3">
                                    {item.foto_url ? (
                                        <img
                                            src={item.foto_url}
                                            alt={item.nama}
                                            className="size-11 shrink-0 rounded-xl border border-border/70 object-cover ring-2 ring-emerald-50 dark:ring-emerald-950/40"
                                        />
                                    ) : (
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                            <Utensils className="size-5" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="truncate font-semibold text-foreground">
                                                {item.nama}
                                            </p>
                                            <StatusPill
                                                tone={
                                                    item.tersedia
                                                        ? 'emerald'
                                                        : 'rose'
                                                }
                                                icon={
                                                    item.tersedia
                                                        ? CheckCircle2
                                                        : XCircle
                                                }
                                            >
                                                {item.tersedia
                                                    ? 'Tersedia'
                                                    : 'Habis'}
                                            </StatusPill>
                                        </div>
                                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                            {item.deskripsi ||
                                                'Tidak ada deskripsi'}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            <StatusPill tone="slate">
                                                {item.kategori?.icon}{' '}
                                                {item.kategori?.nama || '-'}
                                            </StatusPill>
                                            <StatusPill tone="slate">
                                                {item.resep_items?.length || 0}{' '}
                                                bahan
                                            </StatusPill>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-emerald-50/40 p-2.5 dark:bg-emerald-950/10">
                                    <div>
                                        <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            Harga
                                        </p>
                                        <p className="mt-0.5 font-semibold text-emerald-700 tabular-nums dark:text-emerald-300">
                                            {item.harga_format}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            Porsi siap
                                        </p>
                                        <p className="mt-0.5 font-semibold text-foreground tabular-nums">
                                            {item.jumlah_porsi} porsi
                                        </p>
                                        {item.max_porsi !== null && (
                                            <p className="text-[10px] text-muted-foreground">
                                                maks. {item.max_porsi} dari stok
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openMasak(item)}
                                        title={`Masak ${item.nama}`}
                                        aria-label={`Masak ${item.nama}`}
                                        className="h-9 justify-center gap-1.5 rounded-lg border-emerald-200 px-2 text-xs text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                                    >
                                        <ChefHat className="size-3.5" /> Masak
                                    </Button>
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

            {/* Modal Dialog Form Tambah / Edit */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem
                                ? 'Edit Menu Masakan'
                                : 'Tambah Menu Masakan Baru'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="nama">Nama Masakan</Label>
                            <Input
                                id="nama"
                                value={data.nama}
                                onChange={(e) =>
                                    setData('nama', e.target.value)
                                }
                                placeholder="Contoh: Nasi Goreng Spesial"
                                required
                            />
                            {errors.nama && (
                                <span className="text-xs text-red-500">
                                    {errors.nama}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="kategori">Kategori</Label>
                                <select
                                    id="kategori"
                                    value={data.kategori_id}
                                    onChange={(e) =>
                                        setData('kategori_id', e.target.value)
                                    }
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-ring focus:outline-none"
                                    required
                                >
                                    {kategoris.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.nama}
                                        </option>
                                    ))}
                                </select>
                                {errors.kategori_id && (
                                    <span className="text-xs text-red-500">
                                        {errors.kategori_id}
                                    </span>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="harga">Harga (Rp)</Label>
                                <Input
                                    id="harga"
                                    type="number"
                                    value={data.harga}
                                    onChange={(e) =>
                                        setData('harga', e.target.value)
                                    }
                                    placeholder="15000"
                                    required
                                />
                                {errors.harga && (
                                    <span className="text-xs text-red-500">
                                        {errors.harga}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="deskripsi">
                                Deskripsi (Opsional)
                            </Label>
                            <Input
                                id="deskripsi"
                                value={data.deskripsi}
                                onChange={(e) =>
                                    setData('deskripsi', e.target.value)
                                }
                                placeholder="Keterangan bahan / rasa..."
                            />
                            {errors.deskripsi && (
                                <span className="text-xs text-red-500">
                                    {errors.deskripsi}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="jumlah_porsi">
                                    Jumlah Porsi Siap Jual
                                </Label>
                                <Input
                                    id="jumlah_porsi"
                                    type="number"
                                    min="0"
                                    value={data.jumlah_porsi}
                                    onChange={(e) =>
                                        setData('jumlah_porsi', e.target.value)
                                    }
                                    placeholder="0"
                                />
                                {errors.jumlah_porsi && (
                                    <span className="text-xs text-red-500">
                                        {errors.jumlah_porsi}
                                    </span>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="foto">Foto Masakan</Label>
                                <Input
                                    id="foto"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setData(
                                            'foto',
                                            e.target.files
                                                ? e.target.files[0]
                                                : null,
                                        )
                                    }
                                />
                                {errors.foto && (
                                    <span className="text-xs text-red-500">
                                        {errors.foto}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Editor Resep */}
                        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Resep Bahan Baku
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Takaran per 1 porsi — stok inventori
                                        berkurang otomatis saat masak.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addResepRow}
                                    disabled={
                                        bahanBakus.length === 0 ||
                                        data.resep.length >= bahanBakus.length
                                    }
                                    className="h-8 gap-1 text-emerald-700"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Bahan
                                </Button>
                            </div>

                            {bahanBakus.length === 0 ? (
                                <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                                    Belum ada bahan baku. Tambahkan dulu di menu
                                    Inventori.
                                </p>
                            ) : data.resep.length === 0 ? (
                                <p className="rounded-lg bg-gray-50 p-3 text-center text-xs text-gray-400 dark:bg-neutral-800/50">
                                    Belum ada bahan di resep ini.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {data.resep.map((row, index) => {
                                        const terpilih = bahanBakus.find(
                                            (b) =>
                                                b.id ===
                                                Number(row.bahan_baku_id),
                                        );
                                        const terpakaiLain = new Set(
                                            data.resep
                                                .filter((_, i) => i !== index)
                                                .map((r) =>
                                                    Number(r.bahan_baku_id),
                                                ),
                                        );

                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2"
                                            >
                                                <select
                                                    value={row.bahan_baku_id}
                                                    onChange={(e) =>
                                                        updateResepRow(index, {
                                                            bahan_baku_id:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm shadow-sm focus:ring-1 focus:ring-ring focus:outline-none"
                                                >
                                                    {bahanBakus.map((bahan) => (
                                                        <option
                                                            key={bahan.id}
                                                            value={bahan.id}
                                                            disabled={terpakaiLain.has(
                                                                bahan.id,
                                                            )}
                                                        >
                                                            {bahan.nama}
                                                        </option>
                                                    ))}
                                                </select>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    value={row.jumlah}
                                                    onChange={(e) =>
                                                        updateResepRow(index, {
                                                            jumlah: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder="Takaran"
                                                    className="w-24"
                                                    required
                                                />
                                                <span className="w-12 text-xs text-gray-400">
                                                    {terpilih?.satuan || ''}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeResepRow(index)
                                                    }
                                                    className="h-8 px-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {errors.resep && (
                                <span className="mt-2 block text-xs text-red-500">
                                    {errors.resep}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="tersedia"
                                checked={data.tersedia}
                                onChange={(e) =>
                                    setData('tersedia', e.target.checked)
                                }
                                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <Label
                                htmlFor="tersedia"
                                className="cursor-pointer"
                            >
                                Status Masakan Tersedia (Bisa dipesan)
                            </Label>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
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
                                      : 'Tambah Menu'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog Masak */}
            <Dialog
                open={!!masakItem}
                onOpenChange={(open) => !open && setMasakItem(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Masak {masakItem?.nama}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleMasak} className="space-y-4">
                        <div>
                            <Label htmlFor="masak_porsi">
                                Jumlah Porsi yang Dimasak
                            </Label>
                            <Input
                                id="masak_porsi"
                                type="number"
                                min="1"
                                value={masakPorsi}
                                onChange={(e) => setMasakPorsi(e.target.value)}
                                required
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                Porsi siap jual saat ini:{' '}
                                {masakItem?.jumlah_porsi ?? 0} porsi
                            </p>
                        </div>

                        {!adaResep ? (
                            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                                Menu ini belum punya resep bahan baku. Edit menu
                                dulu dan tambahkan bahan resepnya agar stok bisa
                                dihitung otomatis.
                            </div>
                        ) : (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800">
                                <div className="border-b border-gray-100 px-4 py-2 text-xs font-semibold text-gray-500 dark:border-gray-800">
                                    Kebutuhan Bahan
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {kebutuhan.map((k, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-gray-800 dark:text-gray-200">
                                                    {k.nama}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {formatAngka(k.jumlah)}{' '}
                                                    {k.satuan}/porsi ×{' '}
                                                    {Number(masakPorsi) || 0} ={' '}
                                                    {formatAngka(k.butuh)}{' '}
                                                    {k.satuan}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 text-right">
                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        stok
                                                    </p>
                                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                        {formatAngka(k.stok)}{' '}
                                                        {k.satuan}
                                                    </p>
                                                </div>
                                                {k.cukup ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {adaResep && !semuaCukup && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                Stok bahan belum cukup untuk jumlah porsi ini.
                                Kurangi porsi atau tambah stok di halaman
                                Inventori.
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMasakItem(null)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={!adaResep || !semuaCukup}
                                className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                <ChefHat className="h-4 w-4" /> Masak Sekarang
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

import { Head, router, useForm } from '@inertiajs/react';
import {
    LoaderCircle,
    Pencil,
    Plus,
    Save,
    Search,
    Tags,
    Trash2,
    UtensilsCrossed,
} from 'lucide-react';
import { useMemo, useState } from 'react';

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
import type { Kategori } from '@/types';

interface Props {
    kategoris: Kategori[];
    stats: {
        total: number;
        dipakai: number;
        kosong: number;
    };
}

export default function AdminKategoriIndex({ kategoris, stats }: Props) {
    const [cari, setCari] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState<Kategori | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Kategori | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            nama: '',
            icon: '',
            slug: '',
        });

    const hasil = useMemo(() => {
        const kata = cari.trim().toLowerCase();

        if (!kata) {
            return kategoris;
        }

        return kategoris.filter((kategori) =>
            [kategori.nama, kategori.slug ?? ''].some((nilai) =>
                nilai.toLowerCase().includes(kata),
            ),
        );
    }, [cari, kategoris]);

    const bisaDihapus = (kategori: Kategori) =>
        (kategori.masakans_count ?? 0) === 0;

    const bukaTambah = () => {
        setEditing(null);
        reset();
        clearErrors();
        setIsOpen(true);
    };

    const bukaEdit = (kategori: Kategori) => {
        setEditing(kategori);
        setData({
            nama: kategori.nama,
            icon: kategori.icon ?? '',
            slug: kategori.slug ?? '',
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
            put(`/kategori/${editing.id}`, options);

            return;
        }

        post('/kategori', options);
    };

    const hapus = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(`/kategori/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const kartuStats = [
        {
            label: 'Total kategori',
            value: stats.total,
            hint: 'Seluruh kategori yang terdaftar',
            icon: Tags,
            warna: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
        },
        {
            label: 'Dipakai menu',
            value: stats.dipakai,
            hint: 'Sudah punya minimal satu menu',
            icon: UtensilsCrossed,
            warna: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
        },
        {
            label: 'Belum dipakai',
            value: stats.kosong,
            hint: 'Bisa dihapus kapan saja',
            icon: Trash2,
            warna: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
        },
    ];

    return (
        <>
            <Head title="Manajemen Kategori" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-600 uppercase dark:text-emerald-400">
                            Katalog
                        </p>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
                            Manajemen kategori
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola kategori menu agar pelanggan lebih mudah
                            menemukan masakan yang dicari.
                        </p>
                    </div>
                    <Button
                        onClick={bukaTambah}
                        className="gap-2 self-start bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Tambah kategori
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

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        Kategori yang masih dipakai menu tidak bisa dihapus.
                    </p>
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={cari}
                            onChange={(event) => setCari(event.target.value)}
                            placeholder="Cari nama atau slug..."
                            className="h-10 rounded-xl bg-card pl-10"
                        />
                    </div>
                </div>

                <AdminTableCard
                    title="Daftar kategori"
                    description="Nama, slug, dan jumlah menu pada setiap kategori."
                    count={hasil.length}
                    icon={Tags}
                    className="hidden xl:block"
                >
                    <table className="w-full table-fixed text-left text-sm">
                        <thead className="border-b border-border/70 bg-muted/30">
                            <tr>
                                <TableHead className="w-[40%]">
                                    Kategori
                                </TableHead>
                                <TableHead className="w-[28%]">Slug</TableHead>
                                <TableHead align="center" className="w-[18%]">
                                    Menu
                                </TableHead>
                                <TableHead align="center" className="w-[14%]">
                                    Aksi
                                </TableHead>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {hasil.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-14 text-center"
                                    >
                                        <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                                            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                                                <Tags className="size-5" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">
                                                Belum ada kategori
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Klik “Tambah kategori” untuk
                                                mulai mengelompokkan menu.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                hasil.map((kategori) => (
                                    <tr
                                        key={kategori.id}
                                        className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10"
                                    >
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-lg">
                                                    {kategori.icon || (
                                                        <Tags className="size-4 text-emerald-700 dark:text-emerald-300" />
                                                    )}
                                                </div>
                                                <p className="truncate font-semibold text-foreground">
                                                    {kategori.nama}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <code className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                                                {kategori.slug ?? '-'}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <StatusPill
                                                tone={
                                                    bisaDihapus(kategori)
                                                        ? 'slate'
                                                        : 'emerald'
                                                }
                                                icon={UtensilsCrossed}
                                            >
                                                {kategori.masakans_count ?? 0}{' '}
                                                menu
                                            </StatusPill>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <TableAction
                                                    label={`Edit ${kategori.nama}`}
                                                    icon={Pencil}
                                                    onClick={() =>
                                                        bukaEdit(kategori)
                                                    }
                                                />
                                                {bisaDihapus(kategori) && (
                                                    <TableAction
                                                        label={`Hapus ${kategori.nama}`}
                                                        icon={Trash2}
                                                        tone="rose"
                                                        onClick={() =>
                                                            setDeleteTarget(
                                                                kategori,
                                                            )
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </AdminTableCard>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:hidden">
                    {hasil.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
                            Belum ada kategori. Klik “Tambah kategori” untuk
                            mulai mengelompokkan menu.
                        </div>
                    ) : (
                        hasil.map((kategori) => (
                            <div
                                key={kategori.id}
                                className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-lg">
                                            {kategori.icon || (
                                                <Tags className="size-4 text-emerald-700 dark:text-emerald-300" />
                                            )}
                                        </div>
                                        <p className="truncate font-semibold text-foreground">
                                            {kategori.nama}
                                        </p>
                                    </div>
                                    <StatusPill
                                        tone={
                                            bisaDihapus(kategori)
                                                ? 'slate'
                                                : 'emerald'
                                        }
                                    >
                                        {kategori.masakans_count ?? 0} menu
                                    </StatusPill>
                                </div>

                                <p className="mt-3 text-[11px] text-muted-foreground">
                                    Slug
                                </p>
                                <code className="mt-0.5 block rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                                    {kategori.slug ?? '-'}
                                </code>

                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => bukaEdit(kategori)}
                                        className="h-9 justify-center gap-1.5 rounded-lg px-2 text-xs text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                                    >
                                        <Pencil className="size-3.5" /> Edit
                                    </Button>
                                    {bisaDihapus(kategori) ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setDeleteTarget(kategori)
                                            }
                                            className="h-9 justify-center gap-1.5 rounded-lg border-rose-200/80 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                        >
                                            <Trash2 className="size-3.5" />{' '}
                                            Hapus
                                        </Button>
                                    ) : (
                                        <p className="flex h-9 items-center justify-center text-[11px] text-muted-foreground">
                                            Masih dipakai menu
                                        </p>
                                    )}
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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit kategori' : 'Tambah kategori'}
                        </DialogTitle>
                        <DialogDescription>
                            {editing
                                ? 'Perbarui nama atau emoji kategori ini.'
                                : 'Buat kategori baru untuk mengelompokkan menu masakan.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="kategori-nama">Nama kategori</Label>
                            <Input
                                id="kategori-nama"
                                value={data.nama}
                                onChange={(event) =>
                                    setData('nama', event.target.value)
                                }
                                placeholder="Contoh: Nasi & Lauk"
                                maxLength={50}
                                required
                            />
                            <InputError message={errors.nama} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="kategori-icon">
                                Icon emoji (opsional)
                            </Label>
                            <Input
                                id="kategori-icon"
                                value={data.icon}
                                onChange={(event) =>
                                    setData('icon', event.target.value)
                                }
                                placeholder="🍚"
                                maxLength={10}
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Emoji singkat, maksimal 10 karakter.
                            </p>
                            <InputError message={errors.icon} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="kategori-slug">Slug</Label>
                            <Input
                                id="kategori-slug"
                                value={data.slug}
                                onChange={(event) =>
                                    setData('slug', event.target.value)
                                }
                                readOnly={Boolean(editing)}
                                placeholder="Otomatis dari nama"
                                maxLength={100}
                                className={editing ? 'bg-muted' : undefined}
                            />
                            <p className="text-[11px] text-muted-foreground">
                                {editing
                                    ? 'Slug tidak diubah agar menu tetap terhubung.'
                                    : 'Kosongkan untuk dibuat otomatis dari nama.'}
                            </p>
                            <InputError message={errors.slug} />
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
                                    : 'Tambah kategori'}
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
                        <AlertDialogTitle>Hapus kategori ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Kategori “{deleteTarget?.nama}” akan dihapus
                            permanen. Pastikan tidak ada menu yang memakainya.
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

AdminKategoriIndex.layout = {
    breadcrumbs: [{ title: 'Kategori', href: '/kategori' }],
};

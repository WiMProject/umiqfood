import { router, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    ImagePlus,
    Megaphone,
    Pencil,
    Plus,
    Tag,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { StatusPill } from '@/components/admin-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DateInput } from '@/components/ui/date-input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Kupon, Pengumuman } from '@/types';

import { periodeTeks, statusPeriode } from './helpers';

interface Props {
    promos: Pengumuman[];
    opsiKupon: Pick<Kupon, 'id' | 'kode' | 'nama' | 'aktif'>[];
}

interface FormPromo {
    judul: string;
    jenis: 'promo' | 'info';
    ringkasan: string;
    isi: string;
    kupon_id: string;
    mulai: string;
    selesai: string;
    urutan: string;
    aktif: boolean;
    gambar: File | null;
}

const FORM_KOSONG: FormPromo = {
    judul: '',
    jenis: 'promo',
    ringkasan: '',
    isi: '',
    kupon_id: 'tanpa',
    mulai: '',
    selesai: '',
    urutan: '0',
    aktif: true,
    gambar: null,
};

export function PromoSection({ promos, opsiKupon }: Props) {
    const [dialogTerbuka, setDialogTerbuka] = useState(false);
    const [editing, setEditing] = useState<Pengumuman | null>(null);
    const [hapusTarget, setHapusTarget] = useState<Pengumuman | null>(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        transform,
    } = useForm<FormPromo>(FORM_KOSONG);

    const bukaTambah = () => {
        setEditing(null);
        reset();
        clearErrors();
        setDialogTerbuka(true);
    };

    const bukaEdit = (promo: Pengumuman) => {
        setEditing(promo);
        setData({
            judul: promo.judul,
            jenis: promo.jenis,
            ringkasan: promo.ringkasan ?? '',
            isi: promo.isi ?? '',
            kupon_id: promo.kupon_id ? String(promo.kupon_id) : 'tanpa',
            mulai: promo.mulai ?? '',
            selesai: promo.selesai ?? '',
            urutan: String(promo.urutan ?? 0),
            aktif: promo.aktif,
            gambar: null,
        });
        clearErrors();
        setDialogTerbuka(true);
    };

    const tutupDialog = () => {
        setDialogTerbuka(false);
        setEditing(null);
        reset();
        clearErrors();
    };

    const simpan = (event: React.FormEvent) => {
        event.preventDefault();

        const opsi = {
            forceFormData: true as const,
            preserveScroll: true,
            onSuccess: () => tutupDialog(),
        };

        const transformData = (data: FormPromo) => ({
            ...data,
            kupon_id: data.kupon_id === 'tanpa' ? null : data.kupon_id,
            mulai: data.mulai || null,
            selesai: data.selesai || null,
        });

        transform(transformData);

        if (editing) {
            post(`/konten/promo/${editing.id}`, opsi);

            return;
        }

        post('/konten/promo', opsi);
    };

    const hapus = () => {
        if (!hapusTarget) {
            return;
        }

        router.delete(`/konten/promo/${hapusTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setHapusTarget(null),
        });
    };

    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">
                        Promo & berita
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                        Tayang otomatis di halaman utama sesuai periode.
                    </p>
                </div>
                <Button
                    type="button"
                    onClick={bukaTambah}
                    className="h-10 gap-2 rounded-xl bg-emerald-600 px-4 text-white hover:bg-emerald-700"
                >
                    <Plus className="size-4" />
                    Tambah promo
                </Button>
            </div>

            {promos.length === 0 ? (
                <Card className="mt-4 rounded-2xl border-dashed p-10 text-center">
                    <Megaphone className="mx-auto size-8 text-muted-foreground" />
                    <p className="mt-3 text-sm font-semibold">
                        Belum ada promo atau berita
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Tambahkan promo agar tampil di halaman utama.
                    </p>
                </Card>
            ) : (
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {promos.map((promo) => {
                        const status = statusPeriode(
                            promo.mulai,
                            promo.selesai,
                        );

                        return (
                            <Card
                                key={promo.id}
                                className={cn(
                                    'overflow-hidden rounded-2xl border-border/70 shadow-sm',
                                    !promo.aktif && 'opacity-70',
                                )}
                            >
                                {promo.gambar_url && (
                                    <img
                                        src={promo.gambar_url}
                                        alt={promo.judul}
                                        className="h-32 w-full object-cover"
                                    />
                                )}
                                <div className="p-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <StatusPill
                                            tone={
                                                promo.jenis === 'promo'
                                                    ? 'emerald'
                                                    : 'slate'
                                            }
                                        >
                                            {promo.jenis_label}
                                        </StatusPill>
                                        <StatusPill
                                            tone={
                                                !promo.aktif
                                                    ? 'slate'
                                                    : status === 'aktif'
                                                      ? 'emerald'
                                                      : status === 'belum'
                                                        ? 'amber'
                                                        : 'rose'
                                            }
                                        >
                                            {!promo.aktif
                                                ? 'Nonaktif'
                                                : status === 'aktif'
                                                  ? 'Tayang'
                                                  : status === 'belum'
                                                    ? 'Terjadwal'
                                                    : 'Kedaluwarsa'}
                                        </StatusPill>
                                        {promo.kode_kupon_aktif && (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                <Tag className="size-3" />
                                                {promo.kode_kupon_aktif}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="mt-3 text-base font-semibold text-foreground">
                                        {promo.judul}
                                    </h3>
                                    {promo.ringkasan && (
                                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                            {promo.ringkasan}
                                        </p>
                                    )}

                                    <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                        <CalendarDays className="size-3.5" />
                                        {periodeTeks(
                                            promo.mulai,
                                            promo.selesai,
                                        )}
                                    </p>

                                    <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => bukaEdit(promo)}
                                            className="h-8 gap-1.5 rounded-lg"
                                        >
                                            <Pencil className="size-3.5" />
                                            Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setHapusTarget(promo)
                                            }
                                            className="h-8 gap-1.5 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:hover:bg-rose-950/40"
                                        >
                                            <Trash2 className="size-3.5" />
                                            Hapus
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Dialog
                open={dialogTerbuka}
                onOpenChange={(open) => !open && tutupDialog()}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit promo' : 'Tambah promo'}
                        </DialogTitle>
                        <DialogDescription>
                            Konten ini tampil di bagian promo halaman utama.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={simpan} className="grid gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="promo-judul">Judul</Label>
                            <Input
                                id="promo-judul"
                                value={data.judul}
                                onChange={(event) =>
                                    setData('judul', event.target.value)
                                }
                                placeholder="Contoh: Diskon 10% akhir pekan"
                                className="h-10 rounded-xl"
                            />
                            <InputError message={errors.judul} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label>Jenis</Label>
                                <Select
                                    value={data.jenis}
                                    onValueChange={(value) =>
                                        setData(
                                            'jenis',
                                            value as 'promo' | 'info',
                                        )
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="promo">
                                            Promo
                                        </SelectItem>
                                        <SelectItem value="info">
                                            Info
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.jenis} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label>Kupon</Label>
                                <Select
                                    value={data.kupon_id}
                                    onValueChange={(value) =>
                                        setData('kupon_id', value)
                                    }
                                >
                                    <SelectTrigger className="w-full max-w-full">
                                        <SelectValue
                                            placeholder="Tanpa kupon"
                                            className="truncate"
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="max-w-[min(20rem,calc(100vw-2rem))]">
                                        <SelectItem
                                            value="tanpa"
                                            className="max-w-full"
                                        >
                                            <span className="truncate">
                                                Tanpa kupon
                                            </span>
                                        </SelectItem>
                                        {opsiKupon.map((kupon) => (
                                            <SelectItem
                                                key={kupon.id}
                                                value={String(kupon.id)}
                                                className="max-w-full"
                                            >
                                                <span className="block truncate">
                                                    {kupon.kode}
                                                    {kupon.nama
                                                        ? ` · ${kupon.nama}`
                                                        : ''}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.kupon_id} />
                            </div>
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="promo-ringkasan">Ringkasan</Label>
                            <textarea
                                id="promo-ringkasan"
                                value={data.ringkasan}
                                onChange={(event) =>
                                    setData('ringkasan', event.target.value)
                                }
                                rows={2}
                                placeholder="Ringkasan singkat yang tampil di kartu."
                                className="w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                            />
                            <InputError message={errors.ringkasan} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="promo-isi">
                                Isi lengkap{' '}
                                <span className="font-normal text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <textarea
                                id="promo-isi"
                                value={data.isi}
                                onChange={(event) =>
                                    setData('isi', event.target.value)
                                }
                                rows={4}
                                placeholder="Syarat, cara pakai, atau detail promo."
                                className="w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                            />
                            <InputError message={errors.isi} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="promo-mulai">Mulai</Label>
                                <DateInput
                                    id="promo-mulai"
                                    value={data.mulai}
                                    onChange={(event) =>
                                        setData('mulai', event.target.value)
                                    }
                                />
                                <InputError message={errors.mulai} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="promo-selesai">Selesai</Label>
                                <DateInput
                                    id="promo-selesai"
                                    value={data.selesai}
                                    onChange={(event) =>
                                        setData('selesai', event.target.value)
                                    }
                                />
                                <InputError message={errors.selesai} />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="promo-urutan">
                                    Urutan tampil
                                </Label>
                                <Input
                                    id="promo-urutan"
                                    type="number"
                                    min={0}
                                    value={data.urutan}
                                    onChange={(event) =>
                                        setData('urutan', event.target.value)
                                    }
                                    className="h-10 rounded-xl"
                                />
                                <InputError message={errors.urutan} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="promo-gambar">Gambar</Label>
                                <label
                                    htmlFor="promo-gambar"
                                    className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-input bg-card px-3 text-sm text-muted-foreground shadow-xs transition hover:border-emerald-300 dark:hover:border-emerald-800"
                                >
                                    <ImagePlus className="size-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="truncate">
                                        {data.gambar?.name ?? 'Pilih gambar'}
                                    </span>
                                </label>
                                <input
                                    id="promo-gambar"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(event) =>
                                        setData(
                                            'gambar',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                <InputError message={errors.gambar} />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={data.aktif}
                                onCheckedChange={(checked) =>
                                    setData('aktif', checked === true)
                                }
                            />
                            Aktifkan dan tampilkan di halaman utama
                        </label>
                        <InputError message={errors.aktif} />

                        <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={tutupDialog}
                                className="rounded-xl"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={hapusTarget !== null}
                onOpenChange={(open) => !open && setHapusTarget(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Hapus promo?</DialogTitle>
                        <DialogDescription>
                            Promo "{hapusTarget?.judul}" akan dihapus permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setHapusTarget(null)}
                            className="rounded-xl"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={hapus}
                            className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                        >
                            Hapus
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

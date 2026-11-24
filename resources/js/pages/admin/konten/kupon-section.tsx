import { router, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    Coins,
    History,
    Pencil,
    Plus,
    Power,
    Tag,
    TicketPercent,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';

import { StatusPill, TableAction, TableHead } from '@/components/admin-table';
import InputError from '@/components/input-error';
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
import type { Kupon, KuponTipe } from '@/types';

import { formatRupiah, periodeTeks, statusPeriode } from './helpers';

interface Props {
    kupons: Kupon[];
}

interface FormKupon {
    kode: string;
    nama: string;
    tipe: KuponTipe;
    nilai: string;
    min_subtotal: string;
    maks_diskon: string;
    kuota: string;
    maks_per_user: string;
    mulai: string;
    selesai: string;
    aktif: boolean;
}

const FORM_KOSONG: FormKupon = {
    kode: '',
    nama: '',
    tipe: 'persen',
    nilai: '10',
    min_subtotal: '0',
    maks_diskon: '',
    kuota: '',
    maks_per_user: '1',
    mulai: '',
    selesai: '',
    aktif: true,
};

function statusKupon(kupon: Kupon): {
    label: string;
    tone: 'emerald' | 'amber' | 'rose' | 'slate';
} {
    if (!kupon.aktif) {
        return { label: 'Nonaktif', tone: 'slate' };
    }

    const status = statusPeriode(kupon.mulai, kupon.selesai);

    if (status === 'belum') {
        return { label: 'Terjadwal', tone: 'amber' };
    }

    if (status === 'lewat') {
        return { label: 'Kedaluwarsa', tone: 'rose' };
    }

    return { label: 'Aktif', tone: 'emerald' };
}

export function KuponSection({ kupons }: Props) {
    const [dialogTerbuka, setDialogTerbuka] = useState(false);
    const [editing, setEditing] = useState<Kupon | null>(null);
    const [hapusTarget, setHapusTarget] = useState<Kupon | null>(null);
    const [riwayatKupon, setRiwayatKupon] = useState<Kupon | null>(null);
    const [riwayatData, setRiwayatData] = useState<
        {
            id: number;
            kode: string;
            tanggal: string | null;
            nama: string;
            pelanggan: string | null;
            status_label: string;
            subtotal: number;
            diskon: number;
            total: number;
        }[]
    >([]);
    const [riwayatLoading, setRiwayatLoading] = useState(false);

    const {
        data,
        setData,
        post,
        patch,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<FormKupon>(FORM_KOSONG);

    const totalPemakaian = kupons.reduce(
        (total, kupon) => total + (kupon.total_pemakaian ?? 0),
        0,
    );
    const totalDiskon = kupons.reduce(
        (total, kupon) => total + (kupon.total_diskon ?? 0),
        0,
    );

    const bukaTambah = () => {
        setEditing(null);
        reset();
        clearErrors();
        setDialogTerbuka(true);
    };

    const bukaEdit = (kupon: Kupon) => {
        setEditing(kupon);
        setData({
            kode: kupon.kode,
            nama: kupon.nama ?? '',
            tipe: kupon.tipe,
            nilai: String(kupon.nilai),
            min_subtotal: String(kupon.min_subtotal ?? 0),
            maks_diskon:
                kupon.maks_diskon === null ? '' : String(kupon.maks_diskon),
            kuota: kupon.kuota === null ? '' : String(kupon.kuota),
            maks_per_user: String(kupon.maks_per_user ?? 1),
            mulai: kupon.mulai ?? '',
            selesai: kupon.selesai ?? '',
            aktif: kupon.aktif,
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
            preserveScroll: true,
            onSuccess: () => tutupDialog(),
        };

        if (editing) {
            patch(`/konten/kupon/${editing.id}`, opsi);

            return;
        }

        post('/konten/kupon', opsi);
    };

    const toggle = (kupon: Kupon) => {
        router.patch(
            `/konten/kupon/${kupon.id}/toggle`,
            {},
            { preserveScroll: true },
        );
    };

    const hapus = () => {
        if (!hapusTarget) {
            return;
        }

        router.delete(`/konten/kupon/${hapusTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setHapusTarget(null),
        });
    };

    const bukaRiwayat = async (kupon: Kupon) => {
        setRiwayatKupon(kupon);
        setRiwayatData([]);
        setRiwayatLoading(true);

        try {
            const response = await fetch(`/konten/kupon/${kupon.id}/riwayat`, {
                headers: { Accept: 'application/json' },
            });
            const payload = await response.json().catch(() => null);

            if (response.ok && payload?.orders) {
                setRiwayatData(payload.orders);
            }
        } catch {
            setRiwayatData([]);
        } finally {
            setRiwayatLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">
                        Kupon diskon
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                        Kode ini bisa dipakai pelanggan saat checkout dan
                        langsung memotong total pesanan.
                    </p>
                </div>
                <Button
                    type="button"
                    onClick={bukaTambah}
                    className="h-10 gap-2 rounded-xl bg-emerald-600 px-4 text-white hover:bg-emerald-700"
                >
                    <Plus className="size-4" />
                    Tambah kupon
                </Button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                    {
                        icon: TicketPercent,
                        value: kupons.length,
                        label: 'Total kupon',
                        hint: 'Semua kode',
                    },
                    {
                        icon: Power,
                        value: kupons.filter((kupon) => kupon.aktif).length,
                        label: 'Kupon aktif',
                        hint: 'Siap dipakai',
                    },
                    {
                        icon: Users,
                        value: totalPemakaian,
                        label: 'Pemakaian',
                        hint: 'Pesanan tidak batal',
                    },
                    {
                        icon: Coins,
                        value: formatRupiah(totalDiskon),
                        label: 'Total diskon',
                        hint: 'Sudah diberikan',
                    },
                ].map((item) => (
                    <Card key={item.label} className="gap-1 p-4">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                            <item.icon className="size-4.5" />
                        </span>
                        <p className="mt-2 truncate text-lg font-extrabold tracking-tight">
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

            {kupons.length === 0 ? (
                <Card className="mt-4 rounded-2xl border-dashed p-10 text-center">
                    <TicketPercent className="mx-auto size-8 text-muted-foreground" />
                    <p className="mt-3 text-sm font-semibold">
                        Belum ada kupon
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Buat kupon pertama, lalu tampilkan juga di bagian promo
                        halaman utama.
                    </p>
                </Card>
            ) : (
                <>
                    {/* Tabel desktop */}
                    <div className="mt-4 hidden overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm xl:block">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border/70 bg-muted/30">
                                <tr>
                                    <TableHead className="w-[22%]">
                                        Kode
                                    </TableHead>
                                    <TableHead className="w-[18%]">
                                        Diskon
                                    </TableHead>
                                    <TableHead className="w-[18%]">
                                        Syarat
                                    </TableHead>
                                    <TableHead className="w-[16%]">
                                        Pemakaian
                                    </TableHead>
                                    <TableHead className="w-[16%]">
                                        Periode
                                    </TableHead>
                                    <TableHead
                                        align="center"
                                        className="w-[10%]"
                                    >
                                        Aksi
                                    </TableHead>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {kupons.map((kupon) => {
                                    const status = statusKupon(kupon);

                                    return (
                                        <tr
                                            key={kupon.id}
                                            className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10"
                                        >
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                                        <Tag className="size-4" />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="font-mono text-sm font-bold tracking-wide">
                                                            {kupon.kode}
                                                        </p>
                                                        <p className="truncate text-[11px] text-muted-foreground">
                                                            {kupon.nama ||
                                                                'Tanpa keterangan'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="font-semibold">
                                                    {kupon.nilai_format}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {kupon.tipe_label}
                                                    {kupon.maks_diskon
                                                        ? ` · maks ${formatRupiah(kupon.maks_diskon)}`
                                                        : ''}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="text-xs">
                                                    Min.{' '}
                                                    {formatRupiah(
                                                        kupon.min_subtotal,
                                                    )}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {kupon.maks_per_user}× per
                                                    pelanggan
                                                </p>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="text-xs font-medium">
                                                    {kupon.total_pemakaian ?? 0}
                                                    {kupon.kuota
                                                        ? ` / ${kupon.kuota}`
                                                        : ' / tanpa batas'}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Diskon{' '}
                                                    {formatRupiah(
                                                        kupon.total_diskon ?? 0,
                                                    )}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="text-[11px] text-muted-foreground">
                                                    {periodeTeks(
                                                        kupon.mulai,
                                                        kupon.selesai,
                                                    )}
                                                </p>
                                                <StatusPill
                                                    tone={status.tone}
                                                    icon={CalendarDays}
                                                >
                                                    {status.label}
                                                </StatusPill>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex justify-center gap-1.5">
                                                    <TableAction
                                                        label={
                                                            kupon.aktif
                                                                ? 'Nonaktifkan'
                                                                : 'Aktifkan'
                                                        }
                                                        icon={Power}
                                                        tone={
                                                            kupon.aktif
                                                                ? 'slate'
                                                                : 'emerald'
                                                        }
                                                        onClick={() =>
                                                            toggle(kupon)
                                                        }
                                                    />
                                                    <TableAction
                                                        label="Edit kupon"
                                                        icon={Pencil}
                                                        onClick={() =>
                                                            bukaEdit(kupon)
                                                        }
                                                    />
                                                    <TableAction
                                                        label="Riwayat pemakaian"
                                                        icon={History}
                                                        onClick={() =>
                                                            bukaRiwayat(kupon)
                                                        }
                                                    />
                                                    <TableAction
                                                        label="Hapus kupon"
                                                        icon={Trash2}
                                                        tone="rose"
                                                        onClick={() =>
                                                            setHapusTarget(
                                                                kupon,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Kartu mobile */}
                    <div className="mt-4 grid gap-3 xl:hidden">
                        {kupons.map((kupon) => {
                            const status = statusKupon(kupon);

                            return (
                                <Card
                                    key={kupon.id}
                                    className={cn(
                                        'rounded-2xl border-border/70 p-4 shadow-sm',
                                        !kupon.aktif && 'opacity-75',
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-mono text-base font-bold tracking-wide">
                                                {kupon.kode}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {kupon.nama ||
                                                    'Tanpa keterangan'}
                                            </p>
                                        </div>
                                        <StatusPill tone={status.tone}>
                                            {status.label}
                                        </StatusPill>
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                        <div className="rounded-lg bg-muted/50 px-2.5 py-2">
                                            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                                Diskon
                                            </p>
                                            <p className="font-semibold">
                                                {kupon.nilai_format}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 px-2.5 py-2">
                                            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                                Min. belanja
                                            </p>
                                            <p className="font-semibold">
                                                {formatRupiah(
                                                    kupon.min_subtotal,
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 px-2.5 py-2">
                                            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                                Terpakai
                                            </p>
                                            <p className="font-semibold">
                                                {kupon.total_pemakaian ?? 0}
                                                {kupon.kuota
                                                    ? ` / ${kupon.kuota}`
                                                    : ''}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 px-2.5 py-2">
                                            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                                Total diskon
                                            </p>
                                            <p className="font-semibold">
                                                {formatRupiah(
                                                    kupon.total_diskon ?? 0,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="mt-3 text-[11px] text-muted-foreground">
                                        {periodeTeks(
                                            kupon.mulai,
                                            kupon.selesai,
                                        )}{' '}
                                        · {kupon.maks_per_user}× per pelanggan
                                    </p>

                                    <div className="mt-3 flex gap-2 border-t border-border/60 pt-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggle(kupon)}
                                            className="h-8 flex-1 gap-1.5 rounded-lg text-xs"
                                        >
                                            <Power className="size-3.5" />
                                            {kupon.aktif
                                                ? 'Nonaktifkan'
                                                : 'Aktifkan'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => bukaEdit(kupon)}
                                            className="h-8 flex-1 gap-1.5 rounded-lg text-xs"
                                        >
                                            <Pencil className="size-3.5" />
                                            Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => bukaRiwayat(kupon)}
                                            className="h-8 gap-1.5 rounded-lg text-xs"
                                        >
                                            <History className="size-3.5" />
                                            Riwayat
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setHapusTarget(kupon)
                                            }
                                            className="h-8 gap-1.5 rounded-lg border-rose-200 text-xs text-rose-600 hover:bg-rose-50 dark:border-rose-900/60"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            <p className="mt-3 text-[11px] text-muted-foreground">
                Kupon yang sudah pernah dipakai tidak bisa dihapus atau diubah
                kodenya. Nonaktifkan saja agar riwayat pesanan tetap aman.
            </p>

            <Dialog
                open={dialogTerbuka}
                onOpenChange={(open) => !open && tutupDialog()}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit kupon' : 'Tambah kupon'}
                        </DialogTitle>
                        <DialogDescription>
                            Kode kupon bisa dipakai pelanggan di halaman
                            checkout. Satu pesanan hanya untuk satu kupon.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={simpan} className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="kupon-kode">Kode kupon</Label>
                                <Input
                                    id="kupon-kode"
                                    value={data.kode}
                                    onChange={(event) =>
                                        setData(
                                            'kode',
                                            event.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="HEMAT10"
                                    className="h-10 rounded-xl font-mono uppercase"
                                />
                                <InputError message={errors.kode} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="kupon-nama">
                                    Keterangan{' '}
                                    <span className="font-normal text-muted-foreground">
                                        (opsional)
                                    </span>
                                </Label>
                                <Input
                                    id="kupon-nama"
                                    value={data.nama}
                                    onChange={(event) =>
                                        setData('nama', event.target.value)
                                    }
                                    placeholder="Diskon akhir pekan"
                                    className="h-10 rounded-xl"
                                />
                                <InputError message={errors.nama} />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label>Tipe diskon</Label>
                                <Select
                                    value={data.tipe}
                                    onValueChange={(value) =>
                                        setData('tipe', value as KuponTipe)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="persen">
                                            Persen (%)
                                        </SelectItem>
                                        <SelectItem value="nominal">
                                            Nominal (Rp)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.tipe} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="kupon-nilai">
                                    {data.tipe === 'persen'
                                        ? 'Besar diskon (%)'
                                        : 'Potongan (Rp)'}
                                </Label>
                                <Input
                                    id="kupon-nilai"
                                    type="number"
                                    min={1}
                                    max={
                                        data.tipe === 'persen' ? 100 : undefined
                                    }
                                    value={data.nilai}
                                    onChange={(event) =>
                                        setData('nilai', event.target.value)
                                    }
                                    className="h-10 rounded-xl"
                                />
                                <InputError message={errors.nilai} />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="kupon-min">
                                    Minimal belanja (Rp)
                                </Label>
                                <Input
                                    id="kupon-min"
                                    type="number"
                                    min={0}
                                    value={data.min_subtotal}
                                    onChange={(event) =>
                                        setData(
                                            'min_subtotal',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 rounded-xl"
                                />
                                <InputError message={errors.min_subtotal} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="kupon-maks">
                                    Maksimal diskon (Rp){' '}
                                    <span className="font-normal text-muted-foreground">
                                        (opsional)
                                    </span>
                                </Label>
                                <Input
                                    id="kupon-maks"
                                    type="number"
                                    min={1}
                                    value={data.maks_diskon}
                                    disabled={data.tipe === 'nominal'}
                                    onChange={(event) =>
                                        setData(
                                            'maks_diskon',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Tanpa batas"
                                    className="h-10 rounded-xl"
                                />
                                <InputError message={errors.maks_diskon} />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="kupon-kuota">
                                    Kuota pemakaian{' '}
                                    <span className="font-normal text-muted-foreground">
                                        (kosongkan = tanpa batas)
                                    </span>
                                </Label>
                                <Input
                                    id="kupon-kuota"
                                    type="number"
                                    min={1}
                                    value={data.kuota}
                                    onChange={(event) =>
                                        setData('kuota', event.target.value)
                                    }
                                    placeholder="Tanpa batas"
                                    className="h-10 rounded-xl"
                                />
                                <InputError message={errors.kuota} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="kupon-per-user">
                                    Maksimal per pelanggan
                                </Label>
                                <Input
                                    id="kupon-per-user"
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={data.maks_per_user}
                                    onChange={(event) =>
                                        setData(
                                            'maks_per_user',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 rounded-xl"
                                />
                                <InputError message={errors.maks_per_user} />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="kupon-mulai">
                                    Berlaku dari
                                </Label>
                                <DateInput
                                    id="kupon-mulai"
                                    value={data.mulai}
                                    onChange={(event) =>
                                        setData('mulai', event.target.value)
                                    }
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Kosongkan agar kupon langsung bisa dipakai.
                                </p>
                                <InputError message={errors.mulai} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="kupon-selesai">
                                    Berlaku sampai
                                </Label>
                                <DateInput
                                    id="kupon-selesai"
                                    value={data.selesai}
                                    onChange={(event) =>
                                        setData('selesai', event.target.value)
                                    }
                                />
                                <InputError message={errors.selesai} />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={data.aktif}
                                onCheckedChange={(checked) =>
                                    setData('aktif', checked === true)
                                }
                            />
                            Aktifkan kupon
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
                                {processing ? 'Menyimpan...' : 'Simpan kupon'}
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
                        <DialogTitle>Hapus kupon?</DialogTitle>
                        <DialogDescription>
                            Kupon {hapusTarget?.kode} akan dihapus permanen.
                            Kupon yang sudah pernah dipakai tidak bisa dihapus.
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

            <Dialog
                open={riwayatKupon !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setRiwayatKupon(null);
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            Riwayat pemakaian {riwayatKupon?.kode}
                        </DialogTitle>
                        <DialogDescription>
                            {riwayatKupon?.nama || 'Kupon'} — daftar pesanan
                            yang memakai kupon ini.
                        </DialogDescription>
                    </DialogHeader>

                    {riwayatLoading ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            Memuat riwayat...
                        </p>
                    ) : riwayatData.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            Belum ada pesanan yang memakai kupon ini.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-border/70">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead className="border-b border-border/70 bg-muted/30">
                                    <tr>
                                        <th className="px-3 py-2 font-semibold">
                                            Kode
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Tanggal
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Pelanggan
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Status
                                        </th>
                                        <th className="px-3 py-2 text-right font-semibold">
                                            Total
                                        </th>
                                        <th className="px-3 py-2 text-right font-semibold">
                                            Diskon
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {riwayatData.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-3 py-2 font-mono font-medium">
                                                {order.kode}
                                            </td>
                                            <td className="px-3 py-2 text-muted-foreground">
                                                {order.tanggal ?? '-'}
                                            </td>
                                            <td className="px-3 py-2">
                                                {order.pelanggan || order.nama}
                                            </td>
                                            <td className="px-3 py-2">
                                                {order.status_label}
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium">
                                                {formatRupiah(order.total)}
                                            </td>
                                            <td className="px-3 py-2 text-right text-emerald-700 dark:text-emerald-300">
                                                {formatRupiah(order.diskon)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

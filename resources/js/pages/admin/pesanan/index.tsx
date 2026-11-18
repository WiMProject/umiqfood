import { Head, router } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    ChefHat,
    ClipboardList,
    Clock,
    Coins,
    MapPin,
    PackageCheck,
    Phone,
    QrCode,
    Search,
    Store,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from 'cn';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';
import type { Order, OrderStatus } from '@/types';

interface Props {
    orders: Order[];
    stats: {
        antrianHariIni: number;
        aktif: number;
        siapDiambil: number;
        pendapatanHariIni: number;
        antrianTerakhir: number;
    };
    [key: string]: unknown;
}

const STATUS_BADGE: Record<OrderStatus, string> = {
    menunggu:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300',
    dimasak:
        'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300',
    siap: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',
    selesai: 'border-border bg-muted text-muted-foreground dark:bg-muted/60',
    dibatalkan:
        'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300',
};

const FILTER: { value: 'semua' | OrderStatus; label: string }[] = [
    { value: 'semua', label: 'Semua' },
    { value: 'menunggu', label: 'Menunggu' },
    { value: 'dimasak', label: 'Dimasak' },
    { value: 'siap', label: 'Siap diambil' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
];

function formatWaktu(value: string | null): string {
    if (!value) {
        return '-';
    }

    const tanggal = new Date(value);
    const hari = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
    }).format(tanggal);
    const jam = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })
        .format(tanggal)
        .replace(':', '.');

    return `${hari} · ${jam}`;
}

function formatRupiah(value: number): string {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(value);
}

export default function AdminPesananIndex({ orders, stats }: Props) {
    const [filter, setFilter] = useState<'semua' | OrderStatus>('semua');
    const [cari, setCari] = useState('');
    const [detail, setDetail] = useState<Order | null>(null);
    const [memproses, setMemproses] = useState<number | null>(null);

    const hasil = useMemo(() => {
        const kataKunci = cari.trim().toLowerCase();

        return orders.filter((order) => {
            const cocokStatus = filter === 'semua' || order.status === filter;
            const cocokCari =
                kataKunci === '' ||
                order.kode.toLowerCase().includes(kataKunci) ||
                order.nama_pengambil.toLowerCase().includes(kataKunci) ||
                order.antrian_format.toLowerCase().includes(kataKunci) ||
                order.no_hp.includes(kataKunci);

            return cocokStatus && cocokCari;
        });
    }, [orders, filter, cari]);

    const ubahStatus = (order: Order, status: string) => {
        setMemproses(order.id);
        router.patch(
            `/pesanan/${order.id}/status`,
            { status },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setMemproses(null),
            },
        );
    };

    const kartu = [
        {
            label: 'Antrian hari ini',
            value: stats.antrianHariIni,
            hint: `Terakhir A-${String(stats.antrianTerakhir).padStart(3, '0')}`,
            icon: ClipboardList,
            warna: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
        },
        {
            label: 'Pesanan aktif',
            value: stats.aktif,
            hint: 'Menunggu, dimasak, siap',
            icon: ChefHat,
            warna: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
        },
        {
            label: 'Siap diambil',
            value: stats.siapDiambil,
            hint: 'Tunggu pelanggan datang',
            icon: PackageCheck,
            warna: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
        },
        {
            label: 'Pendapatan hari ini',
            value: formatRupiah(stats.pendapatanHariIni),
            hint: 'Dari pembayaran lunas',
            icon: Coins,
            warna: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300',
        },
    ];

    return (
        <>
            <Head title="Pesanan Pickup" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-600 uppercase dark:text-emerald-400">
                            Pesanan
                        </p>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
                            Pesanan pickup
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola antrian, status masak, dan pembayaran di
                            kasir.
                        </p>
                    </div>
                    <Badge
                        variant="outline"
                        className="gap-1.5 self-start border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 sm:self-auto dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                    >
                        <Store className="size-3.5" />
                        Tanpa pengantaran · ambil di outlet
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {kartu.map((item) => (
                        <Card key={item.label} className="gap-1 p-4">
                            <div className="flex items-start justify-between">
                                <span
                                    className={cn(
                                        'flex size-9 items-center justify-center rounded-xl',
                                        item.warna,
                                    )}
                                >
                                    <item.icon className="size-4.5" />
                                </span>
                            </div>
                            <p className="mt-2 truncate text-xl font-extrabold tracking-tight">
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

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-1.5">
                        {FILTER.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setFilter(item.value)}
                                className={cn(
                                    'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
                                    filter === item.value
                                        ? 'border-emerald-600 bg-emerald-600 text-white'
                                        : 'border-border/80 bg-card text-muted-foreground hover:border-emerald-300',
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full lg:max-w-xs">
                        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={cari}
                            onChange={(event) => setCari(event.target.value)}
                            placeholder="Cari kode, nama, antrian..."
                            className="h-10 rounded-xl bg-card pl-10"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    {hasil.length === 0 ? (
                        <Card className="flex flex-col items-center gap-2 border-dashed px-6 py-14 text-center">
                            <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                <ClipboardList className="size-5" />
                            </span>
                            <p className="font-semibold">Tidak ada pesanan</p>
                            <p className="text-sm text-muted-foreground">
                                Pesanan baru dari pelanggan akan muncul di sini.
                            </p>
                        </Card>
                    ) : (
                        hasil.map((order) => (
                            <Card key={order.id} className="p-0">
                                <div className="flex flex-col gap-3 p-4 sm:p-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
                                                <span className="text-[8px] font-semibold tracking-widest uppercase opacity-80">
                                                    Antrian
                                                </span>
                                                <span className="text-lg leading-none font-extrabold">
                                                    {String(
                                                        order.nomor_antrian,
                                                    ).padStart(3, '0')}
                                                </span>
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-sm font-semibold">
                                                        {order.kode}
                                                    </p>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'text-[10px]',
                                                            STATUS_BADGE[
                                                                order.status
                                                            ],
                                                        )}
                                                    >
                                                        {order.status_label}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'gap-1 text-[10px]',
                                                            order.payment
                                                                ?.status ===
                                                                'berhasil'
                                                                ? STATUS_BADGE.selesai
                                                                : order.payment
                                                                        ?.status ===
                                                                    'gagal'
                                                                  ? STATUS_BADGE.dibatalkan
                                                                  : STATUS_BADGE.menunggu,
                                                        )}
                                                    >
                                                        {order.payment
                                                            ?.status ===
                                                        'berhasil' ? (
                                                            <CheckCircle2 className="size-3" />
                                                        ) : (
                                                            <Banknote className="size-3" />
                                                        )}
                                                        {order.payment
                                                            ?.status_label ??
                                                            'Belum dibayar'}
                                                    </Badge>
                                                </div>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {order.user?.name ??
                                                        order.nama_pengambil}{' '}
                                                    · pesan{' '}
                                                    {formatWaktu(
                                                        order.created_at,
                                                    )}
                                                </p>

                                                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                                    {order.items
                                                        .map(
                                                            (item) =>
                                                                `${item.jumlah}× ${item.nama_menu}`,
                                                        )
                                                        .join(', ')}
                                                </p>

                                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="size-3" />
                                                        {order.no_hp}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        {order.metode_pembayaran ===
                                                        'qris' ? (
                                                            <QrCode className="size-3" />
                                                        ) : (
                                                            <Banknote className="size-3" />
                                                        )}
                                                        {
                                                            order.metode_pembayaran_label
                                                        }
                                                    </span>
                                                    {order.catatan && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="size-3" />
                                                            {order.catatan}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/70 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                                            <p className="text-base font-extrabold">
                                                {order.total_format}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDetail(order)}
                                                className="h-8 rounded-lg text-xs"
                                            >
                                                Detail
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
                                        {order.status === 'menunggu' && (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    ubahStatus(order, 'dimasak')
                                                }
                                                disabled={
                                                    memproses === order.id
                                                }
                                                className="h-9 gap-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                                            >
                                                <ChefHat className="size-3.5" />
                                                Mulai masak
                                            </Button>
                                        )}
                                        {order.status === 'dimasak' && (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    ubahStatus(order, 'siap')
                                                }
                                                disabled={
                                                    memproses === order.id
                                                }
                                                className="h-9 gap-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                            >
                                                <PackageCheck className="size-3.5" />
                                                Siap diambil
                                            </Button>
                                        )}
                                        {order.status === 'siap' && (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    ubahStatus(order, 'selesai')
                                                }
                                                disabled={
                                                    memproses === order.id
                                                }
                                                className="h-9 gap-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                            >
                                                <CheckCircle2 className="size-3.5" />
                                                Selesai & lunas
                                            </Button>
                                        )}

                                        {(order.status === 'menunggu' ||
                                            order.status === 'dimasak' ||
                                            order.status === 'siap') && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 gap-1.5 rounded-lg text-red-600 hover:text-red-700 dark:text-red-400"
                                                    >
                                                        <XCircle className="size-3.5" />
                                                        Batalkan
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Batalkan pesanan{' '}
                                                            {
                                                                order.antrian_format
                                                            }
                                                            ?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Porsi akan
                                                            dikembalikan ke menu
                                                            dan pembayaran
                                                            ditandai gagal.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            Tidak
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                ubahStatus(
                                                                    order,
                                                                    'dibatalkan',
                                                                )
                                                            }
                                                            className="bg-red-600 text-white hover:bg-red-700"
                                                        >
                                                            Ya, batalkan
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}

                                        {order.status === 'selesai' && (
                                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <CheckCircle2 className="size-3.5 text-emerald-600" />
                                                Diambil{' '}
                                                {formatWaktu(order.diambil_at)}
                                            </p>
                                        )}

                                        {order.status === 'dibatalkan' && (
                                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <XCircle className="size-3.5 text-red-500" />
                                                Dibatalkan{' '}
                                                {formatWaktu(
                                                    order.dibatalkan_at,
                                                )}
                                            </p>
                                        )}

                                        <span className="ml-auto text-[11px] text-muted-foreground">
                                            Estimasi siap{' '}
                                            {formatWaktu(
                                                order.estimasi_siap_at,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <Dialog
                open={detail !== null}
                onOpenChange={(open) => !open && setDetail(null)}
            >
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                    {detail && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    {detail.kode}
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'text-[10px]',
                                            STATUS_BADGE[detail.status],
                                        )}
                                    >
                                        {detail.status_label}
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription>
                                    Antrian {detail.antrian_format} ·{' '}
                                    {detail.tanggal_format} ·{' '}
                                    {detail.metode_pembayaran_label}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="rounded-xl border border-border/70 p-3.5 text-sm">
                                    <p className="flex items-center gap-2 font-medium">
                                        <MapPin className="size-4 text-emerald-600 dark:text-emerald-400" />
                                        {detail.nama_pengambil}
                                        <span className="text-muted-foreground">
                                            · {detail.no_hp}
                                        </span>
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Akun: {detail.user?.name ?? '-'} (
                                        {detail.user?.email ?? '-'})
                                    </p>
                                    {detail.catatan && (
                                        <p className="mt-2 rounded-lg bg-muted/50 px-2.5 py-2 text-xs text-muted-foreground">
                                            Catatan: {detail.catatan}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {detail.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between gap-3 text-sm"
                                        >
                                            <span>
                                                {item.jumlah}× {item.nama_menu}
                                            </span>
                                            <span className="font-medium">
                                                {item.subtotal_format}
                                            </span>
                                        </div>
                                    ))}
                                    <Separator />
                                    <div className="flex justify-between font-bold">
                                        <span>Total</span>
                                        <span>{detail.total_format}</span>
                                    </div>
                                </div>

                                <div className="grid gap-2 rounded-xl bg-muted/40 p-3.5 text-xs text-muted-foreground">
                                    <p>
                                        Dibuat: {formatWaktu(detail.created_at)}
                                    </p>
                                    {detail.siap_at && (
                                        <p>
                                            Siap diambil:{' '}
                                            {formatWaktu(detail.siap_at)}
                                        </p>
                                    )}
                                    {detail.diambil_at && (
                                        <p>
                                            Diambil:{' '}
                                            {formatWaktu(detail.diambil_at)}
                                        </p>
                                    )}
                                    {detail.payment && (
                                        <p>
                                            Pembayaran:{' '}
                                            {detail.payment.status_label} (
                                            {detail.payment.metode_label})
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

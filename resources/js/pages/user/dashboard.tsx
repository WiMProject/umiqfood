import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Banknote,
    CheckCircle2,
    ChefHat,
    ChevronRight,
    ClipboardList,
    Clock,
    History,
    MapPin,
    Minus,
    PackageCheck,
    Plus,
    QrCode,
    ReceiptText,
    ShoppingBag,
    Sparkles,
    Store,
    Trash2,
    UtensilsCrossed,
    Wallet,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type {
    CartItem,
    KeranjangRingkas,
    MetodePembayaran,
    Order,
    OrderStatus,
    Payment,
} from '@/types';

interface Props {
    tab: string;
    cartItems: CartItem[];
    orders: Order[];
    payments: Payment[];
    activeOrder: Order | null;
    stats: {
        totalPesanan: number;
        pesananAktif: number;
        totalBelanja: number;
        totalItemKeranjang: number;
    };
    auth: {
        user: { name: string; role: string } | null;
    };
    keranjang: KeranjangRingkas;
    pesananAktif: number;
    [key: string]: unknown;
}

type TabKey = 'ringkasan' | 'keranjang' | 'pesanan' | 'pembayaran';

const TAB_VALID: TabKey[] = ['ringkasan', 'keranjang', 'pesanan', 'pembayaran'];

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

const LANGKAH: { status: OrderStatus; label: string; icon: typeof ChefHat }[] =
    [
        { status: 'menunggu', label: 'Diterima', icon: ClipboardList },
        { status: 'dimasak', label: 'Dimasak', icon: ChefHat },
        { status: 'siap', label: 'Siap diambil', icon: PackageCheck },
        { status: 'selesai', label: 'Selesai', icon: CheckCircle2 },
    ];

const METODE: {
    value: MetodePembayaran;
    label: string;
    description: string;
    icon: typeof Banknote;
}[] = [
    {
        value: 'cash',
        label: 'Bayar di tempat',
        description: 'Bayar tunai saat ambil pesanan.',
        icon: Banknote,
    },
    {
        value: 'qris',
        label: 'QRIS di kasir',
        description: 'Scan QRIS di outlet saat ambil.',
        icon: QrCode,
    },
];

function formatTanggal(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function formatJam(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function formatRupiah(value: number): string {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(value);
}

export default function UserDashboard() {
    const { tab, cartItems, orders, payments, activeOrder, stats, auth } =
        usePage<Props>().props;

    const [activeTab, setActiveTab] = useState<TabKey>(
        TAB_VALID.includes(tab as TabKey) ? (tab as TabKey) : 'ringkasan',
    );
    const [memproses, setMemproses] = useState<number | null>(null);
    const [detail, setDetail] = useState<Order | null>(null);
    const [filterPesanan, setFilterPesanan] = useState<
        'semua' | 'aktif' | 'selesai' | 'dibatalkan'
    >('semua');

    useEffect(() => {
        if (TAB_VALID.includes(tab as TabKey)) {
            setActiveTab(tab as TabKey);
        }
    }, [tab]);

    const checkout = useForm<{
        nama_pengambil: string;
        no_hp: string;
        metode_pembayaran: MetodePembayaran;
        catatan: string;
    }>({
        nama_pengambil: auth.user?.name ?? '',
        no_hp: '',
        metode_pembayaran: 'cash',
        catatan: '',
    });

    const totalKeranjang = useMemo(
        () => cartItems.reduce((total, item) => total + item.subtotal, 0),
        [cartItems],
    );

    const pesananTersaring = useMemo(() => {
        if (filterPesanan === 'semua') {
            return orders;
        }

        if (filterPesanan === 'aktif') {
            return orders.filter((order) =>
                ['menunggu', 'dimasak', 'siap'].includes(order.status),
            );
        }

        return orders.filter((order) => order.status === filterPesanan);
    }, [orders, filterPesanan]);

    const totalLunas = useMemo(
        () =>
            payments
                .filter((payment) => payment.status === 'berhasil')
                .reduce((total, payment) => total + payment.jumlah, 0),
        [payments],
    );

    const ubahJumlah = (item: CartItem, jumlah: number) => {
        if (jumlah < 1) {
            return;
        }

        setMemproses(item.masakan_id);
        router.patch(
            `/keranjang/${item.masakan_id}`,
            { jumlah },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setMemproses(null),
            },
        );
    };

    const hapusItem = (item: CartItem) => {
        setMemproses(item.masakan_id);
        router.delete(`/keranjang/${item.masakan_id}`, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setMemproses(null),
        });
    };

    const gantiTab = (value: TabKey) => {
        setActiveTab(value);
        router.get('/akun', value === 'ringkasan' ? {} : { tab: value }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const kirimCheckout = () => {
        checkout.post('/checkout', {
            preserveScroll: true,
            onSuccess: () => checkout.reset('catatan'),
        });
    };

    const tabs: {
        key: TabKey;
        label: string;
        icon: typeof ShoppingBag;
        badge?: number;
    }[] = [
        { key: 'ringkasan', label: 'Ringkasan', icon: Sparkles },
        {
            key: 'keranjang',
            label: 'Keranjang',
            icon: ShoppingBag,
            badge: stats.totalItemKeranjang,
        },
        {
            key: 'pesanan',
            label: 'Pesanan',
            icon: ClipboardList,
            badge: stats.pesananAktif,
        },
        { key: 'pembayaran', label: 'Pembayaran', icon: ReceiptText },
    ];

    return (
        <>
            <Head title="Pesanan Saya" />

            <div className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-600 uppercase dark:text-emerald-400">
                            Akun saya
                        </p>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                            Pesanan & pembayaran
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Semua pesanan pickup, nomor antrian, dan riwayat
                            pembayaranmu ada di sini.
                        </p>
                    </div>

                    <Badge
                        variant="outline"
                        className="gap-1.5 self-start border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 sm:self-auto dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                    >
                        <MapPin className="size-3.5" />
                        Pickup di outlet · tanpa antar
                    </Badge>
                </div>

                {/* Tabs */}
                <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-border/70 bg-muted/40 p-1 sm:flex">
                    {tabs.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => gantiTab(item.key)}
                            className={cn(
                                'flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition sm:flex-1',
                                activeTab === item.key
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <item.icon className="size-4" />
                            {item.label}
                            {(item.badge ?? 0) > 0 && (
                                <span className="rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Ringkasan */}
                {activeTab === 'ringkasan' && (
                    <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
                        <div className="space-y-5">
                            {activeOrder ? (
                                <Card className="overflow-hidden border-emerald-200/60 p-0 shadow-lg shadow-emerald-950/5 dark:border-emerald-900/60">
                                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 px-5 py-5 text-white sm:px-6">
                                        <div className="pointer-events-none absolute -top-10 -right-6 size-40 rounded-full bg-white/10 blur-2xl" />
                                        <div className="relative flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-100 uppercase">
                                                    Pesanan aktif
                                                </p>
                                                <h2 className="mt-1 text-lg font-bold">
                                                    {activeOrder.status_label}
                                                </h2>
                                                <p className="mt-0.5 text-xs text-emerald-50/80">
                                                    {activeOrder.kode} ·{' '}
                                                    {activeOrder.tanggal_format}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl bg-white/15 px-4 py-2 text-center backdrop-blur">
                                                <p className="text-[10px] font-semibold tracking-widest text-emerald-100 uppercase">
                                                    Antrian
                                                </p>
                                                <p className="text-2xl font-extrabold tracking-tight">
                                                    {activeOrder.antrian_format}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="relative mt-5 grid grid-cols-4 gap-1">
                                            {LANGKAH.map((langkah, index) => {
                                                const posisi =
                                                    LANGKAH.findIndex(
                                                        (item) =>
                                                            item.status ===
                                                            activeOrder.status,
                                                    );
                                                const selesai = index <= posisi;
                                                const aktif = index === posisi;

                                                return (
                                                    <div
                                                        key={langkah.status}
                                                        className="flex flex-col items-center gap-1.5 text-center"
                                                    >
                                                        <span
                                                            className={cn(
                                                                'flex size-8 items-center justify-center rounded-full border transition',
                                                                selesai
                                                                    ? 'border-white/30 bg-white text-emerald-700'
                                                                    : 'border-white/25 bg-white/10 text-white/60',
                                                                aktif &&
                                                                    'ring-2 ring-white/40',
                                                            )}
                                                        >
                                                            <langkah.icon className="size-4" />
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                'text-[10px] leading-tight',
                                                                selesai
                                                                    ? 'font-semibold text-white'
                                                                    : 'text-white/60',
                                                            )}
                                                        >
                                                            {langkah.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-5 sm:p-6">
                                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="size-4 text-emerald-600 dark:text-emerald-400" />
                                                Estimasi siap{' '}
                                                {formatJam(
                                                    activeOrder.estimasi_siap_at,
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Store className="size-4 text-emerald-600 dark:text-emerald-400" />
                                                Ambil oleh{' '}
                                                {activeOrder.nama_pengambil}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-2">
                                            {activeOrder.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between gap-3 text-sm"
                                                >
                                                    <span className="min-w-0 truncate">
                                                        {item.jumlah}×{' '}
                                                        {item.nama_menu}
                                                    </span>
                                                    <span className="shrink-0 font-medium">
                                                        {item.subtotal_format}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-2.5">
                                            <span className="text-sm font-medium">
                                                Total{' '}
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    (
                                                    {
                                                        activeOrder.metode_pembayaran_label
                                                    }
                                                    )
                                                </span>
                                            </span>
                                            <span className="font-bold">
                                                {activeOrder.total_format}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    gantiTab('pesanan')
                                                }
                                                className="h-10 flex-1 gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                            >
                                                Lihat status lengkap
                                                <ArrowRight className="size-4" />
                                            </Button>
                                            {activeOrder.status ===
                                                'menunggu' && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-10 rounded-xl"
                                                        >
                                                            Batalkan
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Batalkan
                                                                pesanan?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Porsi akan
                                                                dikembalikan ke
                                                                menu. Tindakan
                                                                ini tidak bisa
                                                                diurungkan.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Tidak
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    router.post(
                                                                        `/pesanan/${activeOrder.id}/batal`,
                                                                        {},
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
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
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <Card className="flex flex-col items-center justify-center gap-3 border-dashed p-10 text-center">
                                    <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
                                        <ChefHat className="size-7" />
                                    </span>
                                    <div>
                                        <p className="font-semibold">
                                            Belum ada pesanan aktif
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Yuk pilih menu, pesan, lalu ambil
                                            saat siap. Tanpa biaya antar.
                                        </p>
                                    </div>
                                    <Button
                                        asChild
                                        className="mt-1 h-10 gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                    >
                                        <Link href="/home">
                                            <UtensilsCrossed className="size-4" />
                                            Pesan sekarang
                                        </Link>
                                    </Button>
                                </Card>
                            )}

                            {/* Riwayat pesanan terakhir */}
                            <Card className="p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-semibold">
                                            Pesanan terakhir
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Pantau status dan nomor antrian.
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => gantiTab('pesanan')}
                                        className="gap-1 text-emerald-700 hover:text-emerald-800 dark:text-emerald-300"
                                    >
                                        Semua
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>

                                <div className="mt-3 divide-y divide-border/70">
                                    {orders.slice(0, 4).map((order) => (
                                        <button
                                            key={order.id}
                                            type="button"
                                            onClick={() => setDetail(order)}
                                            className="flex w-full items-center gap-3 py-2.5 text-left transition hover:opacity-80"
                                        >
                                            <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-muted text-[10px] font-semibold text-muted-foreground">
                                                <span className="text-[8px] uppercase">
                                                    A
                                                </span>
                                                <span className="text-xs font-bold text-foreground">
                                                    {String(
                                                        order.nomor_antrian,
                                                    ).padStart(3, '0')}
                                                </span>
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {order.kode}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.tanggal_format} ·{' '}
                                                    {order.items.length} item ·{' '}
                                                    {order.total_format}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'shrink-0 text-[10px]',
                                                    STATUS_BADGE[order.status],
                                                )}
                                            >
                                                {order.status_label}
                                            </Badge>
                                        </button>
                                    ))}
                                    {orders.length === 0 && (
                                        <p className="py-6 text-center text-sm text-muted-foreground">
                                            Belum ada riwayat pesanan.
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar ringkasan */}
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    {
                                        icon: ClipboardList,
                                        value: stats.totalPesanan,
                                        label: 'Total pesanan',
                                    },
                                    {
                                        icon: ChefHat,
                                        value: stats.pesananAktif,
                                        label: 'Pesanan aktif',
                                    },
                                    {
                                        icon: Wallet,
                                        value: formatRupiah(stats.totalBelanja),
                                        label: 'Total belanja',
                                    },
                                    {
                                        icon: ShoppingBag,
                                        value: stats.totalItemKeranjang,
                                        label: 'Item di keranjang',
                                    },
                                ].map((item) => (
                                    <Card
                                        key={item.label}
                                        className="gap-1 p-4"
                                    >
                                        <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                            <item.icon className="size-4" />
                                        </span>
                                        <p className="mt-2 truncate text-lg font-extrabold tracking-tight">
                                            {item.value}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {item.label}
                                        </p>
                                    </Card>
                                ))}
                            </div>

                            <Card className="p-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">
                                        Pembayaran terakhir
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => gantiTab('pembayaran')}
                                        className="gap-1 text-emerald-700 hover:text-emerald-800 dark:text-emerald-300"
                                    >
                                        Riwayat
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                                <div className="mt-3 space-y-2.5">
                                    {payments.slice(0, 3).map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2.5"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-medium">
                                                    {payment.order?.kode ??
                                                        payment.kode}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {formatTanggal(
                                                        payment.created_at,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold">
                                                    {payment.jumlah_format}
                                                </p>
                                                <p
                                                    className={cn(
                                                        'text-[10px] font-medium',
                                                        payment.status ===
                                                            'berhasil'
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : payment.status ===
                                                                'gagal'
                                                              ? 'text-red-600 dark:text-red-400'
                                                              : 'text-amber-600 dark:text-amber-400',
                                                    )}
                                                >
                                                    {payment.status_label}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {payments.length === 0 && (
                                        <p className="py-4 text-center text-sm text-muted-foreground">
                                            Belum ada pembayaran.
                                        </p>
                                    )}
                                </div>
                            </Card>

                            <Card className="border-emerald-200/60 bg-emerald-50/50 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                    <MapPin className="size-4" />
                                    <h3 className="text-sm font-semibold">
                                        Info pickup
                                    </h3>
                                </div>
                                <ul className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
                                    <li>
                                        Datang saat status pesanan{' '}
                                        <strong>siap diambil</strong>.
                                    </li>
                                    <li>
                                        Tunjukkan kode pesanan atau nomor
                                        antrian ke kasir.
                                    </li>
                                    <li>
                                        Pembayaran dilakukan saat mengambil
                                        pesanan.
                                    </li>
                                </ul>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Keranjang */}
                {activeTab === 'keranjang' && (
                    <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
                        <div className="space-y-4">
                            {cartItems.length === 0 ? (
                                <Card className="flex flex-col items-center justify-center gap-3 border-dashed p-12 text-center">
                                    <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                        <ShoppingBag className="size-7" />
                                    </span>
                                    <div>
                                        <p className="font-semibold">
                                            Keranjang masih kosong
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Pilih menu favoritmu, nanti ambil
                                            sendiri di outlet.
                                        </p>
                                    </div>
                                    <Button
                                        asChild
                                        className="mt-1 h-10 gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                    >
                                        <Link href="/home">
                                            <UtensilsCrossed className="size-4" />
                                            Lihat menu
                                        </Link>
                                    </Button>
                                </Card>
                            ) : (
                                <>
                                    <Card className="p-0">
                                        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
                                            <div>
                                                <h2 className="font-semibold">
                                                    Keranjang
                                                </h2>
                                                <p className="text-xs text-muted-foreground">
                                                    {stats.totalItemKeranjang}{' '}
                                                    item dipilih
                                                </p>
                                            </div>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-1.5 text-red-600 hover:text-red-700 dark:text-red-400"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                        Kosongkan
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Kosongkan keranjang?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Semua menu di
                                                            keranjang akan
                                                            dihapus.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            Batal
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                router.delete(
                                                                    '/keranjang',
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                )
                                                            }
                                                            className="bg-red-600 text-white hover:bg-red-700"
                                                        >
                                                            Ya, kosongkan
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>

                                        <div className="divide-y divide-border/70">
                                            {cartItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex gap-3 p-4 sm:gap-4 sm:p-5"
                                                >
                                                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted sm:size-20">
                                                        {item.masakan
                                                            ?.foto_url ? (
                                                            <img
                                                                src={
                                                                    item.masakan
                                                                        .foto_url
                                                                }
                                                                alt={
                                                                    item.masakan
                                                                        .nama
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-2xl">
                                                                {item.masakan
                                                                    ?.kategori
                                                                    ?.icon ??
                                                                    '🍱'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-semibold sm:text-base">
                                                                    {
                                                                        item
                                                                            .masakan
                                                                            ?.nama
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        item
                                                                            .masakan
                                                                            ?.kategori
                                                                            ?.nama
                                                                    }{' '}
                                                                    ·{' '}
                                                                    {
                                                                        item
                                                                            .masakan
                                                                            ?.harga_format
                                                                    }
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    hapusItem(
                                                                        item,
                                                                    )
                                                                }
                                                                disabled={
                                                                    memproses ===
                                                                    item.masakan_id
                                                                }
                                                                className="rounded-md p-1 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                                                                aria-label={`Hapus ${item.masakan?.nama}`}
                                                            >
                                                                <X className="size-4" />
                                                            </button>
                                                        </div>

                                                        <div className="mt-2.5 flex items-center justify-between gap-2">
                                                            <div className="inline-flex items-center rounded-lg border border-border/80">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        ubahJumlah(
                                                                            item,
                                                                            item.jumlah -
                                                                                1,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        item.jumlah <=
                                                                            1 ||
                                                                        memproses ===
                                                                            item.masakan_id
                                                                    }
                                                                    className="flex size-8 items-center justify-center rounded-l-lg transition hover:bg-muted disabled:opacity-40"
                                                                    aria-label="Kurangi jumlah"
                                                                >
                                                                    <Minus className="size-3.5" />
                                                                </button>
                                                                <span className="w-8 text-center text-sm font-semibold">
                                                                    {
                                                                        item.jumlah
                                                                    }
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        ubahJumlah(
                                                                            item,
                                                                            item.jumlah +
                                                                                1,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        memproses ===
                                                                            item.masakan_id ||
                                                                        item.jumlah >=
                                                                            (item
                                                                                .masakan
                                                                                ?.jumlah_porsi ??
                                                                                0)
                                                                    }
                                                                    className="flex size-8 items-center justify-center rounded-r-lg transition hover:bg-muted disabled:opacity-40"
                                                                    aria-label="Tambah jumlah"
                                                                >
                                                                    <Plus className="size-3.5" />
                                                                </button>
                                                            </div>
                                                            <span className="text-sm font-bold">
                                                                {
                                                                    item.subtotal_format
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>

                                    <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
                                        <MapPin className="size-3.5" />
                                        Ambil sendiri di outlet UmiqFood. Tidak
                                        ada biaya antar.
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Checkout */}
                        <div>
                            <Card className="p-5 sm:p-6">
                                <div className="flex items-center gap-2">
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                        <PackageCheck className="size-4.5" />
                                    </span>
                                    <div>
                                        <h2 className="font-semibold">
                                            Ringkasan pesanan
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Pickup · bayar saat ambil
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>
                                            {formatRupiah(totalKeranjang)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Biaya antar</span>
                                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                            Gratis (pickup)
                                        </span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between text-base font-bold">
                                        <span>Total</span>
                                        <span>
                                            {formatRupiah(totalKeranjang)}
                                        </span>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                {cartItems.length === 0 ? (
                                    <p className="rounded-xl bg-muted/50 px-3 py-3 text-center text-sm text-muted-foreground">
                                        Tambahkan menu dulu untuk checkout.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="nama_pengambil">
                                                Nama pengambil
                                            </Label>
                                            <Input
                                                id="nama_pengambil"
                                                value={
                                                    checkout.data.nama_pengambil
                                                }
                                                onChange={(event) =>
                                                    checkout.setData(
                                                        'nama_pengambil',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Nama yang akan mengambil"
                                                className="h-10 rounded-xl"
                                            />
                                            {checkout.errors.nama_pengambil && (
                                                <p className="text-xs text-red-600">
                                                    {
                                                        checkout.errors
                                                            .nama_pengambil
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="no_hp">
                                                Nomor HP
                                            </Label>
                                            <Input
                                                id="no_hp"
                                                type="tel"
                                                value={checkout.data.no_hp}
                                                onChange={(event) =>
                                                    checkout.setData(
                                                        'no_hp',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="08xxxxxxxxxx"
                                                className="h-10 rounded-xl"
                                            />
                                            {checkout.errors.no_hp && (
                                                <p className="text-xs text-red-600">
                                                    {checkout.errors.no_hp}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label>Metode pembayaran</Label>
                                            <div className="grid gap-2">
                                                {METODE.map((metode) => (
                                                    <button
                                                        key={metode.value}
                                                        type="button"
                                                        onClick={() =>
                                                            checkout.setData(
                                                                'metode_pembayaran',
                                                                metode.value,
                                                            )
                                                        }
                                                        className={cn(
                                                            'flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition',
                                                            checkout.data
                                                                .metode_pembayaran ===
                                                                metode.value
                                                                ? 'border-emerald-500 bg-emerald-50/70 dark:border-emerald-700 dark:bg-emerald-950/40'
                                                                : 'border-border/80 hover:border-emerald-300 dark:hover:border-emerald-800',
                                                        )}
                                                    >
                                                        <metode.icon
                                                            className={cn(
                                                                'mt-0.5 size-4 shrink-0',
                                                                checkout.data
                                                                    .metode_pembayaran ===
                                                                    metode.value
                                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                                    : 'text-muted-foreground',
                                                            )}
                                                        />
                                                        <span>
                                                            <span className="block text-xs font-semibold">
                                                                {metode.label}
                                                            </span>
                                                            <span className="block text-[11px] text-muted-foreground">
                                                                {
                                                                    metode.description
                                                                }
                                                            </span>
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                            {checkout.errors
                                                .metode_pembayaran && (
                                                <p className="text-xs text-red-600">
                                                    {
                                                        checkout.errors
                                                            .metode_pembayaran
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="catatan">
                                                Catatan{' '}
                                                <span className="font-normal text-muted-foreground">
                                                    (opsional)
                                                </span>
                                            </Label>
                                            <textarea
                                                id="catatan"
                                                value={checkout.data.catatan}
                                                onChange={(event) =>
                                                    checkout.setData(
                                                        'catatan',
                                                        event.target.value,
                                                    )
                                                }
                                                rows={2}
                                                placeholder="Contoh: sambal dipisah, tanpa acar..."
                                                className="w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                                            />
                                            {checkout.errors.catatan && (
                                                <p className="text-xs text-red-600">
                                                    {checkout.errors.catatan}
                                                </p>
                                            )}
                                        </div>

                                        {(
                                            checkout.errors as Record<
                                                string,
                                                string | undefined
                                            >
                                        ).keranjang && (
                                            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                                {
                                                    (
                                                        checkout.errors as Record<
                                                            string,
                                                            string | undefined
                                                        >
                                                    ).keranjang
                                                }
                                            </p>
                                        )}

                                        <Button
                                            type="button"
                                            onClick={kirimCheckout}
                                            disabled={
                                                checkout.processing ||
                                                cartItems.length === 0
                                            }
                                            className="h-11 w-full gap-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                                        >
                                            {checkout.processing
                                                ? 'Memproses...'
                                                : 'Buat pesanan pickup'}
                                            <ArrowRight className="size-4" />
                                        </Button>
                                        <p className="text-center text-[11px] text-muted-foreground">
                                            Nomor antrian muncul setelah pesanan
                                            dibuat.
                                        </p>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                )}

                {/* Pesanan */}
                {activeTab === 'pesanan' && (
                    <div className="mt-6">
                        <div className="flex flex-wrap gap-2">
                            {[
                                ['semua', 'Semua'],
                                ['aktif', 'Aktif'],
                                ['selesai', 'Selesai'],
                                ['dibatalkan', 'Dibatalkan'],
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() =>
                                        setFilterPesanan(
                                            value as typeof filterPesanan,
                                        )
                                    }
                                    className={cn(
                                        'rounded-full border px-4 py-1.5 text-sm font-medium transition',
                                        filterPesanan === value
                                            ? 'border-emerald-600 bg-emerald-600 text-white'
                                            : 'border-border/80 bg-card text-muted-foreground hover:border-emerald-300',
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 space-y-3">
                            {pesananTersaring.length === 0 ? (
                                <Card className="flex flex-col items-center justify-center gap-3 border-dashed p-12 text-center">
                                    <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                        <History className="size-7" />
                                    </span>
                                    <div>
                                        <p className="font-semibold">
                                            Belum ada pesanan di kategori ini
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Pesanan yang kamu buat akan muncul
                                            di sini.
                                        </p>
                                    </div>
                                    <Button
                                        asChild
                                        className="mt-1 h-10 gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                    >
                                        <Link href="/home">
                                            <UtensilsCrossed className="size-4" />
                                            Pesan menu
                                        </Link>
                                    </Button>
                                </Card>
                            ) : (
                                pesananTersaring.map((order) => (
                                    <Card
                                        key={order.id}
                                        className="p-0 transition hover:border-emerald-300/70 dark:hover:border-emerald-800"
                                    >
                                        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                                            <div className="flex items-center gap-3">
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
                                                    </div>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {order.tanggal_format} ·{' '}
                                                        {formatJam(
                                                            order.created_at,
                                                        )}{' '}
                                                        · {order.items.length}{' '}
                                                        item
                                                    </p>
                                                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                                        {order.items
                                                            .map(
                                                                (item) =>
                                                                    `${item.jumlah}× ${item.nama_menu}`,
                                                            )
                                                            .join(', ')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3 sm:ml-auto sm:border-t-0 sm:pt-0">
                                                <div className="text-left sm:text-right">
                                                    <p className="text-sm font-bold">
                                                        {order.total_format}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {
                                                            order.metode_pembayaran_label
                                                        }
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {order.status ===
                                                        'menunggu' && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-9 rounded-lg text-xs"
                                                                >
                                                                    Batalkan
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        Batalkan
                                                                        pesanan?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Porsi
                                                                        akan
                                                                        dikembalikan
                                                                        ke menu.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>
                                                                        Tidak
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() =>
                                                                            router.post(
                                                                                `/pesanan/${order.id}/batal`,
                                                                                {},
                                                                                {
                                                                                    preserveScroll: true,
                                                                                },
                                                                            )
                                                                        }
                                                                        className="bg-red-600 text-white hover:bg-red-700"
                                                                    >
                                                                        Ya,
                                                                        batalkan
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            setDetail(order)
                                                        }
                                                        className="h-9 gap-1 rounded-lg text-xs"
                                                    >
                                                        Detail
                                                        <ChevronRight className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Pembayaran */}
                {activeTab === 'pembayaran' && (
                    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.6fr]">
                        <Card className="h-fit overflow-hidden border-0 bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white sm:p-6">
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-100 uppercase">
                                Total sudah dibayar
                            </p>
                            <p className="mt-2 text-3xl font-extrabold tracking-tight">
                                {formatRupiah(totalLunas)}
                            </p>
                            <p className="mt-1 text-xs text-emerald-50/80">
                                {
                                    payments.filter(
                                        (p) => p.status === 'berhasil',
                                    ).length
                                }{' '}
                                pembayaran lunas
                            </p>

                            <div className="mt-6 space-y-2 border-t border-white/20 pt-4 text-xs text-emerald-50/90">
                                <div className="flex items-center gap-2">
                                    <Banknote className="size-3.5" />
                                    Bayar tunai atau QRIS saat ambil
                                </div>
                                <div className="flex items-center gap-2">
                                    <Store className="size-3.5" />
                                    Pembayaran dicatat oleh kasir
                                </div>
                            </div>
                        </Card>

                        <Card className="p-0">
                            <div className="border-b border-border/70 px-5 py-4">
                                <h2 className="font-semibold">
                                    Riwayat pembayaran
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Semua transaksi pesanan pickup.
                                </p>
                            </div>

                            {payments.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                                    <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                        <ReceiptText className="size-5" />
                                    </span>
                                    <p className="font-medium">
                                        Belum ada pembayaran
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Pembayaran muncul setelah pesanan
                                        pertama dibuat.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/70">
                                    {payments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="flex items-center gap-3 px-4 py-3.5 sm:px-5"
                                        >
                                            <span
                                                className={cn(
                                                    'flex size-10 shrink-0 items-center justify-center rounded-xl',
                                                    payment.metode === 'qris'
                                                        ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300'
                                                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300',
                                                )}
                                            >
                                                {payment.metode === 'qris' ? (
                                                    <QrCode className="size-5" />
                                                ) : (
                                                    <Banknote className="size-5" />
                                                )}
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {payment.order?.kode ??
                                                        payment.kode}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {payment.metode_label} ·{' '}
                                                    {formatTanggal(
                                                        payment.dibayar_at ??
                                                            payment.created_at,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-bold">
                                                    {payment.jumlah_format}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'mt-0.5 text-[10px]',
                                                        payment.status ===
                                                            'berhasil'
                                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                            : payment.status ===
                                                                'gagal'
                                                              ? STATUS_BADGE.dibatalkan
                                                              : STATUS_BADGE.menunggu,
                                                    )}
                                                >
                                                    {payment.status_label}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </div>

            {/* Detail pesanan */}
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
                                    {detail.tanggal_format} · Antrian{' '}
                                    {detail.antrian_format} ·{' '}
                                    {detail.metode_pembayaran_label}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="rounded-xl border border-border/70 p-3.5">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <MapPin className="size-4 text-emerald-600 dark:text-emerald-400" />
                                        {detail.nama_pengambil}
                                        <span className="text-muted-foreground">
                                            · {detail.no_hp}
                                        </span>
                                    </div>
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

                                <div className="rounded-xl bg-muted/40 p-3.5 text-xs text-muted-foreground">
                                    <p className="flex items-center gap-1.5 font-medium text-foreground">
                                        <Clock className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                        Status pesanan
                                    </p>
                                    <p className="mt-1">
                                        {detail.status === 'menunggu' &&
                                            'Pesanan diterima, menunggu konfirmasi dapur.'}
                                        {detail.status === 'dimasak' &&
                                            'Masakan sedang disiapkan.'}
                                        {detail.status === 'siap' &&
                                            'Pesanan siap diambil di outlet.'}
                                        {detail.status === 'selesai' &&
                                            'Pesanan sudah diambil dan dibayar.'}
                                        {detail.status === 'dibatalkan' &&
                                            'Pesanan dibatalkan dan porsi dikembalikan.'}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

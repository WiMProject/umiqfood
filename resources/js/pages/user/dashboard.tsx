import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    CalendarDays,
    Check,
    Banknote,
    ChefHat,
    ChevronRight,
    ClipboardList,
    Clock,
    Copy,
    History,
    LoaderCircle,
    MapPin,
    Megaphone,
    Minus,
    PackageCheck,
    Plus,
    QrCode,
    ReceiptText,
    RotateCcw,
    ShoppingBag,
    Sparkles,
    Store,
    TicketPercent,
    Trash2,
    UtensilsCrossed,
    Wallet,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from 'cn';
import {
    EmptyState,
    FilterChip,
    OrderProgress,
    OrderStatusBadge,
    PaymentStatusBadge,
    QueueBadge,
    SectionHeading,
} from '@/components/user-ui';
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
    Kupon,
    KuponPreview,
    MetodePembayaran,
    Order,
    Payment,
    Pengumuman,
} from '@/types';

interface Props {
    tab: string;
    cartItems: CartItem[];
    orders: Order[];
    payments: Payment[];
    activeOrder: Order | null;
    promos: Pengumuman[];
    kupons: Kupon[];
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

function formatPeriodePromo(
    mulai: string | null,
    selesai: string | null,
): string | null {
    const bagianTanggal = (value: string) => value.trim().slice(0, 10);
    const format = (value: string) =>
        new Date(`${bagianTanggal(value)}T00:00:00`).toLocaleDateString(
            'id-ID',
            {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            },
        );

    if (mulai && selesai) {
        return `${format(mulai)} – ${format(selesai)}`;
    }

    if (mulai) {
        return `Mulai ${format(mulai)}`;
    }

    if (selesai) {
        return `Sampai ${format(selesai)}`;
    }

    return null;
}

export default function UserDashboard() {
    const {
        tab,
        cartItems,
        orders,
        payments,
        activeOrder,
        promos,
        kupons,
        stats,
        auth,
    } = usePage<Props>().props;
    const ringkasanOrder =
        activeOrder ??
        orders.find((order) => order.status === 'selesai') ??
        null;

    const [activeTab, setActiveTab] = useState<TabKey>(
        TAB_VALID.includes(tab as TabKey) ? (tab as TabKey) : 'ringkasan',
    );
    const [memproses, setMemproses] = useState<number | null>(null);
    const [detail, setDetail] = useState<Order | null>(null);
    const [filterPesanan, setFilterPesanan] = useState<
        'semua' | 'aktif' | 'selesai' | 'dibatalkan'
    >('semua');
    const [kuponPreview, setKuponPreview] = useState<KuponPreview | null>(null);
    const [kuponError, setKuponError] = useState<string | null>(null);
    const [cekKuponProcessing, setCekKuponProcessing] = useState(false);
    const [promoTerpilih, setPromoTerpilih] = useState<Pengumuman | null>(null);
    const [kodeTersalin, setKodeTersalin] = useState<string | null>(null);

    const salinKode = async (kode: string) => {
        try {
            await navigator.clipboard.writeText(kode);
            setKodeTersalin(kode);
            window.setTimeout(() => setKodeTersalin(null), 2000);
        } catch {
            setKodeTersalin(null);
        }
    };

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
        kode_kupon: string;
    }>({
        nama_pengambil: auth.user?.name ?? '',
        no_hp: '',
        metode_pembayaran: 'cash',
        catatan: '',
        kode_kupon: '',
    });

    const totalKeranjang = useMemo(
        () => cartItems.reduce((total, item) => total + item.subtotal, 0),
        [cartItems],
    );

    const diskonAktif =
        kuponPreview && kuponPreview.subtotal === totalKeranjang
            ? kuponPreview.diskon
            : 0;
    const totalSetelahDiskon = Math.max(0, totalKeranjang - diskonAktif);

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

    const jumlahFilterPesanan = useMemo(
        () => ({
            semua: orders.length,
            aktif: orders.filter((order) =>
                ['menunggu', 'dimasak', 'siap'].includes(order.status),
            ).length,
            selesai: orders.filter((order) => order.status === 'selesai')
                .length,
            dibatalkan: orders.filter((order) => order.status === 'dibatalkan')
                .length,
        }),
        [orders],
    );

    const totalLunas = useMemo(
        () =>
            payments
                .filter((payment) => payment.status === 'berhasil')
                .reduce((total, payment) => total + payment.jumlah, 0),
        [payments],
    );

    const lupakanKupon = () => {
        setKuponPreview(null);
        setKuponError(null);
        checkout.setData('kode_kupon', '');
        checkout.clearErrors('kode_kupon');
    };

    const ubahJumlah = (item: CartItem, jumlah: number) => {
        if (jumlah < 1) {
            return;
        }

        lupakanKupon();
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
        lupakanKupon();
        setMemproses(item.masakan_id);
        router.delete(`/keranjang/${item.masakan_id}`, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setMemproses(null),
        });
    };

    const setDataKupon = (value: string) => {
        checkout.setData('kode_kupon', value.toUpperCase());
        setKuponPreview(null);
        setKuponError(null);
        checkout.clearErrors('kode_kupon');
    };

    const terapkanKupon = async () => {
        const kode = checkout.data.kode_kupon.trim();

        if (kode === '') {
            setKuponError('Masukkan kode kupon dulu.');
            return;
        }

        setCekKuponProcessing(true);
        setKuponError(null);

        try {
            const xsrf = document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='))
                ?.slice('XSRF-TOKEN='.length);

            const response = await fetch('/kupon/cek', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(xsrf
                        ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) }
                        : {}),
                },
                body: JSON.stringify({ kode }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                setKuponPreview(null);
                setKuponError(
                    payload?.message ??
                        'Kupon tidak bisa dipakai untuk pesanan ini.',
                );

                return;
            }

            const hasil = payload as KuponPreview;
            setKuponPreview(hasil);
            checkout.setData('kode_kupon', hasil.kode);
            checkout.clearErrors('kode_kupon');
        } catch {
            setKuponPreview(null);
            setKuponError('Gagal memeriksa kupon. Coba lagi sebentar.');
        } finally {
            setCekKuponProcessing(false);
        }
    };

    const terapkanLangsung = async (kode: string) => {
        setDataKupon(kode);
        await terapkanKupon();
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
            onSuccess: () => {
                checkout.reset('catatan', 'kode_kupon');
                setKuponPreview(null);
                setKuponError(null);
            },
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
                <SectionHeading
                    eyebrow="Akun saya"
                    title="Pesanan & pembayaran"
                    description="Semua pesanan pickup, nomor antrian, dan riwayat pembayaranmu ada di sini."
                    icon={ClipboardList}
                    headingLevel="h1"
                    action={
                        <Badge
                            variant="outline"
                            className="gap-1.5 self-start border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 sm:self-auto dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                        >
                            <MapPin className="size-3.5" />
                            Pickup di outlet · tanpa antar
                        </Badge>
                    }
                />

                {/* Tabs */}
                <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl border border-border/70 bg-muted/40 p-1.5 sm:flex">
                    {tabs.map((item) => {
                        const aktif = activeTab === item.key;

                        return (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => gantiTab(item.key)}
                                aria-current={aktif ? 'page' : undefined}
                                className={cn(
                                    'group flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition',
                                    aktif
                                        ? 'bg-card text-foreground shadow-sm ring-1 ring-emerald-500/15'
                                        : 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex size-7 items-center justify-center rounded-lg transition',
                                        aktif
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-muted text-muted-foreground group-hover:text-foreground',
                                    )}
                                >
                                    <item.icon className="size-4" />
                                </span>
                                {item.label}
                                {(item.badge ?? 0) > 0 && (
                                    <span className="flex min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Ringkasan */}
                {activeTab === 'ringkasan' && (
                    <>
                        {promos.length > 0 && (
                            <section className="mt-6">
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <div>
                                        <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-600 uppercase dark:text-emerald-400">
                                            Info terkini
                                        </p>
                                        <h2 className="text-base font-bold tracking-tight">
                                            Promo & berita
                                        </h2>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {promos.map((promo) => {
                                        const periode = formatPeriodePromo(
                                            promo.mulai,
                                            promo.selesai,
                                        );

                                        return (
                                            <Card
                                                key={promo.id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() =>
                                                    setPromoTerpilih(promo)
                                                }
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === 'Enter' ||
                                                        event.key === ' '
                                                    ) {
                                                        event.preventDefault();
                                                        setPromoTerpilih(promo);
                                                    }
                                                }}
                                                className="cursor-pointer overflow-hidden rounded-2xl border-border/70 p-0 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300/70 hover:shadow-lg dark:hover:border-emerald-800"
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
                                                        <Badge
                                                            className={
                                                                promo.jenis ===
                                                                'promo'
                                                                    ? 'border-0 bg-emerald-600 text-white'
                                                                    : 'border-0 bg-slate-700 text-white'
                                                            }
                                                        >
                                                            {promo.jenis ===
                                                            'promo' ? (
                                                                <Megaphone className="size-3" />
                                                            ) : (
                                                                <BadgeCheck className="size-3" />
                                                            )}
                                                            {promo.jenis_label}
                                                        </Badge>
                                                        {periode && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                                                <CalendarDays className="size-3" />
                                                                {periode}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="mt-2 text-sm font-bold tracking-tight">
                                                        {promo.judul}
                                                    </h3>
                                                    {promo.ringkasan && (
                                                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                            {promo.ringkasan}
                                                        </p>
                                                    )}

                                                    {promo.kode_kupon_aktif && (
                                                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/70 p-2 dark:border-emerald-800 dark:bg-emerald-950/40">
                                                            <TicketPercent className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                                            <span className="min-w-0 flex-1 truncate font-mono text-xs font-bold text-emerald-900 dark:text-emerald-100">
                                                                {
                                                                    promo.kode_kupon_aktif
                                                                }
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={(
                                                                    event,
                                                                ) => {
                                                                    event.stopPropagation();
                                                                    void salinKode(
                                                                        promo.kode_kupon_aktif as string,
                                                                    );
                                                                }}
                                                                className="h-7 shrink-0 gap-1 rounded-lg border-emerald-300 bg-white text-[10px] text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                                            >
                                                                {kodeTersalin ===
                                                                promo.kode_kupon_aktif ? (
                                                                    <>
                                                                        <Check className="size-3" />
                                                                        Tersalin
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="size-3" />
                                                                        Salin
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
                            <div className="space-y-5">
                                {ringkasanOrder ? (
                                    <Card className="overflow-hidden border-emerald-200/60 p-0 shadow-lg shadow-emerald-950/5 dark:border-emerald-900/60">
                                        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 px-5 py-5 text-white sm:px-6">
                                            <div className="pointer-events-none absolute -top-10 -right-6 size-40 rounded-full bg-white/10 blur-2xl" />
                                            <div className="relative flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-100 uppercase">
                                                        {ringkasanOrder.status ===
                                                        'selesai'
                                                            ? 'Pesanan selesai'
                                                            : 'Pesanan aktif'}
                                                    </p>
                                                    <h2 className="mt-1 text-lg font-bold">
                                                        {
                                                            ringkasanOrder.status_label
                                                        }
                                                    </h2>
                                                    <p className="mt-0.5 text-xs text-emerald-50/80">
                                                        {ringkasanOrder.kode} ·{' '}
                                                        {
                                                            ringkasanOrder.tanggal_format
                                                        }
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl bg-white/15 px-4 py-2 text-center backdrop-blur">
                                                    <p className="text-[10px] font-semibold tracking-widest text-emerald-100 uppercase">
                                                        Antrian
                                                    </p>
                                                    <p className="text-2xl font-extrabold tracking-tight">
                                                        {
                                                            ringkasanOrder.antrian_format
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative mt-5">
                                                <OrderProgress
                                                    status={
                                                        ringkasanOrder.status
                                                    }
                                                    tone="dark"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 p-5 sm:p-6">
                                            <div className="grid gap-2 text-sm sm:grid-cols-2">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Clock className="size-4 text-emerald-600 dark:text-emerald-400" />
                                                    Estimasi siap{' '}
                                                    {formatJam(
                                                        ringkasanOrder.estimasi_siap_at,
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Store className="size-4 text-emerald-600 dark:text-emerald-400" />
                                                    Ambil oleh{' '}
                                                    {
                                                        ringkasanOrder.nama_pengambil
                                                    }
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="space-y-2">
                                                {ringkasanOrder.items.map(
                                                    (item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center justify-between gap-3 text-sm"
                                                        >
                                                            <span className="min-w-0 truncate">
                                                                {item.jumlah}×{' '}
                                                                {item.nama_menu}
                                                            </span>
                                                            <span className="shrink-0 font-medium">
                                                                {
                                                                    item.subtotal_format
                                                                }
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-2.5">
                                                <span className="text-sm font-medium">
                                                    Total{' '}
                                                    <span className="text-xs font-normal text-muted-foreground">
                                                        (
                                                        {
                                                            ringkasanOrder.metode_pembayaran_label
                                                        }
                                                        )
                                                    </span>
                                                </span>
                                                <span className="font-bold">
                                                    {
                                                        ringkasanOrder.total_format
                                                    }
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
                                                {ringkasanOrder.status ===
                                                    'menunggu' && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger
                                                            asChild
                                                        >
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
                                                                    dikembalikan
                                                                    ke menu.
                                                                    Tindakan ini
                                                                    tidak bisa
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
                                                                            `/pesanan/${ringkasanOrder.id}/batal`,
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
                                                Yuk pilih menu, pesan, lalu
                                                ambil saat siap. Tanpa biaya
                                                antar.
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
                                                <QueueBadge
                                                    nomor={order.nomor_antrian}
                                                    small
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {order.kode}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {order.tanggal_format} ·{' '}
                                                        {order.items.length}{' '}
                                                        item ·{' '}
                                                        {order.total_format}
                                                    </p>
                                                </div>
                                                <OrderStatusBadge
                                                    status={order.status}
                                                    label={order.status_label}
                                                />
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
                                            value: formatRupiah(
                                                stats.totalBelanja,
                                            ),
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
                                            className="relative gap-1 overflow-hidden p-4"
                                        >
                                            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
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
                                            onClick={() =>
                                                gantiTab('pembayaran')
                                            }
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
                                                    <PaymentStatusBadge
                                                        status={payment.status}
                                                        label={
                                                            payment.status_label
                                                        }
                                                        className="mt-1"
                                                    />
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
                    </>
                )}

                {/* Keranjang */}
                {activeTab === 'keranjang' && (
                    <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
                        <div className="space-y-4">
                            {cartItems.length === 0 ? (
                                <EmptyState
                                    icon={ShoppingBag}
                                    title="Keranjang masih kosong"
                                    description="Pilih menu favoritmu, pesan sekarang, lalu ambil sendiri di outlet UmiqFood."
                                    action={
                                        <Button
                                            asChild
                                            className="h-10 gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                        >
                                            <Link href="/home">
                                                <UtensilsCrossed className="size-4" />
                                                Lihat menu
                                            </Link>
                                        </Button>
                                    }
                                />
                            ) : (
                                <>
                                    <Card className="overflow-hidden rounded-2xl p-0">
                                        <div className="relative overflow-hidden border-b border-border/70 bg-gradient-to-r from-emerald-50/80 via-emerald-50/30 to-transparent px-5 py-4 dark:from-emerald-950/30 dark:via-emerald-950/10 dark:to-transparent">
                                            <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/70" />
                                            <div className="relative flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/15 dark:text-emerald-300">
                                                        <ShoppingBag className="size-[18px]" />
                                                    </span>
                                                    <div>
                                                        <h2 className="font-semibold">
                                                            Keranjang
                                                        </h2>
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                stats.totalItemKeranjang
                                                            }{' '}
                                                            item dipilih · siap
                                                            diambil
                                                        </p>
                                                    </div>
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
                                                                Kosongkan
                                                                keranjang?
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
                                                                onClick={() => {
                                                                    lupakanKupon();
                                                                    router.delete(
                                                                        '/keranjang',
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    );
                                                                }}
                                                                className="bg-red-600 text-white hover:bg-red-700"
                                                            >
                                                                Ya, kosongkan
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>

                                        <div className="divide-y divide-border/70">
                                            {cartItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex gap-3 p-4 sm:gap-4 sm:p-5"
                                                >
                                                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted ring-1 ring-border/70 sm:size-20">
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
                                                            <div className="inline-flex items-center overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm">
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
                                                                    className="flex size-8 items-center justify-center rounded-l-lg transition hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
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
                                                                                ?.porsi_tersedia ??
                                                                                0)
                                                                    }
                                                                    className="flex size-8 items-center justify-center rounded-r-lg transition hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                                                                    aria-label="Tambah jumlah"
                                                                >
                                                                    <Plus className="size-3.5" />
                                                                </button>
                                                            </div>
                                                            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
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

                                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50/60 px-3.5 py-2.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-200">
                                        <MapPin className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                        Ambil sendiri di outlet UmiqFood. Tidak
                                        ada biaya antar.
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Checkout */}
                        <div className="lg:sticky lg:top-24">
                            <Card className="overflow-hidden rounded-2xl p-5 shadow-md shadow-emerald-950/5 sm:p-6">
                                <div className="relative -mx-5 -mt-5 mb-5 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-transparent sm:-mx-6 sm:-mt-6" />
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
                                    <Badge className="ml-auto border-0 bg-emerald-600 text-white">
                                        {cartItems.length} item
                                    </Badge>
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>
                                            {formatRupiah(totalKeranjang)}
                                        </span>
                                    </div>
                                    {diskonAktif > 0 && (
                                        <div className="flex justify-between font-medium text-emerald-700 dark:text-emerald-300">
                                            <span className="inline-flex items-center gap-1">
                                                <TicketPercent className="size-3.5" />
                                                Diskon{' '}
                                                {kuponPreview?.kode ?? ''}
                                            </span>
                                            <span>
                                                −{formatRupiah(diskonAktif)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Biaya antar</span>
                                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                            Gratis (pickup)
                                        </span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between text-base font-bold">
                                        <span>Total</span>
                                        <span className="text-emerald-700 dark:text-emerald-300">
                                            {formatRupiah(totalSetelahDiskon)}
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
                                            <Label
                                                htmlFor="kode_kupon"
                                                className="flex items-center gap-1.5"
                                            >
                                                <TicketPercent className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                                Punya kode kupon?
                                            </Label>

                                            {kuponPreview && diskonAktif > 0 ? (
                                                <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-300 bg-emerald-50/70 px-3 py-2.5 dark:border-emerald-800 dark:bg-emerald-950/40">
                                                    <div className="min-w-0">
                                                        <p className="font-mono text-sm font-bold text-emerald-800 dark:text-emerald-200">
                                                            {kuponPreview.kode}
                                                        </p>
                                                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                                                            Hemat{' '}
                                                            {formatRupiah(
                                                                kuponPreview.diskon,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={lupakanKupon}
                                                        className="h-8 shrink-0 gap-1 rounded-lg text-xs text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
                                                    >
                                                        <X className="size-3.5" />
                                                        Hapus
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="kode_kupon"
                                                        value={
                                                            checkout.data
                                                                .kode_kupon
                                                        }
                                                        onChange={(event) => {
                                                            setDataKupon(
                                                                event.target
                                                                    .value,
                                                            );
                                                        }}
                                                        placeholder="Contoh: HEMAT10"
                                                        autoComplete="off"
                                                        className="h-10 rounded-xl font-mono uppercase"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={terapkanKupon}
                                                        disabled={
                                                            cekKuponProcessing
                                                        }
                                                        className="h-10 shrink-0 gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                                                    >
                                                        {cekKuponProcessing ? (
                                                            <LoaderCircle className="size-4 animate-spin" />
                                                        ) : (
                                                            'Terapkan'
                                                        )}
                                                    </Button>
                                                </div>
                                            )}

                                            {!kuponPreview &&
                                                kupons.length > 0 && (
                                                    <div className="space-y-1.5">
                                                        <p className="text-[11px] font-medium text-muted-foreground">
                                                            Kupon tersedia:
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {kupons.map(
                                                                (kupon) => (
                                                                    <button
                                                                        key={
                                                                            kupon.id
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            void terapkanLangsung(
                                                                                kupon.kode,
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70"
                                                                    >
                                                                        <TicketPercent className="size-3" />
                                                                        {
                                                                            kupon.kode
                                                                        }
                                                                        <span className="font-normal text-emerald-600/80 dark:text-emerald-400/80">
                                                                            ·{' '}
                                                                            {kupon.tipe ===
                                                                            'persen'
                                                                                ? `${kupon.nilai}%`
                                                                                : formatRupiah(
                                                                                      kupon.nilai,
                                                                                  )}
                                                                        </span>
                                                                    </button>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {kuponError && (
                                                <p className="text-xs text-rose-600 dark:text-rose-400">
                                                    {kuponError}
                                                </p>
                                            )}
                                            {checkout.errors.kode_kupon && (
                                                <p className="text-xs text-rose-600 dark:text-rose-400">
                                                    {checkout.errors.kode_kupon}
                                                </p>
                                            )}
                                        </div>

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
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block text-xs font-semibold">
                                                                {metode.label}
                                                            </span>
                                                            <span className="block text-[11px] text-muted-foreground">
                                                                {
                                                                    metode.description
                                                                }
                                                            </span>
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                'ml-auto flex size-4 shrink-0 items-center justify-center rounded-full border',
                                                                checkout.data
                                                                    .metode_pembayaran ===
                                                                    metode.value
                                                                    ? 'border-emerald-600'
                                                                    : 'border-border',
                                                            )}
                                                        >
                                                            {checkout.data
                                                                .metode_pembayaran ===
                                                                metode.value && (
                                                                <span className="size-2 rounded-full bg-emerald-600" />
                                                            )}
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
                                        <Link
                                            href="/home"
                                            className="flex items-center justify-center gap-1 text-xs font-semibold text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-300"
                                        >
                                            Lanjut pilih menu
                                            <ArrowRight className="size-3.5" />
                                        </Link>
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
                                { value: 'semua', label: 'Semua' },
                                { value: 'aktif', label: 'Aktif' },
                                { value: 'selesai', label: 'Selesai' },
                                { value: 'dibatalkan', label: 'Dibatalkan' },
                            ].map(({ value, label }) => (
                                <FilterChip
                                    key={value}
                                    active={filterPesanan === value}
                                    onClick={() =>
                                        setFilterPesanan(
                                            value as typeof filterPesanan,
                                        )
                                    }
                                    count={
                                        jumlahFilterPesanan[
                                            value as keyof typeof jumlahFilterPesanan
                                        ]
                                    }
                                >
                                    {label}
                                </FilterChip>
                            ))}
                        </div>

                        <div className="mt-4 space-y-3">
                            {pesananTersaring.length === 0 ? (
                                <EmptyState
                                    icon={History}
                                    title="Belum ada pesanan di kategori ini"
                                    description="Pesanan yang kamu buat akan muncul di sini lengkap dengan nomor antrian dan statusnya."
                                    action={
                                        <Button
                                            asChild
                                            className="h-10 gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                        >
                                            <Link href="/home">
                                                <UtensilsCrossed className="size-4" />
                                                Pesan menu
                                            </Link>
                                        </Button>
                                    }
                                />
                            ) : (
                                pesananTersaring.map((order) => (
                                    <Card
                                        key={order.id}
                                        className="overflow-hidden rounded-2xl p-0 transition hover:border-emerald-300/70 dark:hover:border-emerald-800"
                                    >
                                        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                                            <div className="flex items-center gap-3">
                                                <QueueBadge
                                                    nomor={order.nomor_antrian}
                                                />
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-sm font-semibold">
                                                            {order.kode}
                                                        </p>
                                                        <OrderStatusBadge
                                                            status={
                                                                order.status
                                                            }
                                                            label={
                                                                order.status_label
                                                            }
                                                        />
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
                                                {order.status === 'selesai' && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.post(
                                                                `/pesanan/${order.id}/pesan-lagi`,
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                        className="h-9 gap-1 rounded-lg border-emerald-200 text-xs text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                                                    >
                                                        <RotateCcw className="size-3.5" />
                                                        Pesan lagi
                                                    </Button>
                                                )}
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

                                        <div className="border-t border-border/70 bg-muted/20 px-4 py-3 sm:px-5">
                                            <div className="mb-2 flex items-center justify-between gap-2">
                                                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Progres pesanan
                                                </p>
                                                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                                                    {order.status_label}
                                                </span>
                                            </div>
                                            <OrderProgress
                                                status={order.status}
                                                ringkas
                                            />
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
                        <Card className="relative isolate h-fit overflow-hidden border-0 bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white sm:p-6">
                            <div className="pointer-events-none absolute -top-12 -right-10 -z-10 size-40 rounded-full bg-white/10 blur-2xl" />
                            <div className="pointer-events-none absolute -bottom-16 left-6 -z-10 size-40 rounded-full bg-amber-300/10 blur-3xl" />
                            <p className="relative text-[11px] font-semibold tracking-[0.18em] text-emerald-100 uppercase">
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

                        <Card className="overflow-hidden rounded-2xl p-0">
                            <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                        <ReceiptText className="size-[18px]" />
                                    </span>
                                    <div>
                                        <h2 className="font-semibold">
                                            Riwayat pembayaran
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Semua transaksi pesanan pickup.
                                        </p>
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                                >
                                    {payments.length} transaksi
                                </Badge>
                            </div>

                            {payments.length === 0 ? (
                                <EmptyState
                                    icon={ReceiptText}
                                    title="Belum ada pembayaran"
                                    description="Pembayaran muncul setelah pesanan pertama dibuat dan dicatat oleh kasir."
                                    className="m-5 border-0 bg-transparent py-10"
                                />
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

                                            <div className="flex flex-col items-end gap-1.5">
                                                <p className="text-sm font-bold">
                                                    {payment.jumlah_format}
                                                </p>
                                                <PaymentStatusBadge
                                                    status={payment.status}
                                                    label={payment.status_label}
                                                />
                                                {payment.order?.id && (
                                                    <a
                                                        href={`/pesanan/${payment.order.id}/struk`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                                                    >
                                                        <ReceiptText className="size-3" />
                                                        Lihat struk
                                                    </a>
                                                )}
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
                                    <OrderStatusBadge
                                        status={detail.status}
                                        label={detail.status_label}
                                    />
                                </DialogTitle>
                                <DialogDescription>
                                    {detail.tanggal_format} · Antrian{' '}
                                    {detail.antrian_format} ·{' '}
                                    {detail.metode_pembayaran_label}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/25">
                                    <p className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-emerald-700 uppercase dark:text-emerald-300">
                                        Progres pesanan
                                    </p>
                                    <OrderProgress status={detail.status} />
                                </div>

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
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>
                                            {formatRupiah(detail.subtotal)}
                                        </span>
                                    </div>
                                    {detail.diskon > 0 && (
                                        <div className="flex justify-between text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                            <span>
                                                Diskon{' '}
                                                {detail.kode_kupon
                                                    ? `(${detail.kode_kupon})`
                                                    : ''}
                                            </span>
                                            <span>
                                                −{formatRupiah(detail.diskon)}
                                            </span>
                                        </div>
                                    )}
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

                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-9 w-full gap-1.5 rounded-xl text-xs"
                                >
                                    <a
                                        href={`/pesanan/${detail.id}/struk`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <ReceiptText className="size-3.5" />
                                        Cetak struk
                                    </a>
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Detail promo & berita */}
            <Dialog
                open={promoTerpilih !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPromoTerpilih(null);
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    {promoTerpilih && (
                        <>
                            <DialogHeader>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        className={
                                            promoTerpilih.jenis === 'promo'
                                                ? 'border-0 bg-emerald-600 text-white'
                                                : 'border-0 bg-slate-700 text-white'
                                        }
                                    >
                                        {promoTerpilih.jenis === 'promo' ? (
                                            <Megaphone className="size-3" />
                                        ) : (
                                            <BadgeCheck className="size-3" />
                                        )}
                                        {promoTerpilih.jenis_label}
                                    </Badge>
                                    {formatPeriodePromo(
                                        promoTerpilih.mulai,
                                        promoTerpilih.selesai,
                                    ) && (
                                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                            <CalendarDays className="size-3" />
                                            {formatPeriodePromo(
                                                promoTerpilih.mulai,
                                                promoTerpilih.selesai,
                                            )}
                                        </span>
                                    )}
                                </div>
                                <DialogTitle className="mt-2 text-lg font-bold tracking-tight">
                                    {promoTerpilih.judul}
                                </DialogTitle>
                                {promoTerpilih.ringkasan && (
                                    <DialogDescription className="text-sm leading-relaxed">
                                        {promoTerpilih.ringkasan}
                                    </DialogDescription>
                                )}
                            </DialogHeader>

                            {promoTerpilih.gambar_url && (
                                <img
                                    src={promoTerpilih.gambar_url}
                                    alt={promoTerpilih.judul}
                                    className="h-48 w-full rounded-xl object-cover"
                                />
                            )}

                            {promoTerpilih.isi && (
                                <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                                    {promoTerpilih.isi}
                                </p>
                            )}

                            {promoTerpilih.kode_kupon_aktif && (
                                <div className="flex items-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/70 p-3 dark:border-emerald-800 dark:bg-emerald-950/40">
                                    <TicketPercent className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
                                            Kode kupon
                                        </p>
                                        <p className="font-mono text-base font-bold tracking-wide text-emerald-900 dark:text-emerald-100">
                                            {promoTerpilih.kode_kupon_aktif}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            void salinKode(
                                                promoTerpilih.kode_kupon_aktif as string,
                                            )
                                        }
                                        className="h-9 shrink-0 gap-1 rounded-lg border-emerald-300 bg-white text-xs text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    >
                                        {kodeTersalin ===
                                        promoTerpilih.kode_kupon_aktif ? (
                                            <>
                                                <Check className="size-3.5" />
                                                Tersalin
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="size-3.5" />
                                                Salin
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

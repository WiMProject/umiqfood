import { Link } from '@inertiajs/react';
import {
    BadgeCheck,
    CheckCircle2,
    Clock,
    Flame,
    MapPin,
    MessageSquareQuote,
    ShoppingBag,
} from 'lucide-react';
import { cn } from 'cn';
import { MenuPhotoGallery } from '@/components/menu-photo-gallery';
import { RatingStars } from '@/components/rating-stars';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Masakan } from '@/types';

interface Props {
    menu: Masakan | null;
    onClose: () => void;
    pesanHref: string;
    pesanLabel?: string;
    tamu?: boolean;
}

function formatTanggal(value: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

export function PublicMenuDialog({
    menu,
    onClose,
    pesanHref,
    pesanLabel = 'Pesan sekarang',
    tamu = false,
}: Props) {
    const habis = (menu?.jumlah_porsi ?? 0) < 1;
    const daftarUlasan = menu?.reviews ?? [];
    const jumlahUlasan = menu?.reviews_count ?? daftarUlasan.length;
    const rataRating = Number(menu?.reviews_avg_rating ?? 0);

    return (
        <Dialog
            open={menu !== null}
            onOpenChange={(terbuka) => {
                if (!terbuka) {
                    onClose();
                }
            }}
        >
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
                {menu && (
                    <>
                        <DialogHeader className="sr-only">
                            <DialogTitle>{menu.nama}</DialogTitle>
                            <DialogDescription>
                                Foto, harga, ketersediaan porsi, dan komentar
                                pelanggan untuk {menu.nama}.
                            </DialogDescription>
                        </DialogHeader>

                        <MenuPhotoGallery
                            nama={menu.nama}
                            fotoUrl={menu.foto_url}
                            fotos={menu.fotos}
                            icon={menu.kategori?.icon}
                            className="h-56 sm:h-72"
                        >
                            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                                <Badge className="gap-1 border-0 bg-background/85 text-foreground shadow-sm backdrop-blur">
                                    <span>{menu.kategori?.icon ?? '🍽️'}</span>
                                    {menu.kategori?.nama ?? 'Menu'}
                                </Badge>
                                <Badge
                                    className={cn(
                                        'border-0 shadow-sm backdrop-blur',
                                        habis
                                            ? 'bg-red-600/90 text-white'
                                            : 'bg-emerald-600/90 text-white',
                                    )}
                                >
                                    {habis
                                        ? 'Habis'
                                        : `Sisa ${menu.jumlah_porsi} porsi`}
                                </Badge>
                            </div>
                        </MenuPhotoGallery>

                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                                    {menu.nama}
                                </h2>
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                        ± 30 menit
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                        Ambil di outlet
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                        Halal · dimasak fresh
                                    </span>
                                </div>
                            </div>
                            <span className="shrink-0 rounded-xl bg-emerald-50 px-3 py-1.5 text-lg font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                {menu.harga_format}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-muted/30 px-3.5 py-2.5">
                            <div className="flex items-center gap-2.5">
                                <span className="text-2xl font-extrabold tracking-tight">
                                    {jumlahUlasan > 0
                                        ? rataRating.toFixed(1)
                                        : '—'}
                                </span>
                                <div>
                                    <RatingStars value={rataRating} />
                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                        {jumlahUlasan} ulasan pelanggan
                                    </p>
                                </div>
                            </div>
                            <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <MessageSquareQuote className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                Komentar asli pembeli
                            </span>
                        </div>

                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {menu.deskripsi ||
                                'Masakan spesial buatan rumahan, dimasak fresh saat dipesan.'}
                        </p>

                        <div
                            className={cn(
                                'flex items-start gap-2.5 rounded-xl border px-3.5 py-3',
                                habis
                                    ? 'border-red-200 bg-red-50/70 dark:border-red-900/60 dark:bg-red-950/30'
                                    : menu.jumlah_porsi <= 3
                                      ? 'border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30'
                                      : 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/25',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                                    habis
                                        ? 'bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-300'
                                        : menu.jumlah_porsi <= 3
                                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
                                )}
                            >
                                <Flame className="size-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold">
                                    {habis
                                        ? 'Porsi hari ini habis'
                                        : `Tersedia ${menu.jumlah_porsi} porsi hari ini`}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {habis
                                        ? 'Coba menu lain atau cek lagi besok ya.'
                                        : menu.jumlah_porsi <= 3
                                          ? 'Tinggal sedikit — amankan porsimu sekarang.'
                                          : 'Porsi terbatas dan dimasak fresh setelah dipesan.'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {habis ? (
                                <Button
                                    type="button"
                                    disabled
                                    className="h-11 w-full gap-2 rounded-xl bg-muted text-muted-foreground"
                                >
                                    <ShoppingBag className="size-4" />
                                    Stok habis
                                </Button>
                            ) : (
                                <Button
                                    asChild
                                    className="h-11 w-full gap-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                                >
                                    <Link href={pesanHref}>
                                        <ShoppingBag className="size-4" />
                                        {pesanLabel}
                                    </Link>
                                </Button>
                            )}
                            <p className="text-center text-xs text-muted-foreground">
                                {tamu
                                    ? 'Kamu akan diarahkan masuk dulu untuk menyelesaikan pesanan.'
                                    : 'Pickup di outlet · bayar saat ambil'}
                            </p>
                        </div>

                        <Separator />

                        <section>
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="flex items-center gap-2 font-semibold">
                                    <MessageSquareQuote className="size-4 text-emerald-600 dark:text-emerald-400" />
                                    Komentar pelanggan
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    {jumlahUlasan} ulasan
                                </span>
                            </div>

                            <div className="mt-3 space-y-2.5">
                                {daftarUlasan.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
                                        <MessageSquareQuote className="mx-auto size-5 text-muted-foreground" />
                                        <p className="mt-2 text-sm font-medium">
                                            Belum ada komentar
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Ulasan akan muncul di sini setelah
                                            pelanggan menyelesaikan pesanan.
                                        </p>
                                    </div>
                                ) : (
                                    daftarUlasan.map((ulasan) => (
                                        <div
                                            key={ulasan.id}
                                            className="rounded-xl border border-border/70 p-3.5"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                                                    {ulasan.nama
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                        <p className="text-sm font-semibold">
                                                            {ulasan.nama}
                                                        </p>
                                                        {ulasan.terverifikasi && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                                <BadgeCheck className="size-3" />
                                                                Pembeli
                                                                terverifikasi
                                                            </span>
                                                        )}
                                                        <span className="ml-auto text-[11px] text-muted-foreground">
                                                            {formatTanggal(
                                                                ulasan.created_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <RatingStars
                                                        value={ulasan.rating}
                                                        className="mt-1"
                                                    />
                                                    {ulasan.komentar && (
                                                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                                            {ulasan.komentar}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <p className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-center text-[11px] text-muted-foreground">
                                Ingin berkomentar? Ulasan terbuka setelah
                                pesananmu berstatus selesai.
                            </p>
                        </section>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

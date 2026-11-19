import { BadgeCheck, Quote, Star, UtensilsCrossed } from 'lucide-react';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { cn } from '@/lib/utils';
import type {
    AuthShowcase as AuthShowcaseData,
    AuthShowcaseMenu,
    AuthShowcaseReview,
} from '@/types';

type Tone = 'brand' | 'default' | 'ghost';

const TONE = {
    brand: {
        accent: 'text-emerald-200',
        heading: 'text-emerald-100/80',
        muted: 'text-emerald-100/70',
        menuCard:
            'border-white/15 bg-white/10 text-white shadow-lg shadow-emerald-950/15 backdrop-blur',
        menuIcon: 'bg-white/15 text-emerald-50 ring-1 ring-white/10',
        category: 'bg-emerald-300/20 text-emerald-50',
        price: 'text-emerald-100',
        reviewCard:
            'border-white/15 bg-white/10 text-emerald-50 shadow-lg shadow-emerald-950/15 backdrop-blur',
        reviewText: 'text-emerald-50/85',
        reviewName: 'text-white',
        starOn: 'fill-amber-300 text-amber-300',
        starOff: 'text-emerald-100/25',
    },
    default: {
        accent: 'text-emerald-600 dark:text-emerald-400',
        heading: 'text-muted-foreground',
        muted: 'text-muted-foreground',
        menuCard: 'border-border/70 bg-card text-card-foreground shadow-sm',
        menuIcon:
            'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900/60',
        category:
            'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        price: 'text-emerald-600 dark:text-emerald-400',
        reviewCard: 'border-border/70 bg-card text-card-foreground shadow-sm',
        reviewText: 'text-muted-foreground',
        reviewName: 'text-foreground',
        starOn: 'fill-amber-400 text-amber-400',
        starOff: 'text-muted-foreground/30',
    },
    ghost: {
        accent: 'text-emerald-700/55 dark:text-emerald-300/50',
        heading: 'text-emerald-950/55 dark:text-emerald-50/45',
        muted: 'text-emerald-950/45 dark:text-emerald-50/35',
        menuCard:
            'border-emerald-700/20 bg-emerald-600/10 text-emerald-950/70 dark:border-emerald-100/15 dark:bg-emerald-300/10 dark:text-emerald-50/60',
        menuIcon:
            'bg-emerald-600/15 text-emerald-900/70 ring-1 ring-emerald-700/10 dark:bg-emerald-300/15 dark:text-emerald-50/60 dark:ring-emerald-100/10',
        category:
            'bg-emerald-600/15 text-emerald-900/70 dark:bg-emerald-300/15 dark:text-emerald-50/60',
        price: 'text-emerald-900/80 dark:text-emerald-100/70',
        reviewCard:
            'border-emerald-700/20 bg-emerald-600/10 text-emerald-950/70 dark:border-emerald-100/15 dark:bg-emerald-300/10 dark:text-emerald-50/60',
        reviewText: 'text-emerald-950/70 dark:text-emerald-50/60',
        reviewName: 'text-emerald-950/80 dark:text-emerald-50/70',
        starOn: 'fill-amber-500/70 text-amber-500/70 dark:fill-amber-300/60 dark:text-amber-300/60',
        starOff: 'text-emerald-900/20 dark:text-emerald-50/15',
    },
} as const;

function MenuCard({ menu, tone }: { menu: AuthShowcaseMenu; tone: Tone }) {
    const style = TONE[tone];
    const adaUlasan = menu.reviews_count > 0;
    const rating = Number(menu.reviews_avg_rating ?? 0).toFixed(1);

    return (
        <article
            className={cn(
                'flex h-[136px] w-[220px] flex-col justify-between rounded-2xl border p-3.5 sm:w-[236px]',
                style.menuCard,
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <span
                    className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-xl text-xl',
                        style.menuIcon,
                    )}
                    aria-hidden="true"
                >
                    {menu.icon || '🍽️'}
                </span>
                <span
                    className={cn(
                        'max-w-[8rem] truncate rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        style.category,
                    )}
                >
                    {menu.kategori ?? 'Menu'}
                </span>
            </div>

            <h4 className="mt-2 truncate text-sm font-bold">{menu.nama}</h4>

            <div className="flex items-center justify-between gap-2">
                <span className={cn('text-sm font-extrabold', style.price)}>
                    {menu.harga_format}
                </span>
                {adaUlasan ? (
                    <span
                        className={cn(
                            'flex items-center gap-1 text-[11px] font-medium',
                            style.muted,
                        )}
                        title={`${rating} dari 5 · ${menu.reviews_count} ulasan`}
                    >
                        <Star
                            className={cn('size-3', style.starOn)}
                            aria-hidden="true"
                        />
                        {rating} ({menu.reviews_count})
                    </span>
                ) : (
                    <span className={cn('text-[11px]', style.muted)}>
                        Siap diambil
                    </span>
                )}
            </div>
        </article>
    );
}

function ReviewCard({
    review,
    tone,
}: {
    review: AuthShowcaseReview;
    tone: Tone;
}) {
    const style = TONE[tone];

    return (
        <article
            className={cn(
                'flex h-[136px] w-[262px] flex-col rounded-2xl border p-3.5 sm:w-[286px]',
                style.reviewCard,
            )}
        >
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, index) => index + 1).map(
                    (bintang) => (
                        <Star
                            key={bintang}
                            className={cn(
                                'size-3.5',
                                bintang <= review.rating
                                    ? style.starOn
                                    : style.starOff,
                            )}
                            aria-hidden="true"
                        />
                    ),
                )}
                {review.terverifikasi && (
                    <BadgeCheck
                        className={cn('ml-auto size-4', style.accent)}
                        aria-label="Pembeli terverifikasi"
                    />
                )}
            </div>

            <p
                className={cn(
                    'mt-2 line-clamp-3 text-xs leading-relaxed',
                    style.reviewText,
                )}
            >
                “{review.komentar}”
            </p>

            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                <span
                    className={cn(
                        'truncate text-[11px] font-semibold',
                        style.reviewName,
                    )}
                >
                    {review.nama}
                </span>
                {review.menu && (
                    <span
                        className={cn(
                            'max-w-[48%] truncate text-[10px]',
                            style.muted,
                        )}
                    >
                        {review.menu}
                    </span>
                )}
            </div>
        </article>
    );
}

export default function AuthShowcase({
    showcase,
    tone = 'brand',
    className,
}: {
    showcase?: AuthShowcaseData | null;
    tone?: Tone;
    className?: string;
}) {
    const menus = showcase?.menus ?? [];
    const reviews = showcase?.reviews ?? [];

    if (menus.length === 0 && reviews.length === 0) {
        return null;
    }

    const style = TONE[tone];

    return (
        <div className={cn('space-y-4', className)}>
            {menus.length > 0 && (
                <section aria-label="Menu hari ini">
                    <div className="mb-0.5 flex items-center gap-1.5 px-1">
                        <UtensilsCrossed
                            className={cn('size-3.5', style.accent)}
                            aria-hidden="true"
                        />
                        <h3
                            className={cn(
                                'text-[11px] font-semibold tracking-[0.14em] uppercase',
                                style.heading,
                            )}
                        >
                            Menu hari ini
                        </h3>
                        <span
                            className={cn(
                                'ml-auto hidden text-[10px] sm:inline',
                                style.muted,
                            )}
                        >
                            {menus.length} pilihan · siap diambil
                        </span>
                    </div>

                    <InfiniteMovingCards
                        items={menus}
                        renderItem={(menu) => (
                            <MenuCard menu={menu} tone={tone} />
                        )}
                        direction="left"
                        speed="normal"
                        ariaLabel="Menu yang tersedia hari ini"
                    />
                </section>
            )}

            {reviews.length > 0 && (
                <section aria-label="Ulasan pelanggan">
                    <div className="mb-0.5 flex items-center gap-1.5 px-1">
                        <Quote
                            className={cn('size-3.5', style.accent)}
                            aria-hidden="true"
                        />
                        <h3
                            className={cn(
                                'text-[11px] font-semibold tracking-[0.14em] uppercase',
                                style.heading,
                            )}
                        >
                            Kata pelanggan
                        </h3>
                        <span
                            className={cn(
                                'ml-auto hidden text-[10px] sm:inline',
                                style.muted,
                            )}
                        >
                            Ulasan asli pembeli
                        </span>
                    </div>

                    <InfiniteMovingCards
                        items={reviews}
                        renderItem={(review) => (
                            <ReviewCard review={review} tone={tone} />
                        )}
                        direction="right"
                        speed="slow"
                        ariaLabel="Ulasan pelanggan UmiqFood"
                    />
                </section>
            )}
        </div>
    );
}

/**
 * Latar dekoratif untuk halaman auth di mobile/tablet.
 * Kartu bergerak tetap terlihat tanpa menambah tinggi halaman.
 */
export function AuthShowcaseBackdrop({
    showcase,
}: {
    showcase?: AuthShowcaseData | null;
}) {
    const menus = showcase?.menus ?? [];
    const reviews = showcase?.reviews ?? [];

    if (menus.length === 0 && reviews.length === 0) {
        return null;
    }

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden lg:hidden"
        >
            <div className="absolute -top-16 -left-12 w-[140%] -rotate-2 [mask-image:linear-gradient(to_bottom,black_0%,black_45%,transparent_85%)] opacity-70">
                <InfiniteMovingCards
                    items={menus}
                    renderItem={(menu) => <MenuCard menu={menu} tone="ghost" />}
                    direction="left"
                    speed="slow"
                    pauseOnHover={false}
                />
            </div>

            <div className="absolute -right-12 -bottom-14 w-[140%] rotate-2 [mask-image:linear-gradient(to_top,black_0%,black_40%,transparent_80%)] opacity-55">
                <InfiniteMovingCards
                    items={reviews}
                    renderItem={(review) => (
                        <ReviewCard review={review} tone="ghost" />
                    )}
                    direction="right"
                    speed="slow"
                    pauseOnHover={false}
                />
            </div>
        </div>
    );
}

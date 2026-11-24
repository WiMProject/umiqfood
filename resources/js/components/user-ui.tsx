import type { LucideIcon } from 'lucide-react';
import {
    CheckCircle2,
    ChefHat,
    ClipboardList,
    PackageCheck,
    XCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OrderStatus, Payment } from '@/types';

/**
 * Potongan UI yang dipakai bersama di halaman user (beranda, pesanan,
 * keranjang, pembayaran) supaya ritme badge, antrian, dan progress sama.
 */

const orderStatusStyles: Record<OrderStatus, string> = {
    menunggu:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300',
    dimasak:
        'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300',
    siap: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-300',
    selesai:
        'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    dibatalkan:
        'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300',
};

export function OrderStatusBadge({
    status,
    label,
    className,
}: {
    status: OrderStatus;
    label: string;
    className?: string;
}) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'gap-1 text-[10px] font-medium whitespace-nowrap',
                orderStatusStyles[status],
                className,
            )}
        >
            {label}
        </Badge>
    );
}

export function PaymentStatusBadge({
    status,
    label,
    className,
}: {
    status: Payment['status'];
    label: string;
    className?: string;
}) {
    const style =
        status === 'berhasil'
            ? orderStatusStyles.selesai
            : status === 'gagal'
              ? orderStatusStyles.dibatalkan
              : orderStatusStyles.menunggu;

    return (
        <Badge
            variant="outline"
            className={cn(
                'gap-1 text-[10px] font-medium whitespace-nowrap',
                style,
                className,
            )}
        >
            {label}
        </Badge>
    );
}

export function QueueBadge({
    nomor,
    small = false,
    className,
}: {
    nomor: number;
    small?: boolean;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'flex shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 px-1 py-1 text-white shadow-sm shadow-emerald-600/20',
                small ? 'min-h-10 min-w-12' : 'min-h-12 min-w-14',
                className,
            )}
        >
            <span className="text-[9px] leading-none font-semibold tracking-[0.08em] whitespace-nowrap text-emerald-100 uppercase">
                Antrian
            </span>
            <span
                className={cn(
                    'leading-none font-extrabold',
                    small ? 'text-lg' : 'text-xl',
                )}
            >
                {String(nomor).padStart(3, '0')}
            </span>
        </span>
    );
}

export function SectionHeading({
    eyebrow,
    title,
    description,
    icon: Icon,
    action,
    headingLevel: Heading = 'h2',
    className,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    icon?: LucideIcon;
    action?: ReactNode;
    headingLevel?: 'h1' | 'h2';
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div className="flex items-start gap-3">
                {Icon && (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/15 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <Icon className="size-5" />
                    </span>
                )}
                <div className="min-w-0">
                    {eyebrow && (
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-600 uppercase dark:text-emerald-400">
                            {eyebrow}
                        </p>
                    )}
                    <Heading className="mt-0.5 text-xl font-extrabold tracking-tight sm:text-2xl">
                        {title}
                    </Heading>
                    {description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {action}
        </div>
    );
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center',
                className,
            )}
        >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
                <Icon className="size-7" />
            </span>
            <div>
                <p className="font-semibold">{title}</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            {action}
        </div>
    );
}

export function FilterChip({
    active,
    onClick,
    icon,
    count,
    children,
}: {
    active: boolean;
    onClick: () => void;
    icon?: ReactNode;
    count?: number;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition sm:px-4',
                active
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : 'border-border/80 bg-card text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300',
            )}
        >
            {icon}
            {children}
            {count !== undefined && (
                <span
                    className={cn(
                        'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                        active ? 'bg-white/20' : 'bg-muted',
                    )}
                >
                    {count}
                </span>
            )}
        </button>
    );
}

const langkahPesanan: {
    status: OrderStatus;
    label: string;
    icon: LucideIcon;
}[] = [
    { status: 'menunggu', label: 'Diterima', icon: ClipboardList },
    { status: 'dimasak', label: 'Dimasak', icon: ChefHat },
    { status: 'siap', label: 'Siap diambil', icon: PackageCheck },
    { status: 'selesai', label: 'Selesai', icon: CheckCircle2 },
];

export function OrderProgress({
    status,
    tone = 'card',
    ringkas = false,
}: {
    status: OrderStatus;
    tone?: 'card' | 'dark';
    ringkas?: boolean;
}) {
    if (status === 'dibatalkan') {
        return (
            <div
                className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium',
                    tone === 'dark'
                        ? 'bg-red-500/20 text-red-100'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
                )}
            >
                <XCircle className="size-4 shrink-0" />
                Pesanan dibatalkan · porsi dikembalikan
            </div>
        );
    }

    const posisi = langkahPesanan.findIndex(
        (langkah) => langkah.status === status,
    );

    const posisiAman = Math.max(0, posisi);
    const progres =
        langkahPesanan.length > 1
            ? (posisiAman / (langkahPesanan.length - 1)) * 100
            : 0;

    return (
        <div className={cn('relative', ringkas ? '' : 'pt-1')}>
            {/* Track */}
            {!ringkas && (
                <>
                    <div
                        className={cn(
                            'absolute top-4 right-0 left-0 h-1 -translate-y-1/2 rounded-full',
                            tone === 'dark' ? 'bg-white/15' : 'bg-muted',
                        )}
                        aria-hidden="true"
                    />
                    <div
                        className={cn(
                            'absolute top-4 left-0 h-1 -translate-y-1/2 rounded-full transition-all duration-500',
                            tone === 'dark' ? 'bg-white' : 'bg-emerald-600',
                        )}
                        style={{ width: `${progres}%` }}
                        aria-hidden="true"
                    />
                </>
            )}
            <div
                className={cn(
                    'relative grid grid-cols-4',
                    ringkas ? 'gap-0.5' : 'gap-1',
                )}
            >
                {langkahPesanan.map((langkah, index) => {
                    const selesai = index <= posisi;
                    const aktif = index === posisi;

                    return (
                        <div
                            key={langkah.status}
                            className="flex flex-col items-center gap-1 text-center"
                        >
                            <span
                                className={cn(
                                    'relative z-10 flex size-8 items-center justify-center rounded-full border-2 transition sm:size-9',
                                    tone === 'dark'
                                        ? selesai
                                            ? 'border-white bg-white text-emerald-700 shadow-lg shadow-emerald-900/20'
                                            : 'border-white/25 bg-white/10 text-white/60'
                                        : selesai
                                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                                          : 'border-border bg-card text-muted-foreground',
                                    aktif &&
                                        (tone === 'dark'
                                            ? 'scale-110 ring-4 ring-white/25'
                                            : 'scale-110 ring-4 ring-emerald-500/20'),
                                )}
                            >
                                {selesai && !aktif ? (
                                    <CheckCircle2 className="size-4 sm:size-4.5" />
                                ) : (
                                    <langkah.icon className="size-4 sm:size-4.5" />
                                )}
                            </span>
                            {!ringkas && (
                                <span
                                    className={cn(
                                        'text-[10px] leading-tight sm:text-[11px]',
                                        tone === 'dark'
                                            ? selesai
                                                ? 'font-semibold text-white'
                                                : 'text-white/60'
                                            : selesai
                                              ? 'font-semibold text-foreground'
                                              : 'text-muted-foreground',
                                    )}
                                >
                                    {langkah.label}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

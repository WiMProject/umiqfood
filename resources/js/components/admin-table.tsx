import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Tampilan tabel admin yang dipakai bersama agar judul, baris, badge status,
 * dan tombol aksi punya ritme yang sama di semua halaman kelola.
 */
export function AdminTableCard({
    title,
    description,
    count,
    icon: Icon,
    className,
    children,
}: {
    title: string;
    description?: string;
    count?: number;
    icon?: LucideIcon;
    className?: string;
    children: ReactNode;
}) {
    return (
        <section
            className={cn(
                'overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm',
                className,
            )}
        >
            <div className="relative overflow-hidden border-b border-border/70 bg-gradient-to-r from-emerald-50/80 via-emerald-50/30 to-transparent px-14 py-4 dark:from-emerald-950/30 dark:via-emerald-950/10 dark:to-transparent">
                <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/70" />
                {Icon && (
                    <div className="absolute top-1/2 left-4 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/15 dark:text-emerald-300">
                        <Icon className="size-[18px]" />
                    </div>
                )}
                <div className="flex flex-col items-center gap-0.5 text-center">
                    <h2 className="text-sm font-semibold tracking-wide text-foreground sm:text-base">
                        {title}
                    </h2>
                    {description && (
                        <p className="max-w-md text-[11px] text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {count !== undefined && (
                    <span className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full border border-emerald-200/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {count === 0 ? '0 data' : `${count} data`}
                    </span>
                )}
            </div>
            <div className="overflow-x-auto">{children}</div>
        </section>
    );
}

export function TableHead({
    align = 'left',
    className,
    children,
}: {
    align?: 'left' | 'center' | 'right';
    className?: string;
    children: ReactNode;
}) {
    return (
        <th
            scope="col"
            className={cn(
                'px-4 py-3 align-middle text-[11px] font-semibold tracking-wider whitespace-nowrap text-muted-foreground uppercase',
                align === 'center' && 'text-center',
                align === 'right' && 'text-right',
                className,
            )}
        >
            {children}
        </th>
    );
}

const statusTones = {
    emerald:
        'bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/60',
    slate: 'bg-slate-100 text-slate-600 ring-slate-200/70 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700/60',
};

export function StatusPill({
    tone,
    icon: Icon,
    children,
}: {
    tone: keyof typeof statusTones;
    icon?: LucideIcon;
    children: ReactNode;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
                statusTones[tone],
            )}
        >
            {Icon && <Icon className="size-3.5 shrink-0" />}
            {children}
        </span>
    );
}

const actionTones = {
    slate: 'border-border/70 text-muted-foreground hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300',
    emerald:
        'border-emerald-600/20 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:border-emerald-500/30',
    rose: 'border-rose-200/80 text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300',
};

export function TableAction({
    label,
    icon: Icon,
    onClick,
    tone = 'slate',
}: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    tone?: keyof typeof actionTones;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            title={label}
            aria-label={label}
            onClick={onClick}
            className={cn(
                'size-8 shrink-0 rounded-lg transition-colors',
                actionTones[tone],
            )}
        >
            <Icon className="size-4" />
        </Button>
    );
}

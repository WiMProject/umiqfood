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
    count,
    icon: Icon,
    className,
    children,
}: {
    title: string;
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
            <div className="relative flex items-center justify-center border-b border-border/70 bg-emerald-50/40 px-14 py-3 dark:bg-emerald-950/20">
                {Icon && (
                    <div className="absolute left-4 flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <Icon className="size-4" />
                    </div>
                )}
                <h2 className="text-center text-sm font-semibold tracking-wide text-foreground">
                    {title}
                </h2>
                {count !== undefined && (
                    <span className="absolute right-4 rounded-full border border-emerald-200/70 bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {count === 0 ? '0' : count}
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

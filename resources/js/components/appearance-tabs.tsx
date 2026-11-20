import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Terang' },
        { value: 'dark', icon: Moon, label: 'Gelap' },
        { value: 'system', icon: Monitor, label: 'Sistem' },
    ];

    return (
        <div
            className={cn(
                'grid grid-cols-3 gap-2 rounded-2xl border border-border/70 bg-muted/40 p-1.5',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => {
                const aktif = appearance === value;

                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => updateAppearance(value)}
                        aria-pressed={aktif}
                        className={cn(
                            'flex flex-col items-center gap-2 rounded-xl px-3 py-3.5 text-sm font-medium transition sm:flex-row sm:justify-center sm:py-3',
                            aktif
                                ? 'bg-card text-foreground shadow-sm ring-1 ring-emerald-500/20'
                                : 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
                        )}
                    >
                        <span
                            className={cn(
                                'flex size-9 items-center justify-center rounded-xl transition',
                                aktif
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-muted text-muted-foreground',
                            )}
                        >
                            <Icon className="size-4.5" />
                        </span>
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

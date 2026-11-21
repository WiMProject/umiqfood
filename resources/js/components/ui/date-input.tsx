import { CalendarDays } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Input tanggal dengan tampilan yang sama seperti Select/Input admin pada
 * umumnya. Ikon kalender kiri sebagai penanda, tombol kanan untuk membuka
 * date picker native tanpa mengubah perilaku input.
 */
const DateInput = React.forwardRef<
    HTMLInputElement,
    React.ComponentProps<'input'>
>(({ className, id, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const bukaKalender = () => {
        const input = inputRef.current;
        if (!input) return;

        try {
            if (typeof input.showPicker === 'function') {
                input.showPicker();
                return;
            }
        } catch {
            // Fallback ke fokus jika showPicker tidak diizinkan browser.
        }

        input.focus();
    };

    return (
        <div className={cn('group relative', className)}>
            <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-emerald-600/70 transition-colors group-focus-within:text-emerald-600 dark:text-emerald-400/80" />
            <input
                ref={inputRef}
                id={id}
                type="date"
                data-slot="input"
                className={cn(
                    'border-input/80 bg-card hover:border-emerald-300 dark:hover:border-emerald-800 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/15 aria-invalid:border-destructive aria-invalid:ring-destructive/20 flex h-10 w-full min-w-0 rounded-xl border pr-9 pl-9 text-sm font-medium shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:focus-visible:ring-emerald-400/20 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0',
                )}
                {...props}
            />
            <button
                type="button"
                tabIndex={-1}
                aria-label="Buka kalender"
                onClick={bukaKalender}
                className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-emerald-50 hover:text-emerald-600 group-focus-within:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 dark:group-focus-within:text-emerald-300"
            >
                <CalendarDays className="size-4" />
            </button>
        </div>
    );
});
DateInput.displayName = 'DateInput';

export { DateInput };

import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Select({
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
    return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
    return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
    return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
    className,
    size = 'default',
    children,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
    size?: 'sm' | 'default';
}) {
    return (
        <SelectPrimitive.Trigger
            data-slot="select-trigger"
            data-size={size}
            className={cn(
                'group border-input/80 bg-card hover:border-emerald-300 dark:hover:border-emerald-800 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/15 aria-invalid:border-destructive aria-invalid:ring-destructive/20 flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 text-sm font-medium whitespace-nowrap shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground data-[size=default]:h-10 data-[size=sm]:h-9 dark:bg-input/30 dark:focus-visible:ring-emerald-400/20 [&_svg]:pointer-events-none [&_svg]:shrink-0',
                className,
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDownIcon className="size-4 text-emerald-600/70 transition-transform duration-200 group-data-[state=open]:rotate-180 dark:text-emerald-400/80" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
}

const scrollbarClass =
    '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-200/80 dark:[&::-webkit-scrollbar-thumb]:bg-emerald-800/70';

function SelectContent({
    className,
    children,
    position = 'popper',
    side = 'bottom',
    sideOffset = 6,
    align = 'start',
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                data-slot="select-content"
                className={cn(
                    'bg-popover text-popover-foreground border-emerald-100/80 dark:border-emerald-900/60 relative z-50 max-h-(--radix-select-content-available-height) min-w-[9rem] origin-(--radix-select-content-transform-origin) overflow-hidden rounded-xl border p-1.5 shadow-xl shadow-emerald-950/10 ring-1 ring-emerald-500/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 dark:shadow-black/30',
                    position === 'popper' &&
                        'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
                    className,
                )}
                position={position}
                side={side}
                sideOffset={sideOffset}
                align={align}
                {...props}
            >
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport
                    className={cn(
                        'max-h-64 overflow-y-auto p-0',
                        scrollbarClass,
                        position === 'popper' &&
                            'w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1.5',
                    )}
                >
                    {children}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
}

function SelectLabel({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
    return (
        <SelectPrimitive.Label
            data-slot="select-label"
            className={cn(
                'px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.14em] text-emerald-600/80 uppercase dark:text-emerald-400/80',
                className,
            )}
            {...props}
        />
    );
}

function SelectItem({
    className,
    children,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
    return (
        <SelectPrimitive.Item
            data-slot="select-item"
            className={cn(
                'focus:bg-emerald-50 focus:text-emerald-900 data-[state=checked]:bg-emerald-50/80 data-[state=checked]:font-semibold data-[state=checked]:text-emerald-700 relative flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg py-2 pr-9 pl-3 text-sm outline-hidden select-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-40 dark:focus:bg-emerald-950/50 dark:focus:text-emerald-100 dark:data-[state=checked]:bg-emerald-950/40 dark:data-[state=checked]:text-emerald-300',
                className,
            )}
            {...props}
        >
            <span
                data-slot="select-item-indicator"
                className="absolute right-3 flex size-4 items-center justify-center"
            >
                <SelectPrimitive.ItemIndicator>
                    <CheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText className="min-w-0 flex-1 truncate">
                {children}
            </SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
}

function SelectSeparator({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
    return (
        <SelectPrimitive.Separator
            data-slot="select-separator"
            className={cn(
                'bg-emerald-100/80 pointer-events-none -mx-1 my-1 h-px dark:bg-emerald-900/50',
                className,
            )}
            {...props}
        />
    );
}

function SelectScrollUpButton({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
    return (
        <SelectPrimitive.ScrollUpButton
            data-slot="select-scroll-up-button"
            className={cn(
                'flex cursor-default items-center justify-center rounded-t-lg py-1.5 text-emerald-600 dark:text-emerald-400',
                className,
            )}
            {...props}
        >
            <ChevronUpIcon className="size-4" />
        </SelectPrimitive.ScrollUpButton>
    );
}

function SelectScrollDownButton({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
    return (
        <SelectPrimitive.ScrollDownButton
            data-slot="select-scroll-down-button"
            className={cn(
                'flex cursor-default items-center justify-center rounded-b-lg py-1.5 text-emerald-600 dark:text-emerald-400',
                className,
            )}
            {...props}
        >
            <ChevronDownIcon className="size-4" />
        </SelectPrimitive.ScrollDownButton>
    );
}

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
};

import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/30">
                <AppLogoIcon className="size-4.5 fill-current text-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left leading-tight">
                <span className="truncate text-[13px] font-bold tracking-tight">
                    {name}
                </span>
                <span className="truncate text-[10px] font-medium tracking-[0.16em] text-sidebar-foreground/60 uppercase">
                    Panel admin
                </span>
            </div>
        </>
    );
}

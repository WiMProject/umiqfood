import { Link } from '@inertiajs/react';

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavGroup } from '@/types';

export function NavMain({ groups }: { groups: NavGroup[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const { isMobile, setOpenMobile } = useSidebar();

    return (
        <>
            {groups.map((group) => (
                <SidebarGroup key={group.title} className="px-2 py-0">
                    <SidebarGroupLabel className="mb-1 h-7 px-3 text-[10px] tracking-[0.18em] text-sidebar-foreground/60 uppercase">
                        {group.title}
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-1">
                        {group.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href)}
                                    tooltip={{ children: item.title }}
                                    className="relative h-10 gap-2.5 rounded-xl px-3 text-[13px] group-data-[collapsible=icon]:rounded-lg before:absolute before:top-1/2 before:left-0 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-emerald-600 before:opacity-0 before:content-[''] group-data-[collapsible=icon]:before:hidden data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-sm data-[active=true]:shadow-emerald-950/5 data-[active=true]:before:opacity-100 dark:before:bg-emerald-400"
                                >
                                    <Link
                                        href={item.href}
                                        prefetch
                                        onClick={() => {
                                            if (isMobile) {
                                                setOpenMobile(false);
                                            }
                                        }}
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}

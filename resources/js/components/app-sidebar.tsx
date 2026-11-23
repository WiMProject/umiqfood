import { Link } from '@inertiajs/react';
import {
    ArrowLeftRight,
    Boxes,
    ClipboardCheck,
    ClipboardList,
    LayoutGrid,
    Tags,
    TrendingUp,
    Users,
    UtensilsCrossed,
    Wallet,
    X,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Menu Masakan',
        href: '/masakan',
        icon: UtensilsCrossed,
    },
    {
        title: 'Kategori',
        href: '/kategori',
        icon: Tags,
    },
    {
        title: 'Inventori',
        href: '/inventori',
        icon: Boxes,
    },
    {
        title: 'Mutasi Stok',
        href: '/stok-mutasi',
        icon: ArrowLeftRight,
    },
    {
        title: 'Pesanan',
        href: '/pesanan',
        icon: ClipboardList,
    },
    {
        title: 'Pengeluaran',
        href: '/pengeluaran',
        icon: Wallet,
    },
    {
        title: 'Tutup Hari',
        href: '/laporan/tutup-hari',
        icon: ClipboardCheck,
    },
    {
        title: 'Laba Rugi',
        href: '/laporan/laba-rugi',
        icon: TrendingUp,
    },
    {
        title: 'Manajemen User',
        href: '/users',
        icon: Users,
    },
];

export function AppSidebar() {
    const { isMobile, setOpenMobile } = useSidebar();

    return (
        <Sidebar collapsible="icon" variant="inset" className="pt-0!">
            <SidebarHeader className="sticky top-0 z-30 shrink-0 gap-0 border-b border-sidebar-border/70 bg-sidebar/95 p-0 backdrop-blur">
                <div className="flex items-center gap-1 p-3 group-data-[collapsible=icon]:p-2 md:p-4 group-data-[collapsible=icon]:md:p-2">
                    <SidebarMenu className="min-w-0 flex-1">
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                className="rounded-xl hover:bg-sidebar-accent/70 data-[state=open]:bg-sidebar-accent/70"
                            >
                                <Link
                                    href={dashboard()}
                                    prefetch
                                    onClick={() => {
                                        if (isMobile) {
                                            setOpenMobile(false);
                                        }
                                    }}
                                >
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>

                    {isMobile && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpenMobile(false)}
                            aria-label="Tutup menu"
                            className="size-9 shrink-0 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <X className="size-4.5" />
                        </Button>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="py-2">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/70 p-3 group-data-[collapsible=icon]:p-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

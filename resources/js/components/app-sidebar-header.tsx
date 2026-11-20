import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="sticky top-0 z-30 flex h-[73px] shrink-0 items-center gap-2 border-b border-sidebar-border/70 bg-sidebar px-6 text-sidebar-foreground transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16! md:h-20 md:px-6">
            <div className="flex items-center gap-3 [&_[data-slot=breadcrumb-link]:hover]:text-sidebar-foreground [&_[data-slot=breadcrumb-list]]:text-[15px] [&_[data-slot=breadcrumb-list]]:text-sidebar-foreground/60 [&_[data-slot=breadcrumb-page]]:text-sidebar-foreground">
                <SidebarTrigger className="-ml-1 size-9 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}

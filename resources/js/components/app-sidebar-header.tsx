import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border/70 bg-sidebar/95 px-3 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12! sm:h-[73px] sm:gap-3 sm:px-6 md:h-[81px]">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <SidebarTrigger className="-ml-1 size-9 shrink-0 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
                <div className="h-5 w-px shrink-0 bg-sidebar-border/60 sm:h-6" />
                <div className="min-w-0 flex-1">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
        </header>
    );
}

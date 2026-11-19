import { usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import UserLayout from '@/layouts/user-layout';

interface RoleLayoutProps {
    auth: {
        user: {
            role?: string | null;
        } | null;
    };
    [key: string]: unknown;
}

export default function SettingsRoleLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<RoleLayoutProps>().props;
    const Layout = auth.user?.role === 'admin' ? AppLayout : UserLayout;

    return (
        <Layout>
            <SettingsLayout>{children}</SettingsLayout>
        </Layout>
    );
}

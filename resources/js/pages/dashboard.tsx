import { Head, Link } from '@inertiajs/react';
import {
    ChefHat,
    PackageCheck,
    PackageX,
    UtensilsCrossed,
    ArrowUpRight,
    Boxes,
    AlertTriangle,
} from 'lucide-react';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';

interface Kategori {
    id: number;
    nama: string;
    icon?: string;
}

interface Masakan {
    id: number;
    nama: string;
    harga_format: string;
    tersedia: boolean;
    jumlah_porsi: number;
    foto_url: string | null;
    kategori?: Kategori;
}

interface Props {
    stats: {
        totalMenu: number;
        tersedia: number;
        habis: number;
        totalKategori: number;
        totalBahan: number;
        stokKritis: number;
    };
    masakans: Masakan[];
}

export default function Dashboard({ stats, masakans }: Props) {
    const kartu = [
        {
            title: 'Total Menu',
            value: stats.totalMenu,
            icon: UtensilsCrossed,
            warna: 'bg-blue-50 text-blue-600',
        },
        {
            title: 'Menu Tersedia',
            value: stats.tersedia,
            icon: PackageCheck,
            warna: 'bg-green-50 text-green-600',
        },
        {
            title: 'Menu Habis',
            value: stats.habis,
            icon: PackageX,
            warna: 'bg-red-50 text-red-600',
        },
        {
            title: 'Total Kategori',
            value: stats.totalKategori,
            icon: ChefHat,
            warna: 'bg-emerald-50 text-emerald-600',
        },
        {
            title: 'Bahan Baku',
            value: stats.totalBahan,
            icon: Boxes,
            warna: 'bg-teal-50 text-teal-600',
        },
        {
            title: 'Stok Kritis',
            value: stats.stokKritis,
            icon: AlertTriangle,
            warna: 'bg-amber-50 text-amber-600',
        },
    ];

    return (
        <>
            <Head title="Dashboard Admin" />

            <div className="flex flex-col gap-6 p-6">
                {/* Sapaan */}
                <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-amber-500 px-8 py-8 text-white shadow-sm">
                    <p className="mb-1 text-sm text-emerald-100">
                        Panel Admin UmiqFood
                    </p>
                    <h1 className="text-2xl font-extrabold">
                        Selamat datang, Admin! 🍱
                    </h1>
                    <p className="mt-2 text-sm text-emerald-100">
                        Pantau menu warungmu dari satu tempat.
                    </p>
                </div>

                {/* Kartu Statistik */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {kartu.map((item) => (
                        <div
                            key={item.title}
                            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-neutral-900"
                        >
                            <div>
                                <p className="text-sm text-gray-500">
                                    {item.title}
                                </p>
                                <p className="mt-1 text-3xl font-extrabold text-gray-900 dark:text-white">
                                    {item.value}
                                </p>
                            </div>
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full ${item.warna}`}
                            >
                                <item.icon className="h-6 w-6" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Menu Terbaru */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-neutral-900">
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                            Menu Terbaru
                        </h2>
                        <Link href="/masakan">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-emerald-600"
                            >
                                Kelola Menu{' '}
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>

                    {masakans.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">
                            Belum ada menu. Klik "Kelola Menu" untuk
                            menambahkan.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                            {masakans.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-gray-50/60 dark:hover:bg-neutral-800/30"
                                >
                                    {item.foto_url ? (
                                        <img
                                            src={item.foto_url}
                                            alt={item.nama}
                                            className="h-11 w-11 rounded-lg border object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40">
                                            <UtensilsCrossed className="h-5 w-5" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-gray-900 dark:text-white">
                                            {item.nama}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {item.kategori?.icon}{' '}
                                            {item.kategori?.nama || '-'}
                                        </p>
                                    </div>
                                    <span className="hidden text-xs text-gray-400 md:inline">
                                        {item.jumlah_porsi} porsi
                                    </span>
                                    <span className="text-sm font-semibold text-emerald-600">
                                        {item.harga_format}
                                    </span>
                                    <span
                                        className={`hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline-block ${
                                            item.tersedia
                                                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                                : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                        }`}
                                    >
                                        {item.tersedia ? 'Tersedia' : 'Habis'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

import { Head } from '@inertiajs/react';
import {
    HelpCircle,
    Megaphone,
    Sparkles,
    Store,
    TicketPercent,
    type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Faq, Kupon, Masakan, PengaturanToko, Pengumuman } from '@/types';

import { FaqSection } from './faq-section';
import { KuponSection } from './kupon-section';
import { HeroSection } from './hero-section';
import { ProfilSection } from './profil-section';
import { PromoSection } from './promo-section';
import { UnggulanSection } from './unggulan-section';

interface Props {
    pengaturan: PengaturanToko;
    promos: Pengumuman[];
    kupons: Kupon[];
    faqs: Faq[];
    masakans: Masakan[];
    opsiKupon: Pick<Kupon, 'id' | 'kode' | 'nama' | 'aktif'>[];
    stats: {
        promo_aktif: number;
        kupon_aktif: number;
        faq_aktif: number;
        menu_unggulan: number;
    };
}

type TabKey = 'hero' | 'profil' | 'promo' | 'kupon' | 'faq' | 'unggulan';

interface TabItem {
    key: TabKey;
    label: string;
    icon: LucideIcon;
    badge?: number;
    hint: string;
}

export default function AdminKontenIndex({
    pengaturan,
    promos,
    kupons,
    faqs,
    masakans,
    opsiKupon,
    stats,
}: Props) {
    const [tab, setTab] = useState<TabKey>('profil');

    const tabs: TabItem[] = [
        {
            key: 'hero',
            label: 'Hero & Beranda',
            icon: Sparkles,
            hint: 'Judul, badge, CTA halaman utama',
        },
        {
            key: 'profil',
            label: 'Profil & Kontak',
            icon: Store,
            hint: 'Lokasi, jam buka, WhatsApp',
        },
        {
            key: 'promo',
            label: 'Promo & Berita',
            icon: Megaphone,
            badge: promos.length,
            hint: 'Pengumuman dan promo',
        },
        {
            key: 'kupon',
            label: 'Kupon',
            icon: TicketPercent,
            badge: stats.kupon_aktif,
            hint: 'Kode diskon checkout',
        },
        {
            key: 'faq',
            label: 'FAQ',
            icon: HelpCircle,
            badge: stats.faq_aktif,
            hint: 'Pertanyaan pelanggan',
        },
        {
            key: 'unggulan',
            label: 'Menu Unggulan',
            icon: Sparkles,
            badge: stats.menu_unggulan,
            hint: 'Pilihan hari ini',
        },
    ];

    const statCards: {
        key: TabKey;
        icon: LucideIcon;
        value: number;
        label: string;
        hint: string;
        warna: string;
    }[] = [
        {
            key: 'promo',
            icon: Megaphone,
            value: stats.promo_aktif,
            label: 'Promo aktif',
            hint: 'Tayang di halaman utama',
            warna: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
        },
        {
            key: 'kupon',
            icon: TicketPercent,
            value: stats.kupon_aktif,
            label: 'Kupon aktif',
            hint: 'Siap dipakai pelanggan',
            warna: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        },
        {
            key: 'faq',
            icon: HelpCircle,
            value: stats.faq_aktif,
            label: 'FAQ aktif',
            hint: 'Muncul di bagian FAQ',
            warna: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        },
        {
            key: 'unggulan',
            icon: Sparkles,
            value: stats.menu_unggulan,
            label: 'Menu unggulan',
            hint: 'Disorot hari ini',
            warna: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
        },
    ];

    return (
        <>
            <Head title="Konten" />

            <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-4 lg:p-6">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-600 uppercase dark:text-emerald-400">
                        Halaman utama
                    </p>
                    <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
                        Konten
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Satu tempat untuk mengatur profil toko, promo, kupon,
                        FAQ, dan menu unggulan. Section di halaman utama
                        otomatis disembunyikan bila datanya kosong.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {statCards.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setTab(item.key)}
                            className="text-left"
                        >
                            <Card className="h-full gap-1 p-3 transition hover:border-emerald-300 hover:shadow-md sm:p-4 dark:hover:border-emerald-800">
                                <span
                                    className={cn(
                                        'flex size-8 items-center justify-center rounded-xl sm:size-9',
                                        item.warna,
                                    )}
                                >
                                    <item.icon className="size-4" />
                                </span>
                                <p className="mt-2 text-lg font-extrabold tracking-tight sm:text-xl">
                                    {item.value}
                                </p>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {item.label}
                                </p>
                                <p className="text-[10px] text-muted-foreground/80 sm:text-[11px]">
                                    {item.hint}
                                </p>
                            </Card>
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-1 rounded-2xl border border-border/70 bg-muted/40 p-1.5">
                    {tabs.map((item) => {
                        const aktif = tab === item.key;

                        return (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setTab(item.key)}
                                title={item.hint}
                                className={cn(
                                    'group flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium whitespace-nowrap transition sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm',
                                    aktif
                                        ? 'bg-card text-foreground shadow-sm ring-1 ring-emerald-500/15'
                                        : 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex size-6 items-center justify-center rounded-lg transition sm:size-7',
                                        aktif
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-muted text-muted-foreground group-hover:text-foreground',
                                    )}
                                >
                                    <item.icon className="size-3.5 sm:size-4" />
                                </span>
                                {item.label}
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="flex min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div>
                    {tab === 'hero' && <HeroSection pengaturan={pengaturan} />}
                    {tab === 'profil' && (
                        <ProfilSection pengaturan={pengaturan} />
                    )}
                    {tab === 'promo' && (
                        <PromoSection promos={promos} opsiKupon={opsiKupon} />
                    )}
                    {tab === 'kupon' && <KuponSection kupons={kupons} />}
                    {tab === 'faq' && <FaqSection faqs={faqs} />}
                    {tab === 'unggulan' && (
                        <UnggulanSection masakans={masakans} />
                    )}
                </div>
            </div>
        </>
    );
}

AdminKontenIndex.layout = {
    breadcrumbs: [{ title: 'Konten', href: '/konten' }],
};

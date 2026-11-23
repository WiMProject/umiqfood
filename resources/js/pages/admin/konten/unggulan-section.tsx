import { router } from '@inertiajs/react';
import {
    Flame,
    ImageOff,
    Search,
    Sparkles,
    Star,
    StarOff,
    UtensilsCrossed,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Masakan } from '@/types';

import { formatRupiah } from './helpers';

interface Props {
    masakans: Masakan[];
}

export function UnggulanSection({ masakans }: Props) {
    const [cari, setCari] = useState('');
    const [memproses, setMemproses] = useState<number | null>(null);

    const hasil = useMemo(() => {
        const kataKunci = cari.trim().toLowerCase();

        return masakans.filter((masakan) => {
            if (kataKunci === '') {
                return true;
            }

            return (
                masakan.nama.toLowerCase().includes(kataKunci) ||
                (masakan.kategori?.nama ?? '').toLowerCase().includes(kataKunci)
            );
        });
    }, [masakans, cari]);

    const jumlahTerpilih = masakans.filter(
        (masakan) => masakan.tampil_unggulan,
    ).length;

    const toggle = (masakan: Masakan) => {
        setMemproses(masakan.id);
        router.patch(
            `/konten/unggulan/${masakan.id}`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setMemproses(null),
            },
        );
    };

    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">
                        Pilihan hari ini
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                        Tandai menu yang ingin disorot di halaman utama. Menu
                        yang habis otomatis disembunyikan.
                    </p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={cari}
                        onChange={(event) => setCari(event.target.value)}
                        placeholder="Cari menu atau kategori..."
                        className="h-10 rounded-xl bg-card pl-10"
                    />
                </div>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50/60 px-3.5 py-2.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-200">
                <Sparkles className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                {jumlahTerpilih === 0
                    ? 'Belum ada menu unggulan. Pilih maksimal 6 menu agar section tetap ringkas.'
                    : `${jumlahTerpilih} menu dipilih. Section otomatis tampil di halaman utama.`}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {hasil.map((masakan) => {
                    const foto = masakan.foto_url;

                    return (
                        <Card
                            key={masakan.id}
                            className={cn(
                                'overflow-hidden rounded-2xl border-border/70 p-0 shadow-sm transition',
                                masakan.tampil_unggulan &&
                                    'border-emerald-300 ring-1 ring-emerald-500/20 dark:border-emerald-800',
                            )}
                        >
                            <div className="relative h-32 w-full overflow-hidden bg-muted">
                                {foto ? (
                                    <img
                                        src={foto}
                                        alt={masakan.nama}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                        <ImageOff className="size-6" />
                                    </div>
                                )}
                                {masakan.tampil_unggulan && (
                                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                                        <Star className="size-3 fill-current" />
                                        Unggulan
                                    </span>
                                )}
                                {!masakan.tersedia && (
                                    <span className="absolute top-2 right-2 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                        Habis
                                    </span>
                                )}
                            </div>

                            <div className="p-3.5">
                                <p className="truncate text-sm font-semibold">
                                    {masakan.nama}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    {masakan.kategori?.nama ?? 'Tanpa kategori'}{' '}
                                    · {formatRupiah(masakan.harga)}
                                </p>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Sisa {masakan.porsi_tersedia} porsi
                                </p>

                                <Button
                                    type="button"
                                    variant={
                                        masakan.tampil_unggulan
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => toggle(masakan)}
                                    disabled={memproses === masakan.id}
                                    className={cn(
                                        'mt-3 h-8 w-full gap-1.5 rounded-lg text-xs',
                                        masakan.tampil_unggulan
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            : 'hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300',
                                    )}
                                >
                                    {masakan.tampil_unggulan ? (
                                        <>
                                            <StarOff className="size-3.5" />
                                            Keluarkan dari pilihan
                                        </>
                                    ) : (
                                        <>
                                            <Flame className="size-3.5" />
                                            Jadikan unggulan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {hasil.length === 0 && (
                <Card className="mt-4 rounded-2xl border-dashed p-10 text-center">
                    <UtensilsCrossed className="mx-auto size-8 text-muted-foreground" />
                    <p className="mt-3 text-sm font-semibold">
                        Menu tidak ditemukan
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Coba kata kunci lain atau tambah menu terlebih dahulu.
                    </p>
                </Card>
            )}
        </>
    );
}

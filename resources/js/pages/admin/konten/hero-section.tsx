import { useForm } from '@inertiajs/react';
import { Megaphone, Save, Sparkles } from 'lucide-react';

import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PengaturanToko } from '@/types';

interface Props {
    pengaturan: PengaturanToko;
}

export function HeroSection({ pengaturan }: Props) {
    const { data, setData, put, processing, errors, recentlySuccessful } =
        useForm({
            hero_badge: pengaturan.hero_badge ?? 'Masakan rumahan, rasa juara',
            hero_judul: pengaturan.hero_judul ?? '',
            hero_subjudul: pengaturan.hero_subjudul ?? '',
            hero_cta_text: pengaturan.hero_cta_text ?? 'Lihat menu',
            hero_cta_url: pengaturan.hero_cta_url ?? '#menu',
        });

    const simpan = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put('/konten/hero', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <form onSubmit={simpan} className="grid gap-5 lg:grid-cols-3">
            <Card className="rounded-2xl border-border/70 p-5 shadow-sm lg:col-span-2">
                <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <Sparkles className="size-4" />
                    </span>
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">
                            Hero beranda
                        </h2>
                        <p className="text-[11px] text-muted-foreground">
                            Teks utama di bagian atas halaman utama. Kosongkan
                            judul untuk memakai teks default.
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5 sm:col-span-2">
                        <Label htmlFor="hero_badge">
                            Badge (kecil di atas judul)
                        </Label>
                        <Input
                            id="hero_badge"
                            value={data.hero_badge}
                            onChange={(event) =>
                                setData('hero_badge', event.target.value)
                            }
                            placeholder="Masakan rumahan, rasa juara"
                            className="h-10 rounded-xl"
                        />
                        <InputError message={errors.hero_badge} />
                    </div>

                    <div className="grid gap-1.5 sm:col-span-2">
                        <Label htmlFor="hero_judul">Judul utama</Label>
                        <Input
                            id="hero_judul"
                            value={data.hero_judul}
                            onChange={(event) =>
                                setData('hero_judul', event.target.value)
                            }
                            placeholder="Lapar? Pesan masakan favoritmu di UmiqFood"
                            className="h-10 rounded-xl"
                        />
                        <InputError message={errors.hero_judul} />
                    </div>

                    <div className="grid gap-1.5 sm:col-span-2">
                        <Label htmlFor="hero_subjudul">Subjudul</Label>
                        <textarea
                            id="hero_subjudul"
                            value={data.hero_subjudul}
                            onChange={(event) =>
                                setData('hero_subjudul', event.target.value)
                            }
                            rows={3}
                            placeholder="Pilih menu, pesan dalam hitungan menit..."
                            className="w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                        />
                        <InputError message={errors.hero_subjudul} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="hero_cta_text">Teks tombol CTA</Label>
                        <Input
                            id="hero_cta_text"
                            value={data.hero_cta_text}
                            onChange={(event) =>
                                setData('hero_cta_text', event.target.value)
                            }
                            placeholder="Lihat menu"
                            className="h-10 rounded-xl"
                        />
                        <InputError message={errors.hero_cta_text} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="hero_cta_url">Link CTA</Label>
                        <Input
                            id="hero_cta_url"
                            value={data.hero_cta_url}
                            onChange={(event) =>
                                setData('hero_cta_url', event.target.value)
                            }
                            placeholder="#menu"
                            className="h-10 rounded-xl"
                        />
                        <InputError message={errors.hero_cta_url} />
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                    <p className="text-[11px] text-muted-foreground">
                        Perubahan langsung tampil di halaman utama.
                    </p>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="h-10 gap-2 rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                    >
                        <Save className="size-4" />
                        {processing ? 'Menyimpan...' : 'Simpan hero'}
                    </Button>
                </div>
            </Card>

            <Card className="rounded-2xl border-border/70 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <Megaphone className="size-4" />
                    </span>
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">
                            Pratinjau
                        </h2>
                        <p className="text-[11px] text-muted-foreground">
                            Perkiraan tampilan di beranda.
                        </p>
                    </div>
                </div>

                <div className="mt-5 rounded-xl border border-border/70 bg-muted/30 p-4">
                    <Badge className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <Sparkles className="size-3" />
                        {data.hero_badge || 'Masakan rumahan, rasa juara'}
                    </Badge>
                    <h3 className="mt-3 text-xl font-extrabold tracking-tight text-foreground">
                        {data.hero_judul ||
                            'Lapar? Pesan masakan favoritmu di UmiqFood'}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {data.hero_subjudul ||
                            'Pilih menu, pesan dalam hitungan menit, nikmati tanpa repot masak.'}
                    </p>
                    <Button
                        size="sm"
                        className="mt-4 h-9 gap-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                        {data.hero_cta_text || 'Lihat menu'}
                    </Button>
                </div>

                {recentlySuccessful && (
                    <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
                        Tersimpan.
                    </p>
                )}
            </Card>
        </form>
    );
}

import { useForm } from '@inertiajs/react';
import { MapPin, Save, Store } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PengaturanToko } from '@/types';

interface Props {
    pengaturan: PengaturanToko;
}

export function ProfilSection({ pengaturan }: Props) {
    const { data, setData, put, processing, errors, recentlySuccessful } =
        useForm({
            nama_toko: pengaturan.nama_toko ?? '',
            tagline: pengaturan.tagline ?? '',
            alamat: pengaturan.alamat ?? '',
            jam_buka: pengaturan.jam_buka ?? '',
            jam_tutup: pengaturan.jam_tutup ?? '',
            hari_tutup: pengaturan.hari_tutup ?? '',
            whatsapp: pengaturan.whatsapp ?? '',
            instagram: pengaturan.instagram ?? '',
            maps_url: pengaturan.maps_url ?? '',
            catatan_pickup: pengaturan.catatan_pickup ?? '',
            catatan_pembayaran: pengaturan.catatan_pembayaran ?? '',
        });

    const simpan = (event: React.FormEvent) => {
        event.preventDefault();

        put('/konten/toko', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <form onSubmit={simpan} className="grid gap-5 lg:grid-cols-3">
            <Card className="rounded-2xl border-border/70 p-5 shadow-sm lg:col-span-2">
                <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <Store className="size-4" />
                    </span>
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">
                            Profil toko
                        </h2>
                        <p className="text-[11px] text-muted-foreground">
                            Nama dan tagline yang tampil di halaman utama.
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                        <Label htmlFor="nama_toko">Nama toko</Label>
                        <Input
                            id="nama_toko"
                            value={data.nama_toko}
                            onChange={(event) =>
                                setData('nama_toko', event.target.value)
                            }
                            className="h-10 rounded-xl"
                        />
                        <InputError message={errors.nama_toko} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                            id="tagline"
                            value={data.tagline}
                            onChange={(event) =>
                                setData('tagline', event.target.value)
                            }
                            placeholder="Masakan rumahan, pesan tanpa repot."
                            className="h-10 rounded-xl"
                        />
                        <InputError message={errors.tagline} />
                    </div>

                    <div className="grid gap-1.5 sm:col-span-2">
                        <Label htmlFor="alamat">Alamat pickup</Label>
                        <textarea
                            id="alamat"
                            value={data.alamat}
                            onChange={(event) =>
                                setData('alamat', event.target.value)
                            }
                            rows={2}
                            placeholder="Nama jalan, nomor, kelurahan, kota"
                            className="w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                        />
                        <InputError message={errors.alamat} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="jam_buka">Jam buka</Label>
                        <Input
                            id="jam_buka"
                            value={data.jam_buka}
                            onChange={(event) =>
                                setData('jam_buka', event.target.value)
                            }
                            placeholder="08.00"
                            className="h-10 rounded-xl"
                        />
                        <InputError message={errors.jam_buka} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="jam_tutup">Jam tutup</Label>
                        <Input
                            id="jam_tutup"
                            value={data.jam_tutup}
                            onChange={(event) =>
                                setData('jam_tutup', event.target.value)
                            }
                            placeholder="20.00"
                            className="h-10 rounded-xl"
                        />
                        <InputError message={errors.jam_tutup} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="hari_tutup">Hari tutup</Label>
                        <Input
                            id="hari_tutup"
                            value={data.hari_tutup}
                            onChange={(event) =>
                                setData('hari_tutup', event.target.value)
                            }
                            placeholder="Minggu"
                            className="h-10 rounded-xl"
                        />
                        <InputError message={errors.hari_tutup} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                        <Input
                            id="whatsapp"
                            value={data.whatsapp}
                            onChange={(event) =>
                                setData('whatsapp', event.target.value)
                            }
                            placeholder="62812xxxxxxx"
                            className="h-10 rounded-xl"
                        />
                        <InputError message={errors.whatsapp} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                            id="instagram"
                            value={data.instagram}
                            onChange={(event) =>
                                setData('instagram', event.target.value)
                            }
                            placeholder="@umiqfood"
                            className="h-10 rounded-xl"
                        />
                        <InputError message={errors.instagram} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="maps_url">Link Google Maps</Label>
                        <Input
                            id="maps_url"
                            value={data.maps_url}
                            onChange={(event) =>
                                setData('maps_url', event.target.value)
                            }
                            placeholder="https://maps.app.goo.gl/..."
                            className="h-10 rounded-xl"
                        />
                        <InputError message={errors.maps_url} />
                    </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="h-10 gap-2 rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                    >
                        <Save className="size-4" />
                        {processing ? 'Menyimpan...' : 'Simpan profil'}
                    </Button>
                    {recentlySuccessful && (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            Tersimpan
                        </span>
                    )}
                </div>
            </Card>

            <div className="grid gap-5">
                <Card className="rounded-2xl border-border/70 p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300">
                            <MapPin className="size-4" />
                        </span>
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">
                                Catatan pickup
                            </h2>
                            <p className="text-[11px] text-muted-foreground">
                                Tampil di dekat info lokasi.
                            </p>
                        </div>
                    </div>
                    <textarea
                        value={data.catatan_pickup}
                        onChange={(event) =>
                            setData('catatan_pickup', event.target.value)
                        }
                        rows={4}
                        placeholder="Contoh: Ambil di pintu samping, tunjukkan kode pesanan."
                        className="mt-4 w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                    />
                    <InputError message={errors.catatan_pickup} />
                </Card>

                <Card className="rounded-2xl border-border/70 p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-foreground">
                        Catatan pembayaran
                    </h2>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        Info tambahan soal cash/QRIS. Alur pembayaran tetap
                        mengikuti sistem.
                    </p>
                    <textarea
                        value={data.catatan_pembayaran}
                        onChange={(event) =>
                            setData('catatan_pembayaran', event.target.value)
                        }
                        rows={4}
                        placeholder="Contoh: QRIS bisa dibayar di kasir saat ambil."
                        className="mt-4 w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                    />
                    <InputError message={errors.catatan_pembayaran} />
                </Card>
            </div>
        </form>
    );
}

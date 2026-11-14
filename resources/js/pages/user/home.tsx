import { Head, Link, usePage } from '@inertiajs/react';
import { Search, ShoppingBag, Utensils, LogOut } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Kategori {
    id: number;
    nama: string;
    icon?: string;
}

interface Masakan {
    id: number;
    nama: string;
    deskripsi: string | null;
    harga_format: string;
    foto_url: string | null;
    jumlah_porsi: number;
    kategori_id: number;
    kategori?: Kategori;
}

export default function UserHome() {
    const { auth, masakans, kategoris } = usePage<{
        auth: { user: { name: string; role: string } | null };
        masakans: Masakan[];
        kategoris: Kategori[];
    }>().props;

    const [search, setSearch] = useState('');
    const [kategoriAktif, setKategoriAktif] = useState<number | 'semua'>(
        'semua',
    );

    const hasil = useMemo(() => {
        return masakans.filter((item) => {
            const cocokKategori =
                kategoriAktif === 'semua' || item.kategori_id === kategoriAktif;
            const cocokCari = item.nama
                .toLowerCase()
                .includes(search.toLowerCase());
            return cocokKategori && cocokCari;
        });
    }, [masakans, search, kategoriAktif]);

    return (
        <>
            <Head title="Beranda" />

            <div className="min-h-screen bg-emerald-50/40">
                {/* Navbar */}
                <nav className="sticky top-0 z-50 border-b border-emerald-100 bg-white/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🍱</span>
                            <span className="text-xl font-bold text-emerald-600">
                                UmiqFood
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                                <ShoppingBag className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Keranjang
                                </span>
                                <span className="rounded-full bg-emerald-600 px-1.5 text-xs font-bold text-white">
                                    0
                                </span>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                                {auth.user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                title="Keluar"
                                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-red-600"
                            >
                                <LogOut className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Sapaan */}
                <section className="mx-auto max-w-6xl px-6 pt-10">
                    <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-amber-500 px-8 py-10 text-white">
                        <p className="mb-1 text-sm text-emerald-100">
                            Selamat datang kembali 👋
                        </p>
                        <h1 className="mb-2 text-3xl font-extrabold">
                            Halo, {auth.user?.name}!
                        </h1>
                        <p className="text-emerald-100">
                            Ada yang mengidam hari ini? Yuk pilih masakan
                            favoritmu di bawah.
                        </p>
                    </div>
                </section>

                {/* Pencarian + Filter Kategori */}
                <section className="mx-auto max-w-6xl px-6 py-8">
                    <div className="relative mb-5">
                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari masakan... contoh: Nasi Goreng"
                            className="w-full rounded-xl border border-emerald-100 bg-white py-3 pr-4 pl-11 text-sm shadow-sm transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setKategoriAktif('semua')}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                kategoriAktif === 'semua'
                                    ? 'bg-emerald-600 text-white shadow'
                                    : 'border border-emerald-100 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'
                            }`}
                        >
                            🍽️ Semua
                        </button>
                        {kategoris.map((kategori) => (
                            <button
                                key={kategori.id}
                                onClick={() => setKategoriAktif(kategori.id)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                    kategoriAktif === kategori.id
                                        ? 'bg-emerald-600 text-white shadow'
                                        : 'border border-emerald-100 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'
                                }`}
                            >
                                {kategori.icon} {kategori.nama}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Daftar Menu */}
                <section className="mx-auto max-w-6xl px-6 pb-16">
                    {hasil.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-12 text-center">
                            <div className="mb-3 text-4xl">🔍</div>
                            <p className="font-medium text-gray-700">
                                Menu tidak ditemukan
                            </p>
                            <p className="text-sm text-gray-400">
                                Coba kata kunci lain atau pilih kategori
                                "Semua".
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {hasil.map((item) => (
                                <div
                                    key={item.id}
                                    className="group overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                >
                                    {item.foto_url ? (
                                        <img
                                            src={item.foto_url}
                                            alt={item.nama}
                                            className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex aspect-video w-full items-center justify-center bg-emerald-100 text-5xl">
                                            <Utensils className="h-10 w-10 text-emerald-400" />
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">
                                                {item.kategori?.icon}{' '}
                                                {item.kategori?.nama || '-'}
                                            </span>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    item.jumlah_porsi > 0
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {item.jumlah_porsi > 0
                                                    ? `Sisa ${item.jumlah_porsi} porsi`
                                                    : 'Porsi habis'}
                                            </span>
                                        </div>
                                        <h3 className="mt-1 font-semibold text-gray-900">
                                            {item.nama}
                                        </h3>
                                        <p className="mt-0.5 line-clamp-2 min-h-10 text-sm text-gray-500">
                                            {item.deskripsi ||
                                                'Masakan spesial buatan rumahan.'}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="font-bold text-emerald-600">
                                                {item.harga_format}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    alert(
                                                        'Fitur keranjang & pemesanan segera hadir! 🚧',
                                                    )
                                                }
                                                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                                            >
                                                + Keranjang
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Footer */}
                <footer className="border-t border-emerald-100 bg-white py-6 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} UmiqFood — Lapar? UmiqFood aja.
                </footer>
            </div>
        </>
    );
}

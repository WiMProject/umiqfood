import { Head, Link, usePage } from '@inertiajs/react';
import { ChefHat, Clock, ShieldCheck, Star, Utensils, ArrowRight, Phone } from 'lucide-react';

interface Kategori {
    id: number;
    nama: string;
    icon?: string;
    masakans_count?: number;
}

interface Masakan {
    id: number;
    nama: string;
    deskripsi: string | null;
    harga_format: string;
    foto_url: string | null;
    kategori?: Kategori;
}

export default function Welcome() {
    const { auth, masakans, kategoris } = usePage<{
        auth: { user: { name: string; role: string } | null };
        masakans: Masakan[];
        kategoris: Kategori[];
    }>().props;

    return (
        <>
            <Head title="UmiqFood — Selamat Datang" />

            <div className="min-h-screen bg-orange-50/50">
                {/* Navbar */}
                <nav className="sticky top-0 z-50 border-b border-orange-100 bg-white/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🍱</span>
                            <span className="text-xl font-bold text-orange-600">
                                UmiqFood
                            </span>
                        </div>

                        <div className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
                            <a href="#menu" className="transition hover:text-orange-600">
                                Menu
                            </a>
                            <a href="#kategori" className="transition hover:text-orange-600">
                                Kategori
                            </a>
                            <a href="#cara-pesan" className="transition hover:text-orange-600">
                                Cara Pesan
                            </a>
                        </div>

                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={auth.user.role === 'admin' ? '/dashboard' : '/home'}
                                    className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"
                                >
                                    {auth.user.role === 'admin' ? '⚙️ Dashboard Admin' : '🏠 Ke Halaman User'}
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <section className="relative overflow-hidden">
                    <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
                        <div>
                            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-700">
                                <ChefHat className="h-4 w-4" /> Masakan rumahan, rasa juara
                            </span>
                            <h1 className="mb-4 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
                                Lapar? Pesan Masakan{' '}
                                <span className="text-orange-600">Favoritmu</span> di UmiqFood!
                            </h1>
                            <p className="mb-8 text-lg text-gray-500">
                                Aplikasi pemesanan masakan praktis dan lezat. Pilih menu,
                                pesan dalam hitungan menit, nikmati tanpa repot masak.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="#menu"
                                    className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                                >
                                    Lihat Menu <ArrowRight className="h-4 w-4" />
                                </Link>
                                {!auth.user && (
                                    <Link
                                        href="/register"
                                        className="rounded-xl border border-orange-200 bg-white px-6 py-3 font-semibold text-orange-700 transition hover:bg-orange-50"
                                    >
                                        Daftar Sekarang
                                    </Link>
                                )}
                            </div>

                            {/* Keunggulan */}
                            <div className="mt-10 grid grid-cols-3 gap-4 text-center">
                                {[
                                    { icon: Utensils, label: 'Menu Beragam' },
                                    { icon: Clock, label: 'Pesan Cepat' },
                                    { icon: ShieldCheck, label: 'Terpercaya' },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-orange-600 shadow-sm">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <p className="text-xs font-medium text-gray-600">
                                            {item.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hero visual: menampilkan 3 foto menu */}
                        <div className="relative hidden md:block">
                            <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-orange-200/50 blur-3xl" />
                            <div className="relative grid grid-cols-2 gap-4">
                                <div className="mt-8 space-y-4">
                                    {masakans[0]?.foto_url ? (
                                        <img
                                            src={masakans[0].foto_url}
                                            alt={masakans[0].nama}
                                            className="aspect-square w-full rounded-2xl object-cover shadow-lg"
                                        />
                                    ) : (
                                        <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-orange-100 text-6xl shadow-lg">
                                            🍛
                                        </div>
                                    )}
                                    {masakans[1]?.foto_url ? (
                                        <img
                                            src={masakans[1].foto_url}
                                            alt={masakans[1].nama}
                                            className="aspect-square w-full rounded-2xl object-cover shadow-lg"
                                        />
                                    ) : (
                                        <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-amber-100 text-6xl shadow-lg">
                                            🍜
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    {masakans[2]?.foto_url ? (
                                        <img
                                            src={masakans[2].foto_url}
                                            alt={masakans[2].nama}
                                            className="aspect-square w-full rounded-2xl object-cover shadow-lg"
                                        />
                                    ) : (
                                        <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-rose-100 text-6xl shadow-lg">
                                            🍗
                                        </div>
                                    )}
                                    <div className="rounded-2xl bg-orange-600 p-5 text-white shadow-lg shadow-orange-600/30">
                                        <div className="flex items-center gap-1 text-yellow-300">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-current" />
                                            ))}
                                        </div>
                                        <p className="mt-2 text-sm font-medium">
                                            "Masakannya enak-enak, pesannya gampang!"
                                        </p>
                                        <p className="mt-1 text-xs text-orange-200">
                                            — Pelanggan UmiqFood
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Kategori */}
                <section id="kategori" className="mx-auto max-w-6xl px-6 py-12">
                    <h2 className="mb-6 text-2xl font-bold text-gray-900">
                        Mau masakan apa hari ini?
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {kategoris.map((kategori) => (
                            <div
                                key={kategori.id}
                                className="flex items-center gap-2 rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50"
                            >
                                <span className="text-lg">{kategori.icon}</span>
                                {kategori.nama}
                                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                                    {kategori.masakans_count ?? 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Menu Andalan */}
                <section id="menu" className="mx-auto max-w-6xl px-6 py-12">
                    <div className="mb-6 flex items-end justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Menu Andalan</h2>
                            <p className="text-sm text-gray-500">
                                Masakan tersedia yang baru ditambahkan.
                            </p>
                        </div>
                        <Link
                            href={auth.user ? '/home' : '/login'}
                            className="hidden items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 sm:inline-flex"
                        >
                            Lihat semua <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {masakans.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-12 text-center">
                            <div className="mb-3 text-4xl">🍽️</div>
                            <p className="font-medium text-gray-700">Menu belum tersedia</p>
                            <p className="text-sm text-gray-400">
                                Admin belum menambahkan menu. Nantikan update menunya!
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {masakans.map((item) => (
                                <div
                                    key={item.id}
                                    className="group overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                >
                                    {item.foto_url ? (
                                        <img
                                            src={item.foto_url}
                                            alt={item.nama}
                                            className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex aspect-video w-full items-center justify-center bg-orange-100 text-5xl">
                                            🍱
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <span className="text-xs text-gray-400">
                                            {item.kategori?.icon} {item.kategori?.nama || '-'}
                                        </span>
                                        <h3 className="mt-1 font-semibold text-gray-900">
                                            {item.nama}
                                        </h3>
                                        <p className="mt-0.5 line-clamp-2 min-h-10 text-sm text-gray-500">
                                            {item.deskripsi || 'Masakan spesial buatan rumahan.'}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="font-bold text-orange-600">
                                                {item.harga_format}
                                            </span>
                                            <Link
                                                href={auth.user ? '/home' : '/login'}
                                                className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-600 hover:text-white"
                                            >
                                                + Pesan
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Cara Pesan */}
                <section id="cara-pesan" className="mx-auto max-w-6xl px-6 py-12">
                    <div className="rounded-3xl bg-orange-600 px-8 py-12 text-center text-white md:px-16">
                        <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                            Pesan dalam 3 langkah
                        </h2>
                        <p className="mb-10 text-orange-200">
                            Semudah itu, masakan siap dinikmati.
                        </p>
                        <div className="grid gap-8 md:grid-cols-3">
                            {[
                                { emoji: '📝', title: '1. Pilih Menu', desc: 'Jelajahi katalog masakan dan pilih favoritmu.' },
                                { emoji: '🛒', title: '2. Masukkan Keranjang', desc: 'Atur pesanan sesuai selera dan jumlahnya.' },
                                { emoji: '🍽️', title: '3. Pesanan Siap', desc: 'Tunggu konfirmasi, lalu nikmati masakannya!' },
                            ].map((step) => (
                                <div key={step.title} className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                                    <div className="mb-3 text-4xl">{step.emoji}</div>
                                    <h3 className="mb-1 font-semibold">{step.title}</h3>
                                    <p className="text-sm text-orange-100">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-orange-100 bg-white">
                    <div className="mx-auto max-w-6xl px-6 py-10">
                        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                            <div>
                                <div className="mb-1 flex items-center gap-2">
                                    <span className="text-2xl">🍱</span>
                                    <span className="text-lg font-bold text-orange-600">UmiqFood</span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Masakan rumahan favorit, pesan di mana aja.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Phone className="h-4 w-4 text-orange-600" />
                                Butuh bantuan? Hubungi kami di 0812-3456-7890
                            </div>
                        </div>
                        <p className="mt-8 text-center text-xs text-gray-400">
                            © {new Date().getFullYear()} UmiqFood. Semua hak dilindungi.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\Kupon;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\PengaturanToko;
use App\Models\Pengumuman;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KontenController extends Controller
{
    /**
     * Satu halaman untuk mengelola seluruh konten halaman utama.
     */
    public function index(): Response
    {
        $promos = Pengumuman::query()
            ->with('kupon:id,kode,nama,tipe,nilai,aktif,mulai,selesai')
            ->orderBy('urutan')
            ->orderByDesc('id')
            ->get();

        $kupons = Kupon::query()
            ->withCount([
                'orders as total_pemakaian' => fn ($query) => $query
                    ->where('status', '!=', Order::STATUS_DIBATALKAN),
            ])
            ->withSum([
                'orders as total_diskon' => fn ($query) => $query
                    ->where('status', '!=', Order::STATUS_DIBATALKAN),
            ], 'diskon')
            ->orderByDesc('id')
            ->get();

        $faqs = Faq::query()
            ->orderBy('urutan')
            ->orderBy('id')
            ->get();

        $masakans = Masakan::query()
            ->with('kategori:id,nama')
            ->withPorsiTersedia()
            ->orderBy('nama')
            ->get(['id', 'nama', 'harga', 'foto', 'tersedia', 'tampil_unggulan', 'kategori_id', 'jumlah_porsi']);

        return Inertia::render('admin/konten/index', [
            'pengaturan' => PengaturanToko::current(),
            'promos' => $promos,
            'kupons' => $kupons,
            'faqs' => $faqs,
            'masakans' => $masakans,
            'opsiKupon' => $kupons->map(fn (Kupon $kupon): array => [
                'id' => $kupon->id,
                'kode' => $kupon->kode,
                'nama' => $kupon->nama,
                'aktif' => $kupon->aktif,
            ])->values(),
            'stats' => [
                'promo_aktif' => $promos->where('aktif', true)->count(),
                'kupon_aktif' => $kupons->where('aktif', true)->count(),
                'faq_aktif' => $faqs->where('aktif', true)->count(),
                'menu_unggulan' => $masakans->where('tampil_unggulan', true)->count(),
            ],
        ]);
    }

    /**
     * Simpan profil toko, jam buka, kontak, dan catatan pembayaran.
     */
    public function updateToko(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_toko' => ['required', 'string', 'max:100'],
            'tagline' => ['nullable', 'string', 'max:150'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'jam_buka' => ['nullable', 'string', 'max:20'],
            'jam_tutup' => ['nullable', 'string', 'max:20'],
            'hari_tutup' => ['nullable', 'string', 'max:100'],
            'whatsapp' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s()]*$/'],
            'instagram' => ['nullable', 'string', 'max:100'],
            'maps_url' => ['nullable', 'url', 'max:2048'],
            'catatan_pickup' => ['nullable', 'string', 'max:1000'],
            'catatan_pembayaran' => ['nullable', 'string', 'max:1000'],
        ]);

        PengaturanToko::current()->update($validated);

        return $this->toast('success', 'Profil toko berhasil disimpan.');
    }

    /**
     * Tampilkan atau sembunyikan satu menu di bagian "Pilihan Hari Ini".
     */
    public function toggleUnggulan(Masakan $masakan): RedirectResponse
    {
        $masakan->update(['tampil_unggulan' => ! $masakan->tampil_unggulan]);

        return $this->toast(
            'success',
            $masakan->tampil_unggulan
                ? "{$masakan->nama} ditambahkan ke Pilihan Hari Ini."
                : "{$masakan->nama} dikeluarkan dari Pilihan Hari Ini.",
        );
    }

    private function toast(string $type, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return back();
    }
}

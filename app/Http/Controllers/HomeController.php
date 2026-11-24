<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use App\Models\Kategori;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PengaturanToko;
use App\Models\Pengumuman;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Katalog menu untuk user: foto, harga, keterangan, porsi, dan ulasan.
     * Resep dan bahan baku tidak pernah dikirim ke halaman ini.
     */
    public function index(Request $request): Response
    {
        $masakans = $this->katalog()->get();

        $kategoris = Kategori::all();

        $menuSelesai = OrderItem::query()
            ->whereNotNull('masakan_id')
            ->whereHas('order', fn ($query) => $query
                ->where('user_id', $request->user()->id)
                ->where('status', Order::STATUS_SELESAI))
            ->pluck('masakan_id')
            ->unique()
            ->values()
            ->all();

        return Inertia::render('user/home', [
            'masakans' => $masakans,
            'kategoris' => $kategoris,
            'menuSelesai' => $menuSelesai,
        ]);
    }

    /**
     * Halaman depan publik: katalog, foto, harga, porsi, dan ulasan.
     * Hanya untuk dilihat; formulir ulasan tetap khusus pelanggan yang login.
     */
    public function welcome(): Response
    {
        // Kartu hero memakai semua menu yang ada sekarang, termasuk yang habis.
        $heroMasakans = Masakan::query()
            ->with(['kategori', 'fotos'])
            ->withPorsiTersedia()
            ->latest()
            ->get();

        $menuUnggulan = Masakan::query()
            ->with(['kategori', 'fotos'])
            ->withPorsiTersedia()
            ->where('tampil_unggulan', true)
            ->where('tersedia', true)
            ->latest()
            ->get()
            ->filter(fn (Masakan $masakan): bool => $masakan->porsi_tersedia > 0)
            ->take(6)
            ->values();

        $reorderMasakans = collect();

        if ($request->user()) {
            $masakanIds = OrderItem::query()
                ->whereNotNull('masakan_id')
                ->whereHas('order', fn ($query) => $query
                    ->where('user_id', $request->user()->id)
                    ->where('status', Order::STATUS_SELESAI))
                ->pluck('masakan_id')
                ->unique()
                ->take(6)
                ->all();

            if ($masakanIds !== []) {
                $reorderMasakans = Masakan::query()
                    ->with(['kategori', 'fotos'])
                    ->withPorsiTersedia()
                    ->whereIn('id', $masakanIds)
                    ->where('tersedia', true)
                    ->get();
            }
        }

        return Inertia::render('welcome', [
            'masakans' => $this->katalog(12)->take(24)->get(),
            'heroMasakans' => $heroMasakans,
            'kategoris' => Kategori::withCount('masakans')->get(),
            'menuUnggulan' => $menuUnggulan,
            'reorderMasakans' => $reorderMasakans,
            'promos' => Pengumuman::query()
                ->with('kupon:id,kode,nama,tipe,nilai,maks_diskon,min_subtotal,aktif,mulai,selesai')
                ->tampil()
                ->take(6)
                ->get(),
            'faqs' => Faq::query()->aktif()->take(10)->get(['id', 'pertanyaan', 'jawaban']),
            'pengaturanToko' => PengaturanToko::current(),
        ]);
    }

    /**
     * Query katalog yang dipakai halaman publik dan halaman user.
     *
     * @return Builder<Masakan>
     */
    private function katalog(int $batasUlasan = 50): Builder
    {
        return Masakan::query()
            ->with([
                'kategori',
                'fotos',
                'reviews' => fn ($query) => $query->latest()->take($batasUlasan),
            ])
            ->withPorsiTersedia()
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->where('tersedia', true)
            ->latest();
    }
}

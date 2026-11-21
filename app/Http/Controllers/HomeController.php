<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\OrderItem;
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
            ->latest()
            ->get();

        return Inertia::render('welcome', [
            'masakans' => $this->katalog(12)->take(24)->get(),
            'heroMasakans' => $heroMasakans,
            'kategoris' => Kategori::withCount('masakans')->get(),
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
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->where('tersedia', true)
            ->latest();
    }
}

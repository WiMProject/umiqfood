<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\OrderItem;
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
        $masakans = Masakan::query()
            ->with([
                'kategori',
                'reviews' => fn ($query) => $query->latest()->take(50),
            ])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->where('tersedia', true)
            ->latest()
            ->get();

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
}

<?php

namespace App\Http\Middleware;

use App\Models\Masakan;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'keranjang' => function () use ($request): array {
                $user = $request->user();

                if (! $user || ! $user->isUser()) {
                    return ['jumlah' => 0, 'subtotal' => 0];
                }

                $items = $user->cartItems()
                    ->with('masakan:id,harga')
                    ->get();

                return [
                    'jumlah' => (int) $items->sum('jumlah'),
                    'subtotal' => (int) $items->sum(
                        fn ($item) => $item->masakan->harga * $item->jumlah,
                    ),
                ];
            },
            'pesananAktif' => function () use ($request): int {
                $user = $request->user();

                if (! $user || ! $user->isUser()) {
                    return 0;
                }

                return $user->orders()
                    ->whereIn('status', [
                        Order::STATUS_MENUNGGU,
                        Order::STATUS_DIMASAK,
                        Order::STATUS_SIAP,
                    ])
                    ->count();
            },
            'authShowcase' => function () use ($request): ?array {
                if (! $request->routeIs('login', 'register')) {
                    return null;
                }

                return [
                    'menus' => Masakan::query()
                        ->with('kategori:id,nama,icon')
                        ->withCount('reviews')
                        ->withAvg('reviews', 'rating')
                        ->where('tersedia', true)
                        ->orderByDesc('reviews_count')
                        ->latest()
                        ->take(16)
                        ->get()
                        ->map(fn (Masakan $masakan): array => [
                            'id' => $masakan->id,
                            'nama' => $masakan->nama,
                            'harga_format' => $masakan->harga_format,
                            'kategori' => $masakan->kategori?->nama,
                            'icon' => $masakan->kategori?->icon,
                            'reviews_count' => (int) $masakan->getAttribute('reviews_count'),
                            'reviews_avg_rating' => $masakan->getAttribute('reviews_avg_rating'),
                        ])
                        ->all(),
                    'reviews' => Review::query()
                        ->with('masakan:id,nama')
                        ->whereNotNull('komentar')
                        ->where('komentar', '!=', '')
                        ->latest()
                        ->take(12)
                        ->get()
                        ->map(fn (Review $review): array => [
                            'id' => $review->id,
                            'nama' => $review->nama,
                            'komentar' => (string) $review->komentar,
                            'rating' => $review->rating,
                            'menu' => $review->masakan?->nama,
                            'terverifikasi' => $review->terverifikasi,
                        ])
                        ->all(),
                ];
            },
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}

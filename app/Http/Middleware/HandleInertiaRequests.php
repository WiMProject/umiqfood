<?php

namespace App\Http\Middleware;

use App\Models\Order;
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
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}

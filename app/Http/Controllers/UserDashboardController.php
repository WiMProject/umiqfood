<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserDashboardController extends Controller
{
    public function __construct(private readonly OrderService $orderService) {}

    /**
     * Dashboard user: ringkasan, keranjang, pesanan, dan pembayaran.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $cartItems = $user->cartItems()
            ->with('masakan.kategori')
            ->latest()
            ->get();

        $orders = $user->orders()
            ->with(['items', 'payment'])
            ->latest()
            ->take(30)
            ->get();

        $payments = Payment::query()
            ->whereHas('order', fn ($query) => $query->where('user_id', $user->id))
            ->with('order')
            ->latest()
            ->take(30)
            ->get();

        $activeOrder = $orders->first(fn (Order $order) => $order->isActive());

        return Inertia::render('user/dashboard', [
            'tab' => $request->string('tab')->toString() ?: 'ringkasan',
            'cartItems' => $cartItems,
            'orders' => $orders,
            'payments' => $payments,
            'activeOrder' => $activeOrder,
            'stats' => [
                'totalPesanan' => $user->orders()->count(),
                'pesananAktif' => $user->orders()
                    ->whereIn('status', [Order::STATUS_MENUNGGU, Order::STATUS_DIMASAK, Order::STATUS_SIAP])
                    ->count(),
                'totalBelanja' => (int) Payment::query()
                    ->whereHas('order', fn ($query) => $query->where('user_id', $user->id))
                    ->where('status', Payment::STATUS_BERHASIL)
                    ->sum('jumlah'),
                'totalItemKeranjang' => $cartItems->sum('jumlah'),
            ],
        ]);
    }

    /**
     * Batalkan pesanan yang belum mulai dimasak.
     */
    public function batal(Request $request, Order $order): RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        if ($order->status !== Order::STATUS_MENUNGGU) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Pesanan sudah diproses, hubungi kasir untuk pembatalan.',
            ]);

            return back();
        }

        $this->orderService->cancel($order);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Pesanan dibatalkan dan porsi dikembalikan ke menu.',
        ]);

        return back();
    }
}

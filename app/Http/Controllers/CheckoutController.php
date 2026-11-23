<?php

namespace App\Http\Controllers;

use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function __construct(private readonly OrderService $orderService) {}

    /**
     * Buat pesanan pickup dari keranjang.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_pengambil' => 'required|string|max:100',
            'no_hp' => ['required', 'string', 'max:30', 'regex:/^[0-9+\-\s()]{8,30}$/'],
            'metode_pembayaran' => 'required|in:cash,qris',
            'catatan' => 'nullable|string|max:500',
            'kode_kupon' => 'nullable|string|max:30',
        ]);

        $order = $this->orderService->createFromCart($request->user(), $validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Pesanan {$order->kode} dibuat. Nomor antrian {$order->antrian_format}.",
        ]);

        return to_route('user.dashboard', ['tab' => 'pesanan']);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PesananController extends Controller
{
    public function __construct(private readonly OrderService $orderService) {}

    /**
     * Daftar pesanan pickup untuk admin.
     */
    public function index(): Response
    {
        $orders = Order::query()
            ->with(['items', 'payment', 'user:id,name,email'])
            ->latest()
            ->take(100)
            ->get();

        $hariIni = now()->toDateString();

        return Inertia::render('admin/pesanan/index', [
            'orders' => $orders,
            'stats' => [
                'antrianHariIni' => Order::query()
                    ->whereDate('tanggal', $hariIni)
                    ->count(),
                'aktif' => Order::query()
                    ->whereIn('status', [Order::STATUS_MENUNGGU, Order::STATUS_DIMASAK, Order::STATUS_SIAP])
                    ->count(),
                'siapDiambil' => Order::query()
                    ->where('status', Order::STATUS_SIAP)
                    ->count(),
                'pendapatanHariIni' => (int) Payment::query()
                    ->where('status', Payment::STATUS_BERHASIL)
                    ->whereDate('dibayar_at', $hariIni)
                    ->sum('jumlah'),
                'antrianTerakhir' => (int) Order::query()
                    ->whereDate('tanggal', $hariIni)
                    ->max('nomor_antrian'),
            ],
        ]);
    }

    /**
     * Validasi pembayaran pesanan setelah admin mengecek kasir.
     */
    public function konfirmasiPembayaran(Order $order): RedirectResponse
    {
        $order = $this->orderService->confirmPayment($order);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Pembayaran {$order->antrian_format} ditandai lunas.",
        ]);

        return back();
    }

    /**
     * Ubah status pesanan (mulai masak, siap diambil, selesai, batal).
     */
    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:dimasak,siap,selesai,dibatalkan',
        ]);

        $order = $this->orderService->updateStatus($order, $validated['status']);

        $pesan = match ($order->status) {
            Order::STATUS_DIMASAK => "Pesanan {$order->antrian_format} mulai dimasak.",
            Order::STATUS_SIAP => "Pesanan {$order->antrian_format} siap diambil.",
            Order::STATUS_SELESAI => "Pesanan {$order->antrian_format} selesai dan lunas.",
            default => "Pesanan {$order->antrian_format} dibatalkan.",
        };

        Inertia::flash('toast', ['type' => 'success', 'message' => $pesan]);

        return back();
    }
}

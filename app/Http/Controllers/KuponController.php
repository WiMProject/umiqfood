<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Services\KuponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class KuponController extends Controller
{
    public function __construct(private readonly KuponService $kuponService) {}

    /**
     * Cek kupon dari isi keranjang saat ini untuk pratinjau di halaman checkout.
     */
    public function cek(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:30'],
        ]);

        $subtotal = CartItem::query()
            ->where('user_id', $request->user()->id)
            ->with('masakan')
            ->get()
            ->sum(fn (CartItem $item): int => (int) $item->masakan->harga * $item->jumlah);

        try {
            $hasil = $this->kuponService->validasi(
                $validated['kode'],
                $request->user(),
                $subtotal,
            );
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => collect($exception->errors())->flatten()->first(),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'kode' => $hasil['kupon']->kode,
            'nama' => $hasil['kupon']->nama,
            'diskon' => $hasil['diskon'],
            'total' => $hasil['total'],
            'subtotal' => $subtotal,
        ]);
    }
}

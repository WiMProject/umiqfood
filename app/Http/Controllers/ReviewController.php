<?php

namespace App\Http\Controllers;

use App\Models\Masakan;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ReviewController extends Controller
{
    /**
     * Simpan atau perbarui ulasan pelanggan untuk satu menu.
     * Hanya pelanggan dengan pesanan berstatus selesai yang boleh mengulas.
     */
    public function store(Request $request, Masakan $masakan): RedirectResponse
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'komentar' => ['nullable', 'string', 'max:500'],
        ]);

        $sudahSelesai = OrderItem::query()
            ->where('masakan_id', $masakan->id)
            ->whereHas('order', fn ($query) => $query
                ->where('user_id', $request->user()->id)
                ->where('status', Order::STATUS_SELESAI))
            ->exists();

        if (! $sudahSelesai) {
            throw ValidationException::withMessages([
                'ulasan' => 'Ulasan bisa dikirim setelah pesananmu berstatus selesai.',
            ]);
        }

        Review::updateOrCreate(
            [
                'masakan_id' => $masakan->id,
                'user_id' => $request->user()->id,
            ],
            [
                'nama' => $request->user()->name,
                'rating' => $validated['rating'],
                'komentar' => $validated['komentar'] ?? null,
                'terverifikasi' => true,
            ],
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Terima kasih! Ulasanmu sudah tersimpan.',
        ]);

        return back();
    }
}

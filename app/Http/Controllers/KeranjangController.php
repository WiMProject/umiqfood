<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Masakan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KeranjangController extends Controller
{
    /**
     * Tambahkan menu ke keranjang user.
     */
    public function store(Request $request, Masakan $masakan): RedirectResponse
    {
        $validated = $request->validate([
            'jumlah' => 'nullable|integer|min:1|max:50',
        ]);

        $jumlah = (int) ($validated['jumlah'] ?? 1);
        $item = CartItem::firstOrNew(
            [
                'user_id' => $request->user()->id,
                'masakan_id' => $masakan->id,
            ],
            ['jumlah' => 0],
        );

        $pesan = $this->pesanJikaPorsiTidakCukup($masakan, $item->jumlah + $jumlah);

        if ($pesan !== null) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $pesan]);

            return back();
        }

        $item->jumlah += $jumlah;
        $item->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$masakan->nama} ditambahkan ke keranjang.",
        ]);

        return back();
    }

    /**
     * Ubah jumlah satu item di keranjang.
     */
    public function update(Request $request, Masakan $masakan): RedirectResponse
    {
        $validated = $request->validate([
            'jumlah' => 'required|integer|min:1|max:50',
        ]);

        $item = CartItem::query()
            ->where('user_id', $request->user()->id)
            ->where('masakan_id', $masakan->id)
            ->firstOrFail();

        $pesan = $this->pesanJikaPorsiTidakCukup($masakan, (int) $validated['jumlah']);

        if ($pesan !== null) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $pesan]);

            return back();
        }

        $item->update(['jumlah' => (int) $validated['jumlah']]);

        return back();
    }

    /**
     * Hapus satu menu dari keranjang.
     */
    public function destroy(Request $request, Masakan $masakan): RedirectResponse
    {
        CartItem::query()
            ->where('user_id', $request->user()->id)
            ->where('masakan_id', $masakan->id)
            ->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Menu dihapus dari keranjang.',
        ]);

        return back();
    }

    /**
     * Kosongkan seluruh keranjang.
     */
    public function clear(Request $request): RedirectResponse
    {
        CartItem::query()->where('user_id', $request->user()->id)->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Keranjang dikosongkan.',
        ]);

        return back();
    }

    private function pesanJikaPorsiTidakCukup(Masakan $masakan, int $jumlah): ?string
    {
        // Stok yang boleh dipesan adalah stok fisik dikurangi pesanan aktif
        // yang belum lunas, supaya angka di katalog tidak menyesatkan.
        $masakan->load('porsiReservasi');
        $tersedia = $masakan->porsi_tersedia;

        if (! $masakan->tersedia || $tersedia < 1) {
            return 'Menu ini sedang habis.';
        }

        if ($jumlah > $tersedia) {
            return "Porsi {$masakan->nama} tinggal {$tersedia}.";
        }

        return null;
    }
}

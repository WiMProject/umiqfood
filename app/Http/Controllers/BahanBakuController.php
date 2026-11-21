<?php

namespace App\Http\Controllers;

use App\Models\BahanBaku;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BahanBakuController extends Controller
{
    /**
     * Tampilkan daftar bahan baku (inventori)
     */
    public function index(): Response
    {
        $bahanBakus = BahanBaku::withCount('resepItems')
            ->orderBy('nama')
            ->get();

        return Inertia::render('admin/inventori/index', [
            'bahanBakus' => $bahanBakus,
            'stats' => [
                'total' => $bahanBakus->count(),
                'menipis' => $bahanBakus->where('stok_menipis', true)->count(),
                'habis' => $bahanBakus->where('stok', '<=', 0)->count(),
                'nilai_stok' => (int) round($bahanBakus->sum(
                    fn (BahanBaku $bahan): float => (float) $bahan->stok * (float) $bahan->harga_beli,
                )),
            ],
        ]);
    }

    /**
     * Simpan bahan baku baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'satuan' => 'required|string|max:20',
            'stok' => 'required|numeric|min:0',
            'stok_minimum' => 'required|numeric|min:0',
            'harga_beli' => 'required|numeric|min:0',
        ]);

        BahanBaku::create($validated);

        return $this->toast('success', 'Bahan baku berhasil ditambahkan!');
    }

    /**
     * Update bahan baku
     */
    public function update(Request $request, BahanBaku $inventori): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'satuan' => 'required|string|max:20',
            'stok' => 'required|numeric|min:0',
            'stok_minimum' => 'required|numeric|min:0',
            'harga_beli' => 'required|numeric|min:0',
        ]);

        $inventori->update($validated);

        return $this->toast('success', 'Bahan baku berhasil diperbarui!');
    }

    /**
     * Hapus bahan baku
     */
    public function destroy(BahanBaku $inventori): RedirectResponse
    {
        if ($inventori->resepItems()->exists()) {
            return $this->toast(
                'error',
                'Bahan baku ini masih dipakai di resep menu. Hapus dari resep terlebih dahulu.'
            );
        }

        $inventori->delete();

        return $this->toast('success', 'Bahan baku berhasil dihapus!');
    }

    /**
     * Kirim notifikasi toast lewat Inertia lalu kembali ke halaman sebelumnya.
     */
    private function toast(string $type, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return back();
    }
}

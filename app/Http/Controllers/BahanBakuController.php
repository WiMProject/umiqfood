<?php

namespace App\Http\Controllers;

use App\Models\BahanBaku;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BahanBakuController extends Controller
{
    /**
     * Tampilkan daftar bahan baku (inventori)
     */
    public function index()
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
            ],
        ]);
    }

    /**
     * Simpan bahan baku baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'satuan' => 'required|string|max:20',
            'stok' => 'required|numeric|min:0',
            'stok_minimum' => 'required|numeric|min:0',
        ]);

        BahanBaku::create($validated);

        return $this->toast('success', 'Bahan baku berhasil ditambahkan!');
    }

    /**
     * Update bahan baku
     */
    public function update(Request $request, BahanBaku $inventori)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'satuan' => 'required|string|max:20',
            'stok' => 'required|numeric|min:0',
            'stok_minimum' => 'required|numeric|min:0',
        ]);

        $inventori->update($validated);

        return $this->toast('success', 'Bahan baku berhasil diperbarui!');
    }

    /**
     * Hapus bahan baku
     */
    public function destroy(BahanBaku $inventori)
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
    private function toast(string $type, string $message)
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return back();
    }
}

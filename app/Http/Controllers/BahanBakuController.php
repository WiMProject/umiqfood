<?php

namespace App\Http\Controllers;

use App\Models\BahanBaku;
use App\Models\StokMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        DB::transaction(function () use ($validated): void {
            $bahan = BahanBaku::create($validated);

            if ((float) $bahan->stok > 0) {
                StokMovement::catat([
                    'jenis' => StokMovement::JENIS_MASUK,
                    'sumber' => StokMovement::SUMBER_PENYESUAIAN,
                    'jumlah' => $bahan->stok,
                    'satuan' => $bahan->satuan,
                    'bahan_baku_id' => $bahan->id,
                    'harga_satuan' => $bahan->harga_beli,
                    'keterangan' => 'Stok awal '.$bahan->nama,
                ]);
            }
        });

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

        $stokLama = (float) $inventori->stok;
        $stokBaru = (float) $validated['stok'];

        DB::transaction(function () use ($inventori, $validated, $stokLama, $stokBaru): void {
            $inventori->update($validated);

            if (abs($stokBaru - $stokLama) > 0.001) {
                StokMovement::catat([
                    'jenis' => $stokBaru > $stokLama
                        ? StokMovement::JENIS_MASUK
                        : StokMovement::JENIS_KELUAR,
                    'sumber' => StokMovement::SUMBER_PENYESUAIAN,
                    'jumlah' => abs($stokBaru - $stokLama),
                    'satuan' => $inventori->satuan,
                    'bahan_baku_id' => $inventori->id,
                    'harga_satuan' => $inventori->harga_beli,
                    'keterangan' => 'Penyesuaian manual stok '.$inventori->nama,
                ]);
            }
        });

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

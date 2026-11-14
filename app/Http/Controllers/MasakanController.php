<?php

namespace App\Http\Controllers;

use App\Models\BahanBaku;
use App\Models\Kategori;
use App\Models\Masakan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MasakanController extends Controller
{
    /**
     * Tampilkan daftar semua masakan
     */
    public function index(): Response
    {
        $masakans = Masakan::with(['kategori', 'resepItems.bahanBaku'])
            ->latest()
            ->get()
            ->each->append('max_porsi');

        $kategoris = Kategori::all();
        $bahanBakus = BahanBaku::orderBy('nama')->get();

        return Inertia::render('admin/masakan/index', [
            'masakans' => $masakans,
            'kategoris' => $kategoris,
            'bahanBakus' => $bahanBakus,
        ]);
    }

    /**
     * Simpan masakan baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'kategori_id' => 'required|exists:kategoris,id',
            'tersedia' => 'boolean',
            'jumlah_porsi' => 'nullable|integer|min:0',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'resep' => 'nullable|array',
            'resep.*.bahan_baku_id' => 'required|exists:bahan_bakus,id',
            'resep.*.jumlah' => 'required|numeric|min:0.01',
        ]);

        if ($request->hasFile('foto')) {
            $validated['foto'] = $request->file('foto')->store('masakans', 'public');
        }

        $data = $validated;
        unset($data['resep']);
        $data['jumlah_porsi'] = $validated['jumlah_porsi'] ?? 0;

        $masakan = Masakan::create($data);

        $this->syncResep($masakan, (array) $request->input('resep', []));

        return $this->toast('success', 'Menu masakan berhasil ditambahkan!');
    }

    /**
     * Update masakan yang ada
     */
    public function update(Request $request, Masakan $masakan): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'kategori_id' => 'required|exists:kategoris,id',
            'tersedia' => 'boolean',
            'jumlah_porsi' => 'nullable|integer|min:0',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'resep' => 'nullable|array',
            'resep.*.bahan_baku_id' => 'required|exists:bahan_bakus,id',
            'resep.*.jumlah' => 'required|numeric|min:0.01',
        ]);

        if ($request->hasFile('foto')) {
            // Hapus foto lama jika ada
            if ($masakan->foto) {
                Storage::disk('public')->delete($masakan->foto);
            }
            $validated['foto'] = $request->file('foto')->store('masakans', 'public');
        }

        $data = $validated;
        unset($data['resep']);
        $data['jumlah_porsi'] = $validated['jumlah_porsi'] ?? $masakan->jumlah_porsi;

        $masakan->update($data);

        $this->syncResep($masakan, (array) $request->input('resep', []));

        return $this->toast('success', 'Menu masakan berhasil diperbarui!');
    }

    /**
     * Hapus masakan
     */
    public function destroy(Masakan $masakan): RedirectResponse
    {
        if ($masakan->foto) {
            Storage::disk('public')->delete($masakan->foto);
        }

        $masakan->delete();

        return $this->toast('success', 'Menu masakan berhasil dihapus!');
    }

    /**
     * Masak menu: kurangi stok bahan baku sesuai resep & takaran per porsi,
     * lalu tambahkan jumlah porsi siap jual.
     */
    public function masak(Request $request, Masakan $masakan): RedirectResponse
    {
        $validated = $request->validate([
            'jumlah' => 'required|integer|min:1|max:1000',
        ]);

        $porsi = (int) $validated['jumlah'];
        $masakan->load('resepItems.bahanBaku');

        if ($masakan->resepItems->isEmpty()) {
            return $this->toast(
                'error',
                'Menu ini belum punya resep. Tambahkan bahan baku di form edit menu dulu.'
            );
        }

        // Cek kecukupan stok seluruh bahan
        $kurang = [];
        foreach ($masakan->resepItems as $item) {
            $bahan = $item->bahanBaku;
            $butuh = $item->jumlah * $porsi;

            if ($bahan->stok < $butuh) {
                $kurang[] = sprintf(
                    '%s (butuh %s %s, sisa %s %s)',
                    $bahan->nama,
                    rtrim(rtrim(number_format($butuh, 2, ',', '.'), '0'), ','),
                    $bahan->satuan,
                    rtrim(rtrim(number_format($bahan->stok, 2, ',', '.'), '0'), ','),
                    $bahan->satuan
                );
            }
        }

        if (! empty($kurang)) {
            return $this->toast('error', 'Stok bahan tidak cukup: '.implode('; ', $kurang));
        }

        DB::transaction(function () use ($masakan, $porsi) {
            foreach ($masakan->resepItems as $item) {
                $item->bahanBaku->decrement('stok', $item->jumlah * $porsi);
            }

            $masakan->increment('jumlah_porsi', $porsi);
            $masakan->update(['tersedia' => true]);
        });

        return $this->toast(
            'success',
            "Berhasil memasak {$porsi} porsi {$masakan->nama}. Stok bahan baku sudah dikurangi."
        );
    }

    /**
     * Kirim notifikasi toast lewat Inertia lalu kembali ke halaman sebelumnya.
     */
    private function toast(string $type, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return back();
    }

    /**
     * Sinkronkan resep (bahan baku + takaran per porsi) milik masakan.
     *
     * @param  array<int, array{bahan_baku_id?: int|string|null, jumlah?: int|string|null}>  $resep
     */
    private function syncResep(Masakan $masakan, array $resep): void
    {
        $items = collect($resep)
            ->filter(fn ($row) => ! empty($row['bahan_baku_id']) && isset($row['jumlah']) && $row['jumlah'] !== '')
            ->map(fn ($row) => [
                'bahan_baku_id' => (int) $row['bahan_baku_id'],
                'jumlah' => $row['jumlah'],
            ])
            ->unique('bahan_baku_id')
            ->values();

        $masakan->resepItems()->delete();

        if ($items->isNotEmpty()) {
            $masakan->resepItems()->createMany($items->all());
        }
    }
}

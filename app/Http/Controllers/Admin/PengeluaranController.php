<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BahanBaku;
use App\Models\Pengeluaran;
use App\Models\StokMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PengeluaranController extends Controller
{
    /**
     * Daftar uang keluar dengan filter kategori dan rentang tanggal.
     */
    public function index(Request $request): Response
    {
        $request->validate([
            'dari' => ['nullable', 'date'],
            'sampai' => ['nullable', 'date'],
            'kategori' => ['nullable', Rule::in(array_keys(Pengeluaran::KATEGORI_LABELS))],
        ]);

        $pengeluarans = Pengeluaran::query()
            ->with('bahanBaku')
            ->when($request->filled('kategori'), fn ($query) => $query
                ->where('kategori', $request->input('kategori')))
            ->when($request->filled('dari'), fn ($query) => $query
                ->whereDate('tanggal', '>=', $request->input('dari')))
            ->when($request->filled('sampai'), fn ($query) => $query
                ->whereDate('tanggal', '<=', $request->input('sampai')))
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('admin/pengeluaran/index', [
            'pengeluarans' => $pengeluarans,
            'bahanBakus' => BahanBaku::query()
                ->orderBy('nama')
                ->get(['id', 'nama', 'satuan', 'stok', 'harga_beli']),
            'kategoris' => collect(Pengeluaran::KATEGORI_LABELS)
                ->map(fn (string $label, string $value): array => [
                    'value' => $value,
                    'label' => $label,
                ])
                ->values()
                ->all(),
            'filters' => [
                'kategori' => $request->input('kategori', ''),
                'dari' => $request->input('dari', ''),
                'sampai' => $request->input('sampai', ''),
            ],
            'stats' => [
                'total' => (int) $pengeluarans->sum('jumlah'),
                'jumlah' => $pengeluarans->count(),
                'bahan' => (int) $pengeluarans
                    ->where('kategori', Pengeluaran::KATEGORI_BAHAN_BAKU)
                    ->sum('jumlah'),
            ],
        ]);
    }

    /**
     * Catat pengeluaran. Pembelian bahan otomatis menambah stok dan
     * memperbarui harga beli acuan.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->aturan($request));
        $validated['user_id'] = $request->user()->id;

        DB::transaction(function () use ($validated): void {
            $bahan = null;

            if ($validated['kategori'] === Pengeluaran::KATEGORI_BAHAN_BAKU) {
                $bahan = BahanBaku::query()
                    ->whereKey($validated['bahan_baku_id'])
                    ->lockForUpdate()
                    ->firstOrFail();
                $validated['jumlah'] = (int) round(
                    (float) $validated['qty'] * (float) $validated['harga_satuan'],
                );

                $bahan->increment('stok', $validated['qty']);
                $bahan->update(['harga_beli' => $validated['harga_satuan']]);
            }

            $pengeluaran = Pengeluaran::create($validated);

            if ($bahan) {
                StokMovement::catat([
                    'jenis' => StokMovement::JENIS_MASUK,
                    'sumber' => StokMovement::SUMBER_PEMBELIAN,
                    'jumlah' => $validated['qty'],
                    'satuan' => $bahan->satuan,
                    'bahan_baku_id' => $bahan->id,
                    'harga_satuan' => $validated['harga_satuan'],
                    'keterangan' => ($pengeluaran->deskripsi ?: 'Pembelian '.$bahan->nama),
                ]);
            }
        });

        return $this->toast('success', 'Pengeluaran berhasil dicatat!');
    }

    /**
     * Perbarui pengeluaran dan sesuaikan kembali stok bila jenisnya berubah.
     */
    public function update(Request $request, Pengeluaran $pengeluaran): RedirectResponse
    {
        $validated = $request->validate($this->aturan($request));

        $bahanLama = $pengeluaran->bahanBaku;

        if ($bahanLama && (float) $pengeluaran->qty > 0
            && (float) $bahanLama->stok < (float) $pengeluaran->qty) {
            return $this->toast(
                'error',
                'Stok bahan sudah berkurang sehingga catatan ini tidak bisa diubah.'
            );
        }

        if ($validated['kategori'] !== Pengeluaran::KATEGORI_BAHAN_BAKU) {
            $validated['bahan_baku_id'] = null;
            $validated['qty'] = null;
            $validated['harga_satuan'] = null;
        }

        $bahanBaru = null;

        DB::transaction(function () use ($validated, $pengeluaran, &$bahanBaru): void {
            $bahanLama = $pengeluaran->bahanBaku()->first();

            if ($bahanLama && $pengeluaran->qty) {
                $bahanLama->decrement('stok', $pengeluaran->qty);

                StokMovement::catat([
                    'jenis' => StokMovement::JENIS_KELUAR,
                    'sumber' => StokMovement::SUMBER_PENYESUAIAN,
                    'jumlah' => $pengeluaran->qty,
                    'satuan' => $bahanLama->satuan,
                    'bahan_baku_id' => $bahanLama->id,
                    'harga_satuan' => $pengeluaran->harga_satuan,
                    'keterangan' => 'Koreksi pengeluaran #'.$pengeluaran->id.' - '.$bahanLama->nama,
                ]);
            }

            if ($validated['kategori'] === Pengeluaran::KATEGORI_BAHAN_BAKU) {
                $bahanBaru = BahanBaku::query()
                    ->whereKey($validated['bahan_baku_id'])
                    ->lockForUpdate()
                    ->firstOrFail();
                $validated['jumlah'] = (int) round(
                    (float) $validated['qty'] * (float) $validated['harga_satuan'],
                );

                $bahanBaru->increment('stok', $validated['qty']);
                $bahanBaru->update(['harga_beli' => $validated['harga_satuan']]);
            }

            $pengeluaran->update($validated);

            if ($validated['kategori'] === Pengeluaran::KATEGORI_BAHAN_BAKU) {
                StokMovement::catat([
                    'jenis' => StokMovement::JENIS_MASUK,
                    'sumber' => StokMovement::SUMBER_PEMBELIAN,
                    'jumlah' => $validated['qty'],
                    'satuan' => $bahanBaru->satuan,
                    'bahan_baku_id' => $bahanBaru->id,
                    'harga_satuan' => $validated['harga_satuan'],
                    'keterangan' => ($validated['deskripsi'] ?? '') ?: 'Pembelian '.$bahanBaru->nama,
                ]);
            }
        });

        return $this->toast('success', 'Pengeluaran berhasil diperbarui!');
    }

    /**
     * Hapus catatan pengeluaran dan kembalikan stok pembelian bahan.
     */
    public function destroy(Pengeluaran $pengeluaran): RedirectResponse
    {
        $bahan = $pengeluaran->bahanBaku;

        if ($bahan && $pengeluaran->qty
            && (float) $bahan->stok < (float) $pengeluaran->qty) {
            return $this->toast(
                'error',
                'Stok bahan sudah berkurang sehingga catatan ini tidak bisa dihapus.'
            );
        }

        DB::transaction(function () use ($pengeluaran): void {
            $bahan = $pengeluaran->bahanBaku()->first();

            if ($bahan && $pengeluaran->qty) {
                $bahan->decrement('stok', $pengeluaran->qty);

                StokMovement::catat([
                    'jenis' => StokMovement::JENIS_KELUAR,
                    'sumber' => StokMovement::SUMBER_PENYESUAIAN,
                    'jumlah' => $pengeluaran->qty,
                    'satuan' => $bahan->satuan,
                    'bahan_baku_id' => $bahan->id,
                    'harga_satuan' => $pengeluaran->harga_satuan,
                    'keterangan' => 'Hapus pengeluaran #'.$pengeluaran->id.' - '.$bahan->nama,
                ]);
            }

            $pengeluaran->delete();
        });

        return $this->toast('success', 'Pengeluaran berhasil dihapus!');
    }

    /**
     * Aturan validasi berbeda untuk pembelian bahan dan biaya umum.
     *
     * @return array<string, array<int, mixed>>
     */
    private function aturan(Request $request): array
    {
        $aturan = [
            'tanggal' => ['required', 'date'],
            'kategori' => ['required', Rule::in(array_keys(Pengeluaran::KATEGORI_LABELS))],
            'deskripsi' => ['nullable', 'string', 'max:150'],
        ];

        if ($request->input('kategori') === Pengeluaran::KATEGORI_BAHAN_BAKU) {
            return array_merge($aturan, [
                'bahan_baku_id' => ['required', 'exists:bahan_bakus,id'],
                'qty' => ['required', 'numeric', 'min:0.01'],
                'harga_satuan' => ['required', 'numeric', 'min:0'],
            ]);
        }

        return array_merge($aturan, [
            'jumlah' => ['required', 'integer', 'min:0'],
        ]);
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

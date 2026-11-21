<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BahanBaku;
use App\Models\Masakan;
use App\Models\Payment;
use App\Models\Pengeluaran;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class LaporanController extends Controller
{
    /**
     * Laba rugi kas: pembayaran lunas dikurangi seluruh pengeluaran.
     * Dilengkapi estimasi margin per menu dari resep dan harga beli bahan.
     */
    public function labaRugi(Request $request): Response
    {
        $request->validate([
            'dari' => ['nullable', 'date'],
            'sampai' => ['nullable', 'date'],
        ]);

        $sekarang = Carbon::now();

        $dari = $request->filled('dari')
            ? Carbon::parse($request->input('dari'))->startOfDay()
            : $sekarang->copy()->startOfMonth()->startOfDay();

        $sampai = $request->filled('sampai')
            ? Carbon::parse($request->input('sampai'))->endOfDay()
            : $sekarang->copy()->endOfDay();

        if ($dari->gt($sampai)) {
            [$dari, $sampai] = [
                $sampai->copy()->startOfDay(),
                $dari->copy()->endOfDay(),
            ];
        }

        if ($dari->diffInDays($sampai) > 120) {
            $sampai = $dari->copy()->addDays(120)->endOfDay();
        }

        $pembayaranLunas = Payment::query()
            ->where('status', Payment::STATUS_BERHASIL)
            ->whereBetween('dibayar_at', [$dari, $sampai]);

        $pemasukan = (int) (clone $pembayaranLunas)->sum('jumlah');
        $transaksi = (clone $pembayaranLunas)->count();

        $pengeluaranQuery = Pengeluaran::query()
            ->whereDate('tanggal', '>=', $dari->toDateString())
            ->whereDate('tanggal', '<=', $sampai->toDateString());

        $pengeluaran = (int) (clone $pengeluaranQuery)->sum('jumlah');

        $perKategori = (clone $pengeluaranQuery)
            ->selectRaw('kategori, SUM(jumlah) as total, COUNT(*) as jumlah_transaksi')
            ->groupBy('kategori')
            ->get()
            ->map(fn ($baris): array => [
                'kategori' => $baris->getAttribute('kategori'),
                'label' => Pengeluaran::KATEGORI_LABELS[$baris->getAttribute('kategori')]
                    ?? ucfirst((string) $baris->getAttribute('kategori')),
                'total' => (int) $baris->getAttribute('total'),
                'jumlah_transaksi' => (int) $baris->getAttribute('jumlah_transaksi'),
            ])
            ->sortByDesc('total')
            ->values()
            ->all();

        $pemasukanHarian = (clone $pembayaranLunas)
            ->selectRaw('DATE(dibayar_at) as tanggal, SUM(jumlah) as total')
            ->groupByRaw('DATE(dibayar_at)')
            ->pluck('total', 'tanggal');

        $pengeluaranHarian = (clone $pengeluaranQuery)
            ->selectRaw('DATE(tanggal) as tanggal, SUM(jumlah) as total')
            ->groupByRaw('DATE(tanggal)')
            ->pluck('total', 'tanggal');

        $harian = [];

        foreach (CarbonPeriod::create(
            $dari->copy()->startOfDay(),
            '1 day',
            $sampai->copy()->startOfDay(),
        ) as $tanggal) {
            $harian[] = [
                'tanggal' => $tanggal->toDateString(),
                'label' => $tanggal->translatedFormat('d M'),
                'pemasukan' => (int) ($pemasukanHarian->get($tanggal->toDateString()) ?? 0),
                'pengeluaran' => (int) ($pengeluaranHarian->get($tanggal->toDateString()) ?? 0),
            ];
        }

        $marginMenu = Masakan::query()
            ->with('resepItems.bahanBaku')
            ->orderBy('nama')
            ->get()
            ->filter(fn (Masakan $masakan): bool => $masakan->resepItems->isNotEmpty())
            ->map(function (Masakan $masakan): array {
                $hpp = 0.0;

                foreach ($masakan->resepItems as $item) {
                    $hpp += (float) $item->jumlah
                        * (float) ($item->bahanBaku->harga_beli ?? 0);
                }

                $hpp = (int) round($hpp);
                $margin = (int) $masakan->harga - $hpp;

                return [
                    'nama' => $masakan->nama,
                    'harga' => (int) $masakan->harga,
                    'hpp' => $hpp,
                    'margin' => $margin,
                    'margin_persen' => $masakan->harga > 0
                        ? round(($margin / (int) $masakan->harga) * 100, 1)
                        : 0,
                ];
            })
            ->sortByDesc('margin')
            ->values()
            ->all();

        $nilaiStok = (int) round(BahanBaku::query()
            ->get(['stok', 'harga_beli'])
            ->sum(fn (BahanBaku $bahan): float => (float) $bahan->stok * (float) $bahan->harga_beli));

        $laba = $pemasukan - $pengeluaran;

        return Inertia::render('admin/laporan/laba-rugi/index', [
            'ringkasan' => [
                'pemasukan' => $pemasukan,
                'pengeluaran' => $pengeluaran,
                'laba' => $laba,
                'margin_persen' => $pemasukan > 0
                    ? round(($laba / $pemasukan) * 100, 1)
                    : 0,
                'transaksi' => $transaksi,
                'nilai_stok' => $nilaiStok,
            ],
            'harian' => $harian,
            'perKategori' => $perKategori,
            'marginMenu' => $marginMenu,
            'dari' => $dari->toDateString(),
            'sampai' => $sampai->toDateString(),
        ]);
    }
}

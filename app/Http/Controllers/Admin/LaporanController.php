<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BahanBaku;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Pengeluaran;
use App\Models\StokMovement;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class LaporanController extends Controller
{
    /**
     * Rekap tutup hari untuk satu tanggal: pembayaran, pengeluaran, porsi,
     * pesanan, menu terlaris, dan kondisi stok bahan baku.
     */
    public function tutupHari(Request $request): Response
    {
        $request->validate([
            'tanggal' => ['nullable', 'date'],
        ]);

        $tanggal = $request->filled('tanggal')
            ? Carbon::parse($request->input('tanggal'))->startOfDay()
            : Carbon::today();

        Carbon::setLocale('id');

        $awal = $tanggal->copy()->startOfDay();
        $akhir = $tanggal->copy()->endOfDay();

        $pembayaranQuery = Payment::query()
            ->with([
                'order:id,kode,nama_pengambil,metode_pembayaran,user_id',
                'order.user:id,name',
            ])
            ->where('status', Payment::STATUS_BERHASIL)
            ->whereBetween('dibayar_at', [$awal, $akhir]);

        $pembayaran = (clone $pembayaranQuery)
            ->orderByDesc('dibayar_at')
            ->get();

        $pemasukan = (int) $pembayaran->sum('jumlah');
        $pemasukanQris = (int) $pembayaran
            ->where('metode', Order::METODE_QRIS)
            ->sum('jumlah');
        $pemasukanCash = $pemasukan - $pemasukanQris;

        $riwayatPembayaran = $pembayaran
            ->map(fn (Payment $payment): array => [
                'id' => $payment->id,
                'kode' => $payment->kode,
                'order_kode' => $payment->order->kode,
                'pelanggan' => $payment->order?->nama_pengambil
                    ?: $payment->order?->user?->name
                    ?: 'Pelanggan',
                'metode' => $payment->metode,
                'metode_label' => $payment->metode_label,
                'jumlah' => (int) $payment->jumlah,
                'waktu' => $payment->dibayar_at?->format('H:i'),
            ])
            ->values()
            ->all();

        $porsiTerjual = (int) StokMovement::query()
            ->where('sumber', StokMovement::SUMBER_PEMBAYARAN)
            ->where('jenis', StokMovement::JENIS_KELUAR)
            ->where('satuan', 'porsi')
            ->whereBetween('created_at', [$awal, $akhir])
            ->sum('jumlah');

        $menuTerlaris = OrderItem::query()
            ->selectRaw('masakan_id, nama_menu, SUM(jumlah) as porsi, SUM(subtotal) as penjualan')
            ->whereNotNull('masakan_id')
            ->whereHas('order', fn ($query) => $query
                ->whereHas('payment', fn ($paymentQuery) => $paymentQuery
                    ->where('status', Payment::STATUS_BERHASIL)
                    ->whereBetween('dibayar_at', [$awal, $akhir])))
            ->groupBy('masakan_id', 'nama_menu')
            ->orderByDesc('porsi')
            ->limit(5)
            ->get()
            ->map(fn ($item): array => [
                'nama' => (string) $item->getAttribute('nama_menu'),
                'porsi' => (int) $item->getAttribute('porsi'),
                'penjualan' => (int) $item->getAttribute('penjualan'),
            ])
            ->values()
            ->all();

        $pengeluaranQuery = Pengeluaran::query()
            ->whereDate('tanggal', $tanggal->toDateString());

        $totalPengeluaran = (int) (clone $pengeluaranQuery)->sum('jumlah');
        $jumlahPengeluaran = (clone $pengeluaranQuery)->count();

        $perKategoriPengeluaran = (clone $pengeluaranQuery)
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

        $riwayatPengeluaran = (clone $pengeluaranQuery)
            ->with(['bahanBaku:id,nama,satuan', 'user:id,name'])
            ->orderByDesc('id')
            ->limit(6)
            ->get()
            ->map(fn (Pengeluaran $pengeluaran): array => [
                'id' => $pengeluaran->id,
                'deskripsi' => $pengeluaran->deskripsi
                    ?: $pengeluaran->bahanBaku?->nama
                    ?: Pengeluaran::KATEGORI_LABELS[$pengeluaran->kategori]
                    ?: 'Pengeluaran',
                'kategori_label' => Pengeluaran::KATEGORI_LABELS[$pengeluaran->kategori]
                    ?? ucfirst($pengeluaran->kategori),
                'jumlah' => (int) $pengeluaran->jumlah,
                'waktu' => $pengeluaran->created_at?->format('H:i'),
                'petugas' => $pengeluaran->user_id ? $pengeluaran->user->name : '-',
            ])
            ->values()
            ->all();

        $statusPesanan = Order::query()
            ->selectRaw('status, COUNT(*) as total')
            ->whereDate('tanggal', $tanggal->toDateString())
            ->groupBy('status')
            ->pluck('total', 'status');

        $totalPesanan = (int) $statusPesanan->sum();
        $pesananAktif = (int) collect([
            Order::STATUS_MENUNGGU,
            Order::STATUS_DIMASAK,
            Order::STATUS_SIAP,
        ])->sum(fn (string $status): int => (int) ($statusPesanan->get($status) ?? 0));

        $jumlahStokKritis = BahanBaku::query()
            ->whereColumn('stok', '<=', 'stok_minimum')
            ->count();

        $stokKritis = BahanBaku::query()
            ->whereColumn('stok', '<=', 'stok_minimum')
            ->orderBy('stok')
            ->limit(6)
            ->get(['id', 'nama', 'satuan', 'stok', 'stok_minimum', 'harga_beli'])
            ->map(fn (BahanBaku $bahan): array => [
                'nama' => $bahan->nama,
                'satuan' => $bahan->satuan,
                'stok' => (float) $bahan->stok,
                'stok_minimum' => (float) $bahan->stok_minimum,
            ])
            ->values()
            ->all();

        $nilaiStok = (int) round(BahanBaku::query()
            ->get(['stok', 'harga_beli'])
            ->sum(fn (BahanBaku $bahan): float => (float) $bahan->stok * (float) $bahan->harga_beli));

        $laba = $pemasukan - $totalPengeluaran;

        return Inertia::render('admin/laporan/tutup-hari/index', [
            'tanggal' => $tanggal->toDateString(),
            'tanggalHariIni' => Carbon::today()->toDateString(),
            'labelTanggal' => $tanggal->translatedFormat('l, d F Y'),
            'hariIni' => $tanggal->isSameDay(Carbon::today()),
            'dibuatPada' => Carbon::now()->format('H:i'),
            'ringkasan' => [
                'pemasukan' => $pemasukan,
                'pemasukan_cash' => $pemasukanCash,
                'pemasukan_qris' => $pemasukanQris,
                'transaksi' => $pembayaran->count(),
                'pengeluaran' => $totalPengeluaran,
                'jumlah_pengeluaran' => $jumlahPengeluaran,
                'laba' => $laba,
                'margin_persen' => $pemasukan > 0
                    ? round(($laba / $pemasukan) * 100, 1)
                    : 0,
                'porsi_terjual' => $porsiTerjual,
                'pesanan' => $totalPesanan,
                'pesanan_selesai' => (int) ($statusPesanan->get(Order::STATUS_SELESAI) ?? 0),
                'pesanan_aktif' => $pesananAktif,
                'pesanan_dibatalkan' => (int) ($statusPesanan->get(Order::STATUS_DIBATALKAN) ?? 0),
                'stok_kritis' => $jumlahStokKritis,
                'nilai_stok' => $nilaiStok,
            ],
            'pembayaran' => $riwayatPembayaran,
            'menuTerlaris' => $menuTerlaris,
            'pengeluaran' => $riwayatPengeluaran,
            'perKategoriPengeluaran' => $perKategoriPengeluaran,
            'stokKritis' => $stokKritis,
        ]);
    }

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

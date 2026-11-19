<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BahanBaku;
use App\Models\Kategori;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Ringkasan operasional warung untuk admin.
     */
    public function index(): Response
    {
        $sekarang = Carbon::now();
        $awalHari = $sekarang->copy()->startOfDay();
        $akhirHari = $sekarang->copy()->endOfDay();
        $awalTujuhHari = $sekarang->copy()->subDays(6)->startOfDay();

        $pembayaranLunasHariIni = Payment::query()
            ->where('status', Payment::STATUS_BERHASIL)
            ->whereBetween('dibayar_at', [$awalHari, $akhirHari]);

        $pendapatanTujuhHari = (int) Payment::query()
            ->where('status', Payment::STATUS_BERHASIL)
            ->whereBetween('dibayar_at', [$awalTujuhHari, $akhirHari])
            ->sum('jumlah');

        $pembayaranHarian = Payment::query()
            ->selectRaw('DATE(dibayar_at) as tanggal, SUM(jumlah) as pendapatan, COUNT(*) as transaksi')
            ->where('status', Payment::STATUS_BERHASIL)
            ->whereBetween('dibayar_at', [$awalTujuhHari, $akhirHari])
            ->groupByRaw('DATE(dibayar_at)')
            ->get()
            ->keyBy('tanggal');

        $namaHari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

        $trenPendapatan = collect(range(6, 0))
            ->map(function (int $mundur) use ($pembayaranHarian, $namaHari): array {
                $tanggal = Carbon::now()->subDays($mundur)->startOfDay();
                $kunci = $tanggal->toDateString();
                $baris = $pembayaranHarian->get($kunci);

                return [
                    'tanggal' => $kunci,
                    'label' => $namaHari[$tanggal->dayOfWeek],
                    'pendapatan' => (int) ($baris->pendapatan ?? 0),
                    'transaksi' => (int) ($baris->transaksi ?? 0),
                ];
            })
            ->values()
            ->all();

        $statusAktif = [
            Order::STATUS_MENUNGGU,
            Order::STATUS_DIMASAK,
            Order::STATUS_SIAP,
        ];

        $tagihanTertunda = Payment::query()
            ->where('status', Payment::STATUS_MENUNGGU)
            ->whereHas('order', fn ($query) => $query->whereIn('status', $statusAktif));

        $pesananTertunda = Order::query()
            ->with(['payment', 'user:id,name'])
            ->whereIn('status', $statusAktif)
            ->whereHas('payment', fn ($query) => $query->where('status', Payment::STATUS_MENUNGGU))
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalMenu' => Masakan::count(),
                'tersedia' => Masakan::where('tersedia', true)->count(),
                'habis' => Masakan::where('tersedia', false)->count(),
                'totalKategori' => Kategori::count(),
                'totalBahan' => BahanBaku::count(),
                'stokKritis' => BahanBaku::whereColumn('stok', '<=', 'stok_minimum')->count(),
                'pesananAktif' => Order::whereIn('status', $statusAktif)->count(),
                'siapDiambil' => Order::where('status', Order::STATUS_SIAP)->count(),
                'pesananHariIni' => Order::whereDate('tanggal', $awalHari)->count(),
                'pesananSelesaiHariIni' => Order::whereDate('tanggal', $awalHari)
                    ->where('status', Order::STATUS_SELESAI)
                    ->count(),
                'pendapatanHariIni' => (int) (clone $pembayaranLunasHariIni)->sum('jumlah'),
                'pembayaranLunasHariIni' => (clone $pembayaranLunasHariIni)->count(),
                'pendapatanTujuhHari' => $pendapatanTujuhHari,
                'totalPendapatan' => (int) Payment::where('status', Payment::STATUS_BERHASIL)->sum('jumlah'),
                'pembayaranTertunda' => (clone $tagihanTertunda)->count(),
                'tagihanTertunda' => (int) (clone $tagihanTertunda)->sum('jumlah'),
            ],
            'trenPendapatan' => $trenPendapatan,
            'menuPerKategori' => Kategori::query()
                ->withCount('masakans')
                ->orderByDesc('masakans_count')
                ->get()
                ->filter(fn (Kategori $kategori): bool => $kategori->masakans_count > 0)
                ->map(fn (Kategori $kategori): array => [
                    'nama' => $kategori->nama,
                    'menu' => $kategori->masakans_count,
                ])
                ->values()
                ->all(),
            'pesananTertunda' => $pesananTertunda,
            'qrisImageUrl' => $this->qrisImageUrl(),
            'masakans' => Masakan::with('kategori')->latest()->take(5)->get(),
        ]);
    }

    /**
     * Simpan gambar QRIS merchant untuk ditampilkan di dashboard.
     */
    public function uploadQris(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'qris' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ]);

        $direktori = public_path('images');
        File::ensureDirectoryExists($direktori);

        foreach (File::glob($direktori.'/qris.*') as $berkasLama) {
            File::delete($berkasLama);
        }

        /** @var UploadedFile $berkas */
        $berkas = $validated['qris'];
        $ekstensi = strtolower($berkas->getClientOriginalExtension() ?: 'png');
        $berkas->move($direktori, 'qris.'.$ekstensi);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Gambar QRIS berhasil diperbarui.',
        ]);

        return back();
    }

    private function qrisImageUrl(): ?string
    {
        $berkas = File::glob(public_path('images/qris.*'));

        if ($berkas === []) {
            return null;
        }

        $path = $berkas[0];

        return asset('images/'.basename($path)).'?v='.filemtime($path);
    }
}

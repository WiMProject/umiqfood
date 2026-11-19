<?php

use App\Http\Controllers\Admin\PesananController as AdminPesananController;
use App\Http\Controllers\BahanBakuController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\KeranjangController;
use App\Http\Controllers\MasakanController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\UserDashboardController;
use App\Models\BahanBaku;
use App\Models\Kategori;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Halaman depan (bisa diakses tanpa login)
Route::get('/', [HomeController::class, 'welcome'])->name('welcome');

// Rute untuk user tetap name('home')
Route::middleware(['auth', 'verified', 'role:user'])->group(function () {
    Route::get('/home', [HomeController::class, 'index'])->name('home');

    // Dashboard user: ringkasan, keranjang, pesanan, pembayaran
    Route::get('/akun', [UserDashboardController::class, 'index'])->name('user.dashboard');
    Route::post('/pesanan/{order}/batal', [UserDashboardController::class, 'batal'])->name('pesanan.batal');

    // Ulasan menu (hanya setelah pesanan selesai)
    Route::post('/menu/{masakan}/ulasan', [ReviewController::class, 'store'])->name('ulasan.store');

    // Keranjang
    Route::post('/keranjang/{masakan}', [KeranjangController::class, 'store'])->name('keranjang.store');
    Route::patch('/keranjang/{masakan}', [KeranjangController::class, 'update'])->name('keranjang.update');
    Route::delete('/keranjang/{masakan}', [KeranjangController::class, 'destroy'])->name('keranjang.destroy');
    Route::delete('/keranjang', [KeranjangController::class, 'clear'])->name('keranjang.clear');

    // Checkout pickup (tanpa pengantaran)
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
});

// Rute untuk admin
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard', [
            'stats' => [
                'totalMenu' => Masakan::count(),
                'tersedia' => Masakan::where('tersedia', true)->count(),
                'habis' => Masakan::where('tersedia', false)->count(),
                'totalKategori' => Kategori::count(),
                'totalBahan' => BahanBaku::count(),
                'stokKritis' => BahanBaku::whereColumn('stok', '<=', 'stok_minimum')->count(),
                'pesananAktif' => Order::whereIn('status', ['menunggu', 'dimasak', 'siap'])->count(),
                'pendapatanHariIni' => (int) Payment::where('status', 'berhasil')
                    ->whereHas('order', fn ($query) => $query->whereDate('tanggal', now()->toDateString()))
                    ->sum('jumlah'),
            ],
            'masakans' => Masakan::with('kategori')->latest()->take(5)->get(),
        ]);
    })->name('dashboard');

    // Rute CRUD Masakan + aksi masak
    Route::resource('masakan', MasakanController::class)->except(['create', 'show', 'edit']);
    Route::post('/masakan/{masakan}/masak', [MasakanController::class, 'masak'])
        ->name('masakan.masak');

    // Rute CRUD Inventori (bahan baku)
    Route::resource('inventori', BahanBakuController::class)->except(['create', 'show', 'edit']);

    // Pesanan pickup
    Route::get('/pesanan', [AdminPesananController::class, 'index'])->name('admin.pesanan.index');
    Route::patch('/pesanan/{order}/status', [AdminPesananController::class, 'updateStatus'])->name('admin.pesanan.status');
});

require __DIR__.'/settings.php';

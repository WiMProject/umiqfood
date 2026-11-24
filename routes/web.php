<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\FaqController as AdminFaqController;
use App\Http\Controllers\Admin\KontenController as AdminKontenController;
use App\Http\Controllers\Admin\KuponController as AdminKuponController;
use App\Http\Controllers\Admin\LaporanController as AdminLaporanController;
use App\Http\Controllers\Admin\PengeluaranController as AdminPengeluaranController;
use App\Http\Controllers\Admin\PengumumanController as AdminPengumumanController;
use App\Http\Controllers\Admin\PesananController as AdminPesananController;
use App\Http\Controllers\Admin\StokMutasiController as AdminStokMutasiController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\BahanBakuController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\KeranjangController;
use App\Http\Controllers\KuponController;
use App\Http\Controllers\MasakanController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\UserDashboardController;
use Illuminate\Support\Facades\Route;

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

    // Pratinjau kupon dari isi keranjang
    Route::post('/kupon/cek', [KuponController::class, 'cek'])->name('kupon.cek');
});

// Rute untuk admin
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::post('/dashboard/qris', [AdminDashboardController::class, 'uploadQris'])->name('admin.dashboard.qris');

    // Rute CRUD Masakan + aksi masak
    Route::resource('masakan', MasakanController::class)->except(['create', 'show', 'edit']);
    Route::post('/masakan/{masakan}/masak', [MasakanController::class, 'masak'])
        ->name('masakan.masak');

    // Rute CRUD Inventori (bahan baku)
    Route::resource('inventori', BahanBakuController::class)->except(['create', 'show', 'edit']);

    // Riwayat mutasi stok bahan baku dan porsi menu
    Route::get('/stok-mutasi', [AdminStokMutasiController::class, 'index'])
        ->name('admin.stok-mutasi.index');

    // Rute CRUD Kategori menu
    Route::resource('kategori', KategoriController::class)->except(['create', 'show', 'edit']);

    // Manajemen konten halaman utama: profil toko, promo, kupon, FAQ, unggulan
    Route::get('/konten', [AdminKontenController::class, 'index'])->name('konten.index');
    Route::put('/konten/toko', [AdminKontenController::class, 'updateToko'])->name('konten.toko.update');
    Route::patch('/konten/unggulan/{masakan}', [AdminKontenController::class, 'toggleUnggulan'])->name('konten.unggulan.update');

    Route::prefix('konten')->name('konten.')->group(function () {
        Route::post('/promo', [AdminPengumumanController::class, 'store'])->name('promo.store');
        Route::match(['patch', 'post'], '/promo/{pengumuman}', [AdminPengumumanController::class, 'update'])->name('promo.update');
        Route::delete('/promo/{pengumuman}', [AdminPengumumanController::class, 'destroy'])->name('promo.destroy');

        Route::post('/kupon', [AdminKuponController::class, 'store'])->name('kupon.store');
        Route::patch('/kupon/{kupon}', [AdminKuponController::class, 'update'])->name('kupon.update');
        Route::patch('/kupon/{kupon}/toggle', [AdminKuponController::class, 'toggleAktif'])->name('kupon.toggle');
        Route::delete('/kupon/{kupon}', [AdminKuponController::class, 'destroy'])->name('kupon.destroy');
        Route::get('/kupon/{kupon}/riwayat', [AdminKuponController::class, 'riwayat'])->name('kupon.riwayat');

        Route::post('/faq', [AdminFaqController::class, 'store'])->name('faq.store');
        Route::patch('/faq/{faq}', [AdminFaqController::class, 'update'])->name('faq.update');
        Route::patch('/faq/{faq}/toggle', [AdminFaqController::class, 'toggleAktif'])->name('faq.toggle');
        Route::delete('/faq/{faq}', [AdminFaqController::class, 'destroy'])->name('faq.destroy');
    });

    // Pesanan pickup
    Route::get('/pesanan', [AdminPesananController::class, 'index'])->name('admin.pesanan.index');
    Route::patch('/pesanan/{order}/status', [AdminPesananController::class, 'updateStatus'])->name('admin.pesanan.status');
    Route::patch('/pesanan/{order}/bayar', [AdminPesananController::class, 'konfirmasiPembayaran'])->name('admin.pesanan.bayar');

    // Catatan uang keluar, termasuk pembelian bahan baku
    Route::resource('pengeluaran', AdminPengeluaranController::class)->except(['create', 'show', 'edit']);

    // Rekap tutup hari untuk satu tanggal
    Route::get('/laporan/tutup-hari', [AdminLaporanController::class, 'tutupHari'])
        ->name('laporan.tutup-hari');

    // Laporan laba rugi berdasarkan pembayaran lunas dan pengeluaran
    Route::get('/laporan/laba-rugi', [AdminLaporanController::class, 'labaRugi'])
        ->name('laporan.laba-rugi');

    // Manajemen pengguna (admin & pelanggan)
    Route::resource('users', AdminUserController::class)->except(['create', 'show', 'edit']);
    Route::post('/users/{user}/verifikasi', [AdminUserController::class, 'verify'])
        ->name('users.verify');
});

require __DIR__.'/settings.php';

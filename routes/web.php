<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\MasakanController;
use App\Models\Masakan;
use App\Models\Kategori;

// Halaman depan (bisa diakses tanpa login)
Route::get('/', function () {
    $masakans = Masakan::with('kategori')
        ->where('tersedia', true)
        ->latest()
        ->take(8)
        ->get();
    $kategoris = Kategori::withCount('masakans')->get();

    return Inertia::render('welcome', [
        'masakans' => $masakans,
        'kategoris' => $kategoris,
    ]);
})->name('welcome');

// Rute untuk user tetap name('home')
Route::middleware(['auth', 'verified', 'role:user'])->group(function () {
    Route::get('/home', function () {
        $masakans = Masakan::with('kategori')
            ->where('tersedia', true)
            ->latest()
            ->get();
        $kategoris = Kategori::all();

        return Inertia::render('user/home', [
            'masakans' => $masakans,
            'kategoris' => $kategoris,
        ]);
    })->name('home');
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
            ],
            'masakans' => Masakan::with('kategori')->latest()->take(5)->get(),
        ]);
    })->name('dashboard');
});

// Rute CRUD Masakan
Route::resource('masakan', MasakanController::class)->except(['create', 'show', 'edit']);
require __DIR__ . '/settings.php';
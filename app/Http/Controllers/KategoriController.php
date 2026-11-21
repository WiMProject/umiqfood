<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class KategoriController extends Controller
{
    /**
     * Tampilkan daftar kategori beserta jumlah menu yang memakainya.
     */
    public function index(): Response
    {
        $kategoris = Kategori::withCount('masakans')
            ->orderBy('nama')
            ->get();

        return Inertia::render('admin/kategori/index', [
            'kategoris' => $kategoris,
            'stats' => [
                'total' => $kategoris->count(),
                'dipakai' => $kategoris->where('masakans_count', '>', 0)->count(),
                'kosong' => $kategoris->where('masakans_count', 0)->count(),
            ],
        ]);
    }

    /**
     * Simpan kategori baru. Slug dibuat otomatis dari nama bila dikosongkan.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'slug' => trim((string) $request->input('slug', '')) ?: Str::slug((string) $request->input('nama', '')),
        ]);

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:50'],
            'icon' => ['nullable', 'string', 'max:10'],
            'slug' => ['required', 'string', 'max:100', Rule::unique('kategoris', 'slug')],
        ]);

        $validated['icon'] = $validated['icon'] ?: null;

        Kategori::create($validated);

        return $this->toast('success', 'Kategori berhasil ditambahkan!');
    }

    /**
     * Perbarui nama dan icon. Slug sengaja tidak diubah agar menu tetap terhubung.
     */
    public function update(Request $request, Kategori $kategori): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:50'],
            'icon' => ['nullable', 'string', 'max:10'],
        ]);

        $validated['icon'] = $validated['icon'] ?: null;

        $kategori->update($validated);

        return $this->toast('success', 'Kategori berhasil diperbarui!');
    }

    /**
     * Hapus kategori yang tidak dipakai menu mana pun.
     */
    public function destroy(Kategori $kategori): RedirectResponse
    {
        if ($kategori->masakans()->exists()) {
            return $this->toast(
                'error',
                'Kategori ini masih dipakai menu. Pindahkan menu ke kategori lain terlebih dahulu.'
            );
        }

        $kategori->delete();

        return $this->toast('success', 'Kategori berhasil dihapus!');
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

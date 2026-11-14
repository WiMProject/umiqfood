<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Models\Masakan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MasakanController extends Controller
{
    /**
     * Tampilkan daftar semua masakan
     */
    public function index()
    {
        $masakans = Masakan::with('kategori')->latest()->get();
        $kategoris = Kategori::all();

        return Inertia::render('admin/masakan/index', [
            'masakans' => $masakans,
            'kategoris' => $kategoris,
        ]);
    }

    /**
     * Simpan masakan baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'kategori_id' => 'required|exists:kategoris,id',
            'tersedia' => 'boolean',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            $validated['foto'] = $request->file('foto')->store('masakans', 'public');
        }

        Masakan::create($validated);

        return back()->with('success', 'Menu masakan berhasil ditambahkan!');
    }

    /**
     * Update masakan yang ada
     */
    public function update(Request $request, Masakan $masakan)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'kategori_id' => 'required|exists:kategoris,id',
            'tersedia' => 'boolean',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            // Hapus foto lama jika ada
            if ($masakan->foto) {
                Storage::disk('public')->delete($masakan->foto);
            }
            $validated['foto'] = $request->file('foto')->store('masakans', 'public');
        }

        $masakan->update($validated);

        return back()->with('success', 'Menu masakan berhasil diperbarui!');
    }

    /**
     * Hapus masakan
     */
    public function destroy(Masakan $masakan)
    {
        if ($masakan->foto) {
            Storage::disk('public')->delete($masakan->foto);
        }

        $masakan->delete();

        return back()->with('success', 'Menu masakan berhasil dihapus!');
    }
}
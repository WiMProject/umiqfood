<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PengumumanController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validasi($request);
        $validated['slug'] = $this->slugUnik($validated['judul']);
        $validated['aktif'] = $request->boolean('aktif');

        if ($request->hasFile('gambar')) {
            $validated['gambar'] = $request->file('gambar')->store('pengumumans', 'public');
        } else {
            unset($validated['gambar']);
        }

        Pengumuman::create($validated);

        return $this->toast('success', 'Promo atau berita berhasil ditambahkan.');
    }

    public function update(Request $request, Pengumuman $pengumuman): RedirectResponse
    {
        $validated = $this->validasi($request, $pengumuman);
        $validated['aktif'] = $request->boolean('aktif');

        if ($request->hasFile('gambar')) {
            if ($pengumuman->gambar) {
                Storage::disk('public')->delete($pengumuman->gambar);
            }

            $validated['gambar'] = $request->file('gambar')->store('pengumumans', 'public');
        } else {
            unset($validated['gambar']);
        }

        $pengumuman->update($validated);

        return $this->toast('success', 'Promo atau berita berhasil diperbarui.');
    }

    public function destroy(Pengumuman $pengumuman): RedirectResponse
    {
        if ($pengumuman->gambar) {
            Storage::disk('public')->delete($pengumuman->gambar);
        }

        $pengumuman->delete();

        return $this->toast('success', 'Promo atau berita berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validasi(Request $request, ?Pengumuman $pengumuman = null): array
    {
        $request->merge([
            'jenis' => $request->input('jenis', Pengumuman::JENIS_PROMO),
            'kupon_id' => in_array($request->input('kupon_id'), [null, '', 'tanpa'], true)
                ? null
                : $request->input('kupon_id'),
            'mulai' => $request->input('mulai') ?: null,
            'selesai' => $request->input('selesai') ?: null,
        ]);

        $data = $request->validate([
            'judul' => ['required', 'string', 'max:150'],
            'jenis' => ['required', Rule::in(array_keys(Pengumuman::JENIS_LABELS))],
            'ringkasan' => ['nullable', 'string', 'max:300'],
            'isi' => ['nullable', 'string', 'max:5000'],
            'gambar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'kupon_id' => ['nullable', 'integer', Rule::exists('kupons', 'id')],
            'mulai' => ['nullable', 'date'],
            'selesai' => ['nullable', 'date', 'after_or_equal:mulai'],
            'urutan' => ['nullable', 'integer', 'min:0', 'max:999'],
        ]);

        $data['urutan'] = (int) ($data['urutan'] ?? 0);

        return $data;
    }

    private function slugUnik(string $judul): string
    {
        $dasar = Str::slug($judul) ?: 'promo';
        $slug = $dasar;
        $nomor = 2;

        while (Pengumuman::query()->where('slug', $slug)->exists()) {
            $slug = $dasar.'-'.$nomor;
            $nomor++;
        }

        return $slug;
    }

    private function toast(string $type, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return back();
    }
}

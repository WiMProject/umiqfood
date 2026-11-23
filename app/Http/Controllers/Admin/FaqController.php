<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaqController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validasi($request);
        $validated['aktif'] = $request->boolean('aktif');

        Faq::create($validated);

        return $this->toast('success', 'FAQ berhasil ditambahkan.');
    }

    public function update(Request $request, Faq $faq): RedirectResponse
    {
        $validated = $this->validasi($request);
        $validated['aktif'] = $request->boolean('aktif');

        $faq->update($validated);

        return $this->toast('success', 'FAQ berhasil diperbarui.');
    }

    public function toggleAktif(Faq $faq): RedirectResponse
    {
        $faq->update(['aktif' => ! $faq->aktif]);

        return $this->toast(
            'success',
            $faq->aktif ? 'FAQ ditampilkan.' : 'FAQ disembunyikan.',
        );
    }

    public function destroy(Faq $faq): RedirectResponse
    {
        $faq->delete();

        return $this->toast('success', 'FAQ berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validasi(Request $request): array
    {
        $data = $request->validate([
            'pertanyaan' => ['required', 'string', 'max:200'],
            'jawaban' => ['required', 'string', 'max:2000'],
            'urutan' => ['nullable', 'integer', 'min:0', 'max:999'],
        ]);

        $data['urutan'] = (int) ($data['urutan'] ?? 0);

        return $data;
    }

    private function toast(string $type, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return back();
    }
}

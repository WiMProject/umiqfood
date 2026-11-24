<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kupon;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class KuponController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validasi($request);
        $validated['aktif'] = $request->boolean('aktif');

        Kupon::create($validated);

        return $this->toast('success', 'Kupon berhasil ditambahkan.');
    }

    public function update(Request $request, Kupon $kupon): RedirectResponse
    {
        $validated = $this->validasi($request, $kupon);
        $validated['aktif'] = $request->boolean('aktif');

        $kupon->update($validated);

        return $this->toast('success', 'Kupon berhasil diperbarui.');
    }

    public function toggleAktif(Kupon $kupon): RedirectResponse
    {
        $kupon->update(['aktif' => ! $kupon->aktif]);

        return $this->toast(
            'success',
            $kupon->aktif
                ? "Kupon {$kupon->kode} diaktifkan."
                : "Kupon {$kupon->kode} dinonaktifkan.",
        );
    }

    public function destroy(Kupon $kupon): RedirectResponse
    {
        if ($kupon->orders()->exists()) {
            return $this->toast(
                'error',
                'Kupon sudah pernah dipakai. Nonaktifkan saja agar riwayat pesanan tetap aman.',
            );
        }

        $kupon->delete();

        return $this->toast('success', 'Kupon berhasil dihapus.');
    }

    /**
     * Riwayat pemakaian kupon untuk audit.
     */
    public function riwayat(Kupon $kupon): JsonResponse
    {
        $orders = $kupon->orders()
            ->with('user:id,name')
            ->latest()
            ->take(50)
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'kode' => $order->kode,
                'tanggal' => $order->tanggal->format('d M Y'),
                'nama' => $order->nama_pengambil,
                'pelanggan' => $order->user?->name,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'subtotal' => $order->subtotal,
                'diskon' => $order->diskon,
                'total' => $order->total,
            ]);

        return response()->json([
            'kupon' => [
                'id' => $kupon->id,
                'kode' => $kupon->kode,
                'nama' => $kupon->nama,
            ],
            'orders' => $orders,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validasi(Request $request, ?Kupon $kupon = null): array
    {
        $request->merge([
            'kode' => strtoupper(trim((string) $request->input('kode', ''))),
        ]);

        $request->merge([
            'mulai' => $request->input('mulai') ?: null,
            'selesai' => $request->input('selesai') ?: null,
            'kuota' => $request->input('kuota') ?: null,
            'maks_diskon' => $request->input('maks_diskon') ?: null,
            'min_subtotal' => $request->input('min_subtotal') ?: null,
        ]);

        $data = $request->validate([
            'kode' => [
                'required',
                'string',
                'max:30',
                'regex:/^[A-Z0-9_-]+$/',
                Rule::unique('kupons', 'kode')->ignore($kupon?->id),
            ],
            'nama' => ['nullable', 'string', 'max:100'],
            'tipe' => ['required', Rule::in(array_keys(Kupon::TIPE_LABELS))],
            'nilai' => [
                'required',
                'integer',
                'min:1',
                $request->input('tipe') === Kupon::TIPE_PERSEN ? 'max:100' : 'max:100000000',
            ],
            'min_subtotal' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'maks_diskon' => ['nullable', 'integer', 'min:1', 'max:100000000'],
            'kuota' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'maks_per_user' => ['required', 'integer', 'min:1', 'max:100'],
            'mulai' => ['nullable', 'date'],
            'selesai' => ['nullable', 'date', 'after_or_equal:mulai'],
        ]);

        if ($kupon && $kupon->orders()->exists() && $data['kode'] !== $kupon->kode) {
            throw ValidationException::withMessages([
                'kode' => 'Kode kupon tidak bisa diubah karena sudah pernah dipakai.',
            ]);
        }

        $data['min_subtotal'] = (int) ($data['min_subtotal'] ?? 0);
        $data['maks_diskon'] = $data['tipe'] === Kupon::TIPE_PERSEN
            ? ($data['maks_diskon'] ?? null)
            : null;

        return $data;
    }

    private function toast(string $type, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return back();
    }
}

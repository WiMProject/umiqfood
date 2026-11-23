<?php

namespace App\Services;

use App\Models\Kupon;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class KuponService
{
    /**
     * Validasi kode kupon dan hitung potongan untuk subtotal tertentu.
     *
     * @return array{kupon: Kupon, diskon: int, total: int}
     *
     * @throws ValidationException
     */
    public function validasi(string $kode, User $user, int $subtotal, bool $kunci = false): array
    {
        $kode = strtoupper(trim($kode));

        $query = Kupon::query()->where('kode', $kode);

        if ($kunci) {
            $query->lockForUpdate();
        }

        $kupon = $query->first();

        if (! $kupon) {
            $this->gagal('Kode kupon tidak ditemukan.');
        }

        if (! $kupon->aktif) {
            $this->gagal('Kupon ini sedang tidak aktif.');
        }

        $hariIni = Carbon::today();

        if ($kupon->mulai && $hariIni->lt($kupon->mulai->copy()->startOfDay())) {
            $this->gagal(sprintf(
                'Kupon baru bisa dipakai mulai %s.',
                $kupon->mulai->copy()->startOfDay()->translatedFormat('d M Y'),
            ));
        }

        if ($kupon->selesai && $hariIni->gt($kupon->selesai->copy()->endOfDay())) {
            $this->gagal('Kupon sudah kedaluwarsa.');
        }

        if ($subtotal < $kupon->min_subtotal) {
            $this->gagal(sprintf(
                'Minimal belanja untuk kupon ini Rp %s.',
                number_format($kupon->min_subtotal, 0, ',', '.'),
            ));
        }

        if ($kupon->kuota !== null && $kupon->jumlahPemakaian() >= $kupon->kuota) {
            $this->gagal('Kuota kupon sudah habis.');
        }

        if ($kupon->jumlahPemakaianUser($user) >= $kupon->maks_per_user) {
            $this->gagal('Kamu sudah pernah memakai kupon ini.');
        }

        $diskon = $kupon->hitungDiskon($subtotal);

        if ($diskon <= 0) {
            $this->gagal('Kupon tidak menghasilkan potongan untuk pesanan ini.');
        }

        return [
            'kupon' => $kupon,
            'diskon' => $diskon,
            'total' => max(0, $subtotal - $diskon),
        ];
    }

    /**
     * @throws ValidationException
     */
    private function gagal(string $pesan): never
    {
        throw ValidationException::withMessages([
            'kode_kupon' => $pesan,
        ]);
    }
}

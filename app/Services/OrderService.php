<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * Buat pesanan pickup dari keranjang user dan kurangi porsi yang siap jual.
     *
     * @param  array{nama_pengambil: string, no_hp: string, metode_pembayaran: string, catatan?: string|null}  $data
     */
    public function createFromCart(User $user, array $data): Order
    {
        return DB::transaction(function () use ($user, $data) {
            $cartItems = CartItem::query()
                ->where('user_id', $user->id)
                ->get();

            if ($cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'keranjang' => 'Keranjang masih kosong. Pilih menu dulu ya.',
                ]);
            }

            /** @var Collection<int, Masakan> $masakans */
            $masakans = Masakan::query()
                ->whereIn('id', $cartItems->pluck('masakan_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $errors = [];

            foreach ($cartItems as $item) {
                $masakan = $masakans->get($item->masakan_id);

                if (! $masakan) {
                    $errors[] = 'Ada menu di keranjang yang sudah tidak tersedia.';

                    continue;
                }

                if (! $masakan->tersedia || $masakan->jumlah_porsi < $item->jumlah) {
                    $errors[] = sprintf(
                        'Porsi %s tinggal %d, tidak cukup untuk %d porsi.',
                        $masakan->nama,
                        $masakan->jumlah_porsi,
                        $item->jumlah,
                    );
                }
            }

            if ($errors !== []) {
                throw ValidationException::withMessages([
                    'keranjang' => implode(' ', array_unique($errors)),
                ]);
            }

            $subtotal = $cartItems->sum(function (CartItem $item) use ($masakans): int {
                return $masakans->get($item->masakan_id)->harga * $item->jumlah;
            });

            $sekarang = Carbon::now();
            $tanggal = $sekarang->toDateString();
            $nomorAntrian = (int) Order::query()
                ->whereDate('tanggal', $tanggal)
                ->max('nomor_antrian') + 1;

            $order = Order::create([
                'user_id' => $user->id,
                'kode' => 'UF-'.$sekarang->format('Ymd').'-'.str_pad((string) $nomorAntrian, 3, '0', STR_PAD_LEFT),
                'tanggal' => $tanggal,
                'nomor_antrian' => $nomorAntrian,
                'status' => Order::STATUS_MENUNGGU,
                'metode_pembayaran' => $data['metode_pembayaran'],
                'subtotal' => $subtotal,
                'total' => $subtotal,
                'nama_pengambil' => $data['nama_pengambil'],
                'no_hp' => $data['no_hp'],
                'catatan' => $data['catatan'] ?? null,
                'estimasi_siap_at' => $sekarang->copy()->addMinutes(30),
            ]);

            foreach ($cartItems as $item) {
                $masakan = $masakans->get($item->masakan_id);

                if (! $masakan instanceof Masakan) {
                    continue;
                }

                $order->items()->create([
                    'masakan_id' => $masakan->id,
                    'nama_menu' => $masakan->nama,
                    'harga' => $masakan->harga,
                    'jumlah' => $item->jumlah,
                    'subtotal' => $masakan->harga * $item->jumlah,
                ]);

                $masakan->jumlah_porsi = max(0, $masakan->jumlah_porsi - $item->jumlah);
                $masakan->tersedia = $masakan->jumlah_porsi > 0;
                $masakan->save();
            }

            $order->payment()->create([
                'kode' => 'PAY-'.$order->kode,
                'metode' => $order->metode_pembayaran,
                'jumlah' => $order->total,
                'status' => Payment::STATUS_MENUNGGU,
            ]);

            CartItem::query()->where('user_id', $user->id)->delete();

            return $order->load(['items', 'payment']);
        });
    }

    /**
     * Batalkan pesanan dan kembalikan porsi ke menu.
     */
    public function cancel(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);

            if (! $order->isActive()) {
                throw ValidationException::withMessages([
                    'pesanan' => 'Pesanan ini sudah selesai dan tidak bisa dibatalkan.',
                ]);
            }

            $this->restorePortions($order);

            $order->update([
                'status' => Order::STATUS_DIBATALKAN,
                'dibatalkan_at' => Carbon::now(),
            ]);

            $order->payment()->update([
                'status' => Payment::STATUS_GAGAL,
            ]);

            return $order->load(['items', 'payment']);
        });
    }

    /**
     * Majukan status pesanan sesuai alur pickup.
     */
    public function updateStatus(Order $order, string $status): Order
    {
        $transitions = [
            Order::STATUS_MENUNGGU => [Order::STATUS_DIMASAK, Order::STATUS_DIBATALKAN],
            Order::STATUS_DIMASAK => [Order::STATUS_SIAP, Order::STATUS_DIBATALKAN],
            Order::STATUS_SIAP => [Order::STATUS_SELESAI, Order::STATUS_DIBATALKAN],
        ];

        return DB::transaction(function () use ($order, $status, $transitions) {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);

            $allowed = $transitions[$order->status] ?? [];

            if (! in_array($status, $allowed, true)) {
                throw ValidationException::withMessages([
                    'status' => 'Status pesanan tidak bisa diubah ke tahap tersebut.',
                ]);
            }

            if ($status === Order::STATUS_DIBATALKAN) {
                $this->restorePortions($order);

                $order->payment()->update(['status' => Payment::STATUS_GAGAL]);
            }

            $waktu = Carbon::now();
            $perubahan = ['status' => $status];

            if ($status === Order::STATUS_SIAP) {
                $perubahan['siap_at'] = $waktu;
            }

            if ($status === Order::STATUS_SELESAI) {
                $perubahan['diambil_at'] = $waktu;

                $order->payment()->update([
                    'status' => Payment::STATUS_BERHASIL,
                    'dibayar_at' => $waktu,
                ]);
            }

            if ($status === Order::STATUS_DIBATALKAN) {
                $perubahan['dibatalkan_at'] = $waktu;
            }

            $order->update($perubahan);

            return $order->load(['items', 'payment', 'user']);
        });
    }

    /**
     * Kembalikan jumlah porsi menu dari item pesanan yang dibatalkan.
     */
    private function restorePortions(Order $order): void
    {
        $items = $order->items()->whereNotNull('masakan_id')->get();

        foreach ($items as $item) {
            $masakan = Masakan::query()->lockForUpdate()->find($item->masakan_id);

            if (! $masakan) {
                continue;
            }

            $masakan->jumlah_porsi = max(0, $masakan->jumlah_porsi + $item->jumlah);
            $masakan->tersedia = true;
            $masakan->save();
        }
    }
}

<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\StokMovement;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * Buat pesanan pickup dari keranjang user. Porsi belum dipotong di sini,
     * hanya "direservasi" sampai pembayaran dikonfirmasi.
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

            $reserved = $this->porsiDireservasi();

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

                $sisa = (int) $masakan->jumlah_porsi - (int) ($reserved->get($item->masakan_id) ?? 0);

                if (! $masakan->tersedia || $sisa < $item->jumlah) {
                    $errors[] = sprintf(
                        'Porsi %s tinggal %d, tidak cukup untuk %d porsi.',
                        $masakan->nama,
                        max(0, $sisa),
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
                'porsi_dipotong' => false,
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
     * Batalkan pesanan dan kembalikan porsi bila sudah dipotong saat bayar.
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

            $this->kembalikanPortions($order);

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

            $waktu = Carbon::now();
            $perubahan = ['status' => $status];

            if ($status === Order::STATUS_DIBATALKAN) {
                $this->kembalikanPortions($order);

                $order->payment()->update(['status' => Payment::STATUS_GAGAL]);
                $perubahan['dibatalkan_at'] = $waktu;
            }

            if ($status === Order::STATUS_SIAP) {
                $perubahan['siap_at'] = $waktu;
            }

            if ($status === Order::STATUS_SELESAI) {
                $perubahan['diambil_at'] = $waktu;

                $this->lunas($order, $waktu);
            }

            $order->update($perubahan);

            return $order->load(['items', 'payment', 'user']);
        });
    }

    /**
     * Tandai pembayaran pesanan sebagai lunas setelah dicek admin dan potong
     * porsi menu tepat pada saat itu.
     */
    public function confirmPayment(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);

            if ($order->status === Order::STATUS_DIBATALKAN) {
                throw ValidationException::withMessages([
                    'pembayaran' => 'Pesanan yang sudah dibatalkan tidak bisa dibayar.',
                ]);
            }

            $this->lunas($order);

            return $order->load(['items', 'payment', 'user']);
        });
    }

    /**
     * Porsi yang sedang "dipesan" oleh pesanan aktif yang belum dibayar.
     * Dipakai supaya checkout tidak menjual porsi yang sama dua kali.
     *
     * @return Collection<int, int>
     */
    private function porsiDireservasi(): Collection
    {
        $ordersAktif = Order::query()
            ->whereIn('status', [
                Order::STATUS_MENUNGGU,
                Order::STATUS_DIMASAK,
                Order::STATUS_SIAP,
            ])
            ->where('porsi_dipotong', false)
            ->lockForUpdate()
            ->get(['id']);

        return OrderItem::query()
            ->whereIn('order_id', $ordersAktif->pluck('id'))
            ->whereNotNull('masakan_id')
            ->get(['masakan_id', 'jumlah'])
            ->groupBy('masakan_id')
            ->map(fn (Collection $items): int => (int) $items->sum('jumlah'));
    }

    /**
     * Lunas pembayaran sekaligus memotong porsi. Aman dipanggil berulang.
     */
    private function lunas(Order $order, ?Carbon $waktu = null): void
    {
        $waktu ??= Carbon::now();
        $payment = $order->payment()->first();

        if (! $payment || $payment->status !== Payment::STATUS_BERHASIL) {
            $order->payment()->updateOrCreate(
                ['order_id' => $order->id],
                [
                    'kode' => 'PAY-'.$order->kode,
                    'metode' => $order->metode_pembayaran,
                    'jumlah' => $order->total,
                    'status' => Payment::STATUS_BERHASIL,
                    'dibayar_at' => $waktu,
                ],
            );
        }

        $this->potongPortions($order);
    }

    /**
     * Potong porsi menu saat pembayaran lunas dan catat mutasinya.
     */
    private function potongPortions(Order $order): void
    {
        if ($order->porsi_dipotong) {
            return;
        }

        foreach ($order->items()->whereNotNull('masakan_id')->get() as $item) {
            $masakan = Masakan::query()->lockForUpdate()->find($item->masakan_id);

            if (! $masakan) {
                continue;
            }

            $sebelum = (int) $masakan->jumlah_porsi;
            $sesudah = max(0, $sebelum - (int) $item->jumlah);
            $terpotong = $sebelum - $sesudah;

            $masakan->jumlah_porsi = $sesudah;
            $masakan->tersedia = $sesudah > 0;
            $masakan->save();

            if ($terpotong > 0) {
                StokMovement::catat([
                    'jenis' => StokMovement::JENIS_KELUAR,
                    'sumber' => StokMovement::SUMBER_PEMBAYARAN,
                    'jumlah' => $terpotong,
                    'satuan' => 'porsi',
                    'masakan_id' => $masakan->id,
                    'order_id' => $order->id,
                    'keterangan' => 'Pembayaran '.$order->kode.' - '.$masakan->nama,
                ]);
            }
        }

        $order->update(['porsi_dipotong' => true]);
    }

    /**
     * Kembalikan porsi menu dari item pesanan yang dibatalkan.
     */
    private function kembalikanPortions(Order $order): void
    {
        if (! $order->porsi_dipotong) {
            return;
        }

        foreach ($order->items()->whereNotNull('masakan_id')->get() as $item) {
            $masakan = Masakan::query()->lockForUpdate()->find($item->masakan_id);

            if (! $masakan) {
                continue;
            }

            $masakan->jumlah_porsi = max(0, (int) $masakan->jumlah_porsi + (int) $item->jumlah);
            $masakan->tersedia = true;
            $masakan->save();

            StokMovement::catat([
                'jenis' => StokMovement::JENIS_MASUK,
                'sumber' => StokMovement::SUMBER_PEMBATAAN,
                'jumlah' => $item->jumlah,
                'satuan' => 'porsi',
                'masakan_id' => $masakan->id,
                'order_id' => $order->id,
                'keterangan' => 'Pembatalan '.$order->kode.' - '.$masakan->nama,
            ]);
        }

        $order->update(['porsi_dipotong' => false]);
    }
}

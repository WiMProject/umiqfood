<?php

namespace Tests\Feature;

use App\Models\BahanBaku;
use App\Models\Kategori;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Pengeluaran;
use App\Models\StokMovement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LaporanTutupHariTest extends TestCase
{
    use RefreshDatabase;

    public function test_rekap_menampilkan_ringkasan_pembayaran_pengeluaran_dan_porsi(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $pelanggan = User::factory()->create(['role' => 'user']);

        $hariIni = now()->toDateString();
        $kemarin = now()->subDay()->toDateString();

        $orderCash = $this->buatOrder($pelanggan, $hariIni, Order::METODE_CASH, 100000);
        $orderQris = $this->buatOrder($pelanggan, $hariIni, Order::METODE_QRIS, 50000);

        $this->buatPembayaran($orderCash, Order::METODE_CASH, 100000, $hariIni);
        $this->buatPembayaran($orderQris, Order::METODE_QRIS, 50000, $hariIni);

        $masakan = Masakan::create([
            'nama' => 'Ayam Geprek',
            'harga' => 20000,
            'tersedia' => true,
            'jumlah_porsi' => 20,
            'kategori_id' => Kategori::create([
                'nama' => 'Makanan',
                'slug' => 'makanan-'.uniqid(),
            ])->id,
        ]);

        OrderItem::create([
            'order_id' => $orderCash->id,
            'masakan_id' => $masakan->id,
            'nama_menu' => 'Ayam Geprek',
            'harga' => 20000,
            'jumlah' => 3,
            'subtotal' => 60000,
        ]);

        OrderItem::create([
            'order_id' => $orderQris->id,
            'masakan_id' => $masakan->id,
            'nama_menu' => 'Ayam Geprek',
            'harga' => 20000,
            'jumlah' => 2,
            'subtotal' => 40000,
        ]);

        StokMovement::create([
            'jenis' => StokMovement::JENIS_KELUAR,
            'sumber' => StokMovement::SUMBER_PEMBAYARAN,
            'jumlah' => 5,
            'satuan' => 'porsi',
            'masakan_id' => $masakan->id,
            'order_id' => $orderCash->id,
            'created_at' => $hariIni.' 12:00:00',
        ]);

        Pengeluaran::create([
            'tanggal' => $hariIni,
            'kategori' => 'operasional',
            'deskripsi' => 'Beli gas',
            'jumlah' => 30000,
            'user_id' => $admin->id,
        ]);

        BahanBaku::create([
            'nama' => 'Cabai',
            'satuan' => 'gram',
            'stok' => 2,
            'stok_minimum' => 10,
            'harga_beli' => 5000,
        ]);

        $this->actingAs($admin)
            ->get(route('laporan.tutup-hari', ['tanggal' => $hariIni]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/laporan/tutup-hari/index')
                ->where('tanggal', $hariIni)
                ->where('ringkasan.pemasukan', 150000)
                ->where('ringkasan.pemasukan_cash', 100000)
                ->where('ringkasan.pemasukan_qris', 50000)
                ->where('ringkasan.transaksi', 2)
                ->where('ringkasan.pengeluaran', 30000)
                ->where('ringkasan.laba', 120000)
                ->where('ringkasan.porsi_terjual', 5)
                ->where('ringkasan.stok_kritis', 1)
                ->where('menuTerlaris.0.nama', 'Ayam Geprek')
                ->where('menuTerlaris.0.porsi', 5)
                ->where('pembayaran', fn ($pembayaran) => count($pembayaran) === 2)
            );
    }

    public function test_rekap_filter_tanggal_hanya_menghitung_tanggal_terpilih(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $pelanggan = User::factory()->create(['role' => 'user']);

        $hariIni = now()->toDateString();
        $kemarin = now()->subDay()->toDateString();

        $this->buatPembayaran(
            $this->buatOrder($pelanggan, $kemarin, Order::METODE_CASH, 75000),
            Order::METODE_CASH,
            75000,
            $kemarin,
        );

        $this->actingAs($admin)
            ->get(route('laporan.tutup-hari', ['tanggal' => $hariIni]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('tanggal', $hariIni)
                ->where('ringkasan.pemasukan', 0)
                ->where('ringkasan.transaksi', 0)
                ->where('pembayaran', fn ($pembayaran) => count($pembayaran) === 0)
            );
    }

    public function test_rekap_hanya_bisa_diakses_admin(): void
    {
        $this->get(route('laporan.tutup-hari'))
            ->assertRedirect(route('login'));

        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get(route('laporan.tutup-hari'))
            ->assertRedirect(route('home'));
    }

    private function buatOrder(User $user, string $tanggal, string $metode, int $total): Order
    {
        static $antrian = 1;

        return Order::create([
            'user_id' => $user->id,
            'kode' => 'UPS-'.uniqid(),
            'tanggal' => $tanggal,
            'nomor_antrian' => $antrian++,
            'status' => Order::STATUS_SELESAI,
            'metode_pembayaran' => $metode,
            'subtotal' => $total,
            'total' => $total,
            'nama_pengambil' => 'Pelanggan',
            'no_hp' => '08123456789',
        ]);
    }

    private function buatPembayaran(Order $order, string $metode, int $jumlah, string $tanggal): Payment
    {
        return Payment::create([
            'order_id' => $order->id,
            'kode' => 'PAY-'.uniqid(),
            'metode' => $metode,
            'jumlah' => $jumlah,
            'status' => Payment::STATUS_BERHASIL,
            'dibayar_at' => $tanggal.' 12:00:00',
        ]);
    }
}

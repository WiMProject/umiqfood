<?php

namespace Tests\Feature;

use App\Models\BahanBaku;
use App\Models\Kategori;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Pengeluaran;
use App\Models\ResepItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LaporanLabaRugiTest extends TestCase
{
    use RefreshDatabase;

    public function test_laporan_menampilkan_pemasukan_pengeluaran_dan_laba(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $pelanggan = User::factory()->create(['role' => 'user']);

        $hariIni = now()->toDateString();
        $kemarin = now()->subDay()->toDateString();

        $this->buatPembayaranLunas($pelanggan, 100000, $hariIni);
        $this->buatPembayaranLunas($pelanggan, 50000, $kemarin);

        Pengeluaran::create([
            'tanggal' => $hariIni,
            'kategori' => 'operasional',
            'deskripsi' => 'Beli gas',
            'jumlah' => 30000,
            'user_id' => $admin->id,
        ]);

        Pengeluaran::create([
            'tanggal' => $kemarin,
            'kategori' => 'listrik',
            'jumlah' => 20000,
            'user_id' => $admin->id,
        ]);

        $bahan = BahanBaku::create([
            'nama' => 'Ayam',
            'satuan' => 'gram',
            'stok' => 100,
            'stok_minimum' => 10,
            'harga_beli' => 1000,
        ]);

        $masakan = Masakan::create([
            'nama' => 'Ayam Geprek',
            'harga' => 20000,
            'kategori_id' => $this->buatKategori()->id,
        ]);

        ResepItem::create([
            'masakan_id' => $masakan->id,
            'bahan_baku_id' => $bahan->id,
            'jumlah' => 5,
        ]);

        $this->actingAs($admin)
            ->get(route('laporan.laba-rugi', [
                'dari' => $kemarin,
                'sampai' => $hariIni,
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/laporan/laba-rugi/index')
                ->where('ringkasan.pemasukan', 150000)
                ->where('ringkasan.pengeluaran', 50000)
                ->where('ringkasan.laba', 100000)
                ->where('ringkasan.margin_persen', 66.7)
                ->where('ringkasan.transaksi', 2)
                ->where('ringkasan.nilai_stok', 100000)
                ->where('harian', fn ($harian) => count($harian) === 2)
                ->where('perKategori.0.total', 30000)
                ->where('marginMenu.0.nama', 'Ayam Geprek')
                ->where('marginMenu.0.hpp', 5000)
                ->where('marginMenu.0.margin', 15000)
                ->where('marginMenu.0.margin_persen', 75)
            );
    }

    public function test_filter_tanggal_terbalik_ditukar_otomatis(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $pelanggan = User::factory()->create(['role' => 'user']);

        $hariIni = now()->toDateString();
        $kemarin = now()->subDay()->toDateString();

        $this->buatPembayaranLunas($pelanggan, 25000, $hariIni);

        $this->actingAs($admin)
            ->get(route('laporan.laba-rugi', [
                'dari' => $hariIni,
                'sampai' => $kemarin,
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/laporan/laba-rugi/index')
                ->where('dari', $kemarin)
                ->where('ringkasan.pemasukan', 25000)
            );
    }

    public function test_laporan_hanya_bisa_diakses_admin(): void
    {
        $this->get(route('laporan.laba-rugi'))
            ->assertRedirect(route('login'));

        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get(route('laporan.laba-rugi'))
            ->assertRedirect(route('home'));
    }

    private function buatPembayaranLunas(User $user, int $jumlah, string $tanggal): void
    {
        static $antrian = 1;

        $order = Order::create([
            'user_id' => $user->id,
            'kode' => 'UPS-'.uniqid(),
            'tanggal' => $tanggal,
            'nomor_antrian' => $antrian++,
            'status' => Order::STATUS_SELESAI,
            'metode_pembayaran' => Order::METODE_CASH,
            'subtotal' => $jumlah,
            'total' => $jumlah,
            'nama_pengambil' => 'Pelanggan',
            'no_hp' => '08123456789',
        ]);

        Payment::create([
            'order_id' => $order->id,
            'kode' => 'PAY-'.uniqid(),
            'metode' => Order::METODE_CASH,
            'jumlah' => $jumlah,
            'status' => Payment::STATUS_BERHASIL,
            'dibayar_at' => $tanggal.' 12:00:00',
        ]);
    }

    private function buatKategori(): Kategori
    {
        return Kategori::create([
            'nama' => 'Makanan',
            'slug' => 'makanan-'.uniqid(),
        ]);
    }
}

<?php

namespace Tests\Feature;

use App\Models\BahanBaku;
use App\Models\CartItem;
use App\Models\Kategori;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\ResepItem;
use App\Models\StokMovement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StokMutasiTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_mutasi_stok_hanya_bisa_diakses_admin(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get(route('admin.stok-mutasi.index'))
            ->assertRedirect(route('home'));

        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get(route('admin.stok-mutasi.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/stok-mutasi/index')
                ->has('movements')
                ->has('stats', 4)
                ->has('jenisList', 2)
                ->has('sumberList', 5)
            );
    }

    public function test_pembelian_bahan_mencatat_mutasi_stok_masuk(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $bahan = $this->buatBahan(50);

        $this->actingAs($admin)
            ->post(route('pengeluaran.store'), [
                'tanggal' => now()->toDateString(),
                'kategori' => 'bahan_baku',
                'bahan_baku_id' => $bahan->id,
                'qty' => 1000,
                'harga_satuan' => 20,
            ])
            ->assertRedirect();

        $this->assertEquals(1050, (float) $bahan->fresh()->stok);

        $this->assertDatabaseHas('stok_movements', [
            'jenis' => StokMovement::JENIS_MASUK,
            'sumber' => StokMovement::SUMBER_PEMBELIAN,
            'bahan_baku_id' => $bahan->id,
            'jumlah' => 1000,
            'harga_satuan' => 20,
            'user_id' => $admin->id,
        ]);
    }

    public function test_masak_mencatat_mutasi_bahan_keluar_dan_porsi_masuk(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $bahan = $this->buatBahan(1000);
        $masakan = $this->buatMasakan(0);

        ResepItem::create([
            'masakan_id' => $masakan->id,
            'bahan_baku_id' => $bahan->id,
            'jumlah' => 100,
        ]);

        $this->actingAs($admin)
            ->post(route('masakan.masak', $masakan), ['jumlah' => 2])
            ->assertRedirect();

        $this->assertEquals(800, (float) $bahan->fresh()->stok);
        $this->assertSame(2, $masakan->fresh()->jumlah_porsi);

        $this->assertDatabaseHas('stok_movements', [
            'jenis' => StokMovement::JENIS_KELUAR,
            'sumber' => StokMovement::SUMBER_MASAK,
            'bahan_baku_id' => $bahan->id,
            'jumlah' => 200,
        ]);

        $this->assertDatabaseHas('stok_movements', [
            'jenis' => StokMovement::JENIS_MASUK,
            'sumber' => StokMovement::SUMBER_MASAK,
            'masakan_id' => $masakan->id,
            'jumlah' => 2,
            'satuan' => 'porsi',
        ]);
    }

    public function test_masak_ditolak_tanpa_mencatat_mutasi_bila_stok_kurang(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $bahan = $this->buatBahan(10);
        $masakan = $this->buatMasakan(0);

        ResepItem::create([
            'masakan_id' => $masakan->id,
            'bahan_baku_id' => $bahan->id,
            'jumlah' => 100,
        ]);

        $this->actingAs($admin)
            ->post(route('masakan.masak', $masakan), ['jumlah' => 2])
            ->assertRedirect();

        $this->assertEquals(10, (float) $bahan->fresh()->stok);
        $this->assertSame(0, $masakan->fresh()->jumlah_porsi);
        $this->assertSame(0, StokMovement::count());
    }

    public function test_pembayaran_lunas_mencatat_mutasi_porsi_keluar(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan(5);
        $order = $this->buatPesanan($user, $masakan, 2);

        $this->actingAs($admin)
            ->patch(route('admin.pesanan.bayar', $order))
            ->assertRedirect();

        $this->assertDatabaseHas('stok_movements', [
            'jenis' => StokMovement::JENIS_KELUAR,
            'sumber' => StokMovement::SUMBER_PEMBAYARAN,
            'masakan_id' => $masakan->id,
            'order_id' => $order->id,
            'jumlah' => 2,
            'satuan' => 'porsi',
        ]);
    }

    public function test_pembatalan_setelah_bayar_mencatat_mutasi_porsi_masuk(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan(5);
        $order = $this->buatPesanan($user, $masakan, 2);

        $this->actingAs($admin)
            ->patch(route('admin.pesanan.bayar', $order))
            ->assertRedirect();

        $this->actingAs($admin)
            ->patch(route('admin.pesanan.status', $order), ['status' => 'dibatalkan'])
            ->assertRedirect();

        $this->assertDatabaseHas('stok_movements', [
            'jenis' => StokMovement::JENIS_MASUK,
            'sumber' => StokMovement::SUMBER_PEMBATAAN,
            'masakan_id' => $masakan->id,
            'order_id' => $order->id,
            'jumlah' => 2,
            'satuan' => 'porsi',
        ]);
    }

    public function test_penyesuaian_stok_manual_mencatat_mutasi(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $bahan = $this->buatBahan(100);

        $this->actingAs($admin)
            ->patch(route('inventori.update', $bahan), [
                'nama' => $bahan->nama,
                'satuan' => $bahan->satuan,
                'stok' => 120,
                'stok_minimum' => $bahan->stok_minimum,
                'harga_beli' => $bahan->harga_beli,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('stok_movements', [
            'jenis' => StokMovement::JENIS_MASUK,
            'sumber' => StokMovement::SUMBER_PENYESUAIAN,
            'bahan_baku_id' => $bahan->id,
            'jumlah' => 20,
        ]);
    }

    private function buatBahan(float $stok): BahanBaku
    {
        return BahanBaku::create([
            'nama' => 'Minyak Goreng',
            'satuan' => 'ml',
            'stok' => $stok,
            'stok_minimum' => 10,
            'harga_beli' => 20,
        ]);
    }

    private function buatMasakan(int $jumlahPorsi): Masakan
    {
        $kategori = Kategori::create([
            'nama' => 'Nasi & Lauk',
            'icon' => '🍚',
            'slug' => 'nasi-lauk-'.uniqid(),
        ]);

        return Masakan::create([
            'nama' => 'Nasi Goreng Test',
            'deskripsi' => 'Menu untuk pengujian.',
            'harga' => 15000,
            'tersedia' => true,
            'jumlah_porsi' => $jumlahPorsi,
            'kategori_id' => $kategori->id,
        ]);
    }

    private function buatPesanan(User $user, Masakan $masakan, int $jumlah): Order
    {
        CartItem::create([
            'user_id' => $user->id,
            'masakan_id' => $masakan->id,
            'jumlah' => $jumlah,
        ]);

        $this->actingAs($user)->post(route('checkout.store'), [
            'nama_pengambil' => $user->name,
            'no_hp' => '081234567890',
            'metode_pembayaran' => 'cash',
        ]);

        return Order::latest('id')->firstOrFail();
    }
}

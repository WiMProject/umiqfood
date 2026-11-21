<?php

namespace Tests\Feature;

use App\Models\BahanBaku;
use App\Models\Pengeluaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PengeluaranTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_bisa_melihat_halaman_pengeluaran(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $bahan = $this->buatBahan(50);

        $pengeluaran = Pengeluaran::create([
            'tanggal' => '2026-11-21',
            'kategori' => 'operasional',
            'jumlah' => 25000,
            'user_id' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->get(route('pengeluaran.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/pengeluaran/index')
                ->where('bahanBakus.0.id', $bahan->id)
                ->where('kategoris.0.value', 'bahan_baku')
                ->where('pengeluarans.0.tanggal', '2026-11-21')
                ->where('pengeluarans.0.id', $pengeluaran->id)
            );
    }

    public function test_halaman_pengeluaran_hanya_bisa_diakses_admin(): void
    {
        $this->get(route('pengeluaran.index'))
            ->assertRedirect(route('login'));

        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get(route('pengeluaran.index'))
            ->assertRedirect(route('home'));
    }

    public function test_admin_bisa_mencatat_biaya_umum(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('pengeluaran.store'), [
                'tanggal' => now()->toDateString(),
                'kategori' => 'operasional',
                'deskripsi' => 'Beli gas 3 kg',
                'jumlah' => 75000,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('pengeluarans', [
            'kategori' => 'operasional',
            'deskripsi' => 'Beli gas 3 kg',
            'jumlah' => 75000,
            'user_id' => $admin->id,
            'bahan_baku_id' => null,
        ]);
    }

    public function test_pembelian_bahan_menambah_stok_dan_menyimpan_harga_snapshot(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $bahan = $this->buatBahan(50);

        $this->actingAs($admin)
            ->post(route('pengeluaran.store'), [
                'tanggal' => now()->toDateString(),
                'kategori' => 'bahan_baku',
                'bahan_baku_id' => $bahan->id,
                'qty' => 1000,
                'harga_satuan' => 12000,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('pengeluarans', [
            'bahan_baku_id' => $bahan->id,
            'jumlah' => 12000000,
            'qty' => 1000,
            'harga_satuan' => 12000,
        ]);

        $bahan->refresh();
        $this->assertEquals(1050, $bahan->stok);
        $this->assertEquals(12000, $bahan->harga_beli);
    }

    public function test_mengubah_pembelian_bahan_menyesuaikan_stok(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $bahan = $this->buatBahan(50);

        $pengeluaran = Pengeluaran::create([
            'tanggal' => now()->toDateString(),
            'kategori' => 'bahan_baku',
            'jumlah' => 100000,
            'bahan_baku_id' => $bahan->id,
            'qty' => 100,
            'harga_satuan' => 1000,
            'user_id' => $admin->id,
        ]);

        $bahan->increment('stok', 100);

        $this->actingAs($admin)
            ->put(route('pengeluaran.update', $pengeluaran), [
                'tanggal' => now()->toDateString(),
                'kategori' => 'bahan_baku',
                'bahan_baku_id' => $bahan->id,
                'qty' => 250,
                'harga_satuan' => 1100,
            ])
            ->assertRedirect();

        $bahan->refresh();
        $this->assertEquals(300, $bahan->stok);
        $this->assertEquals(1100, $bahan->harga_beli);
        $this->assertEquals(275000, $pengeluaran->fresh()->jumlah);
    }

    public function test_menghapus_pembelian_bahan_mengurangi_stok_kembali(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $bahan = $this->buatBahan(50);

        $pengeluaran = Pengeluaran::create([
            'tanggal' => now()->toDateString(),
            'kategori' => 'bahan_baku',
            'jumlah' => 20000,
            'bahan_baku_id' => $bahan->id,
            'qty' => 20,
            'harga_satuan' => 1000,
            'user_id' => $admin->id,
        ]);

        $bahan->increment('stok', 20);

        $this->actingAs($admin)
            ->delete(route('pengeluaran.destroy', $pengeluaran))
            ->assertRedirect();

        $this->assertDatabaseMissing('pengeluarans', ['id' => $pengeluaran->id]);
        $this->assertEquals(50, $bahan->fresh()->stok);
    }

    public function test_pengeluaran_ditolak_jika_stok_sudah_terpakai(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $bahan = $this->buatBahan(100);

        $pengeluaran = Pengeluaran::create([
            'tanggal' => now()->toDateString(),
            'kategori' => 'bahan_baku',
            'jumlah' => 100000,
            'bahan_baku_id' => $bahan->id,
            'qty' => 100,
            'harga_satuan' => 1000,
            'user_id' => $admin->id,
        ]);

        $bahan->decrement('stok', 100);

        $this->actingAs($admin)
            ->delete(route('pengeluaran.destroy', $pengeluaran))
            ->assertRedirect();

        $this->assertDatabaseHas('pengeluarans', ['id' => $pengeluaran->id]);
    }

    private function buatBahan(float $stok): BahanBaku
    {
        return BahanBaku::create([
            'nama' => 'Beras',
            'satuan' => 'gram',
            'stok' => $stok,
            'stok_minimum' => 10,
            'harga_beli' => 10000,
        ]);
    }
}

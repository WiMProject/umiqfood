<?php

namespace Tests\Feature;

use App\Models\BahanBaku;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InventoriTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_bisa_menyimpan_dan_mengubah_stok_bahan_baku(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('inventori.store'), [
                'nama' => 'Gula',
                'satuan' => 'gram',
                'stok' => 250,
                'stok_minimum' => 100,
                'harga_beli' => 12000,
            ])
            ->assertRedirect();

        $bahan = BahanBaku::query()->where('nama', 'Gula')->firstOrFail();
        $this->assertEquals(250, $bahan->stok);
        $this->assertEquals(12000, $bahan->harga_beli);

        $this->actingAs($admin)
            ->put(route('inventori.update', $bahan), [
                'nama' => 'Gula',
                'satuan' => 'gram',
                'stok' => 80,
                'stok_minimum' => 100,
                'harga_beli' => 12500,
            ])
            ->assertRedirect();

        $bahan->refresh();
        $this->assertEquals(80, $bahan->stok);
        $this->assertTrue($bahan->stok_menipis);

        $this->actingAs($admin)
            ->get(route('inventori.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/inventori/index')
                ->where('bahanBakus.0.stok', 80)
                ->where('bahanBakus.0.stok_menipis', true)
                ->where('bahanBakus.0.harga_beli', 12500)
                ->where('stats.menipis', 1)
                ->where('stats.nilai_stok', 1000000)
            );
    }
}

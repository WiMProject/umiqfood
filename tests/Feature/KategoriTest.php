<?php

namespace Tests\Feature;

use App\Models\Kategori;
use App\Models\Masakan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class KategoriTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_bisa_melihat_halaman_manajemen_kategori(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $kategori = Kategori::create([
            'nama' => 'Nasi & Lauk',
            'icon' => '🍚',
            'slug' => 'nasi-lauk',
        ]);

        Masakan::create([
            'nama' => 'Nasi Goreng',
            'harga' => 18000,
            'kategori_id' => $kategori->id,
        ]);

        $this->actingAs($admin)
            ->get(route('kategori.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/kategori/index')
                ->where('kategoris.0.nama', 'Nasi & Lauk')
                ->where('kategoris.0.masakans_count', 1)
                ->where('stats.total', 1)
                ->where('stats.dipakai', 1)
                ->where('stats.kosong', 0)
            );
    }

    public function test_halaman_kategori_hanya_bisa_diakses_admin(): void
    {
        $this->get(route('kategori.index'))
            ->assertRedirect(route('login'));

        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get(route('kategori.index'))
            ->assertRedirect(route('home'));
    }

    public function test_admin_bisa_menambah_kategori_dengan_slug_otomatis(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('kategori.store'), [
                'nama' => 'Makanan Berat',
                'icon' => '🍲',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('kategoris', [
            'nama' => 'Makanan Berat',
            'icon' => '🍲',
            'slug' => 'makanan-berat',
        ]);
    }

    public function test_slug_kategori_harus_unik(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        Kategori::create([
            'nama' => 'Minuman',
            'icon' => '🥤',
            'slug' => 'minuman',
        ]);

        $this->actingAs($admin)
            ->post(route('kategori.store'), [
                'nama' => 'Minuman Lain',
                'slug' => 'minuman',
            ])
            ->assertSessionHasErrors('slug');

        $this->assertDatabaseCount('kategoris', 1);
    }

    public function test_admin_bisa_mengubah_kategori_tanpa_mengubah_slug(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $kategori = Kategori::create([
            'nama' => 'Camilan',
            'icon' => '🍟',
            'slug' => 'camilan',
        ]);

        $this->actingAs($admin)
            ->put(route('kategori.update', $kategori), [
                'nama' => 'Camilan & Snack',
                'icon' => '🍪',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('kategoris', [
            'id' => $kategori->id,
            'nama' => 'Camilan & Snack',
            'icon' => '🍪',
            'slug' => 'camilan',
        ]);
    }

    public function test_kategori_yang_masih_dipakai_menu_tidak_bisa_dihapus(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $kategori = Kategori::create([
            'nama' => 'Nasi & Lauk',
            'slug' => 'nasi-lauk',
        ]);

        Masakan::create([
            'nama' => 'Nasi Goreng',
            'harga' => 18000,
            'kategori_id' => $kategori->id,
        ]);

        $this->actingAs($admin)
            ->delete(route('kategori.destroy', $kategori))
            ->assertRedirect();

        $this->assertDatabaseHas('kategoris', ['id' => $kategori->id]);
    }

    public function test_kategori_kosong_bisa_dihapus(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $kategori = Kategori::create([
            'nama' => 'Dessert',
            'slug' => 'dessert',
        ]);

        $this->actingAs($admin)
            ->delete(route('kategori.destroy', $kategori))
            ->assertRedirect();

        $this->assertDatabaseMissing('kategoris', ['id' => $kategori->id]);
    }
}

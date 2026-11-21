<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_bisa_melihat_daftar_pengguna(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->unverified()->create(['role' => 'user']);

        $this->actingAs($admin)
            ->get(route('users.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/users/index')
                ->has('users', 2)
                ->where('stats.total', 2)
                ->where('stats.admin', 1)
                ->where('stats.user', 1)
                ->where('stats.belum_verifikasi', 1)
                ->where('users.0.is_self', true)
                ->where('users.0.role', 'admin')
            );
    }

    public function test_tamu_diarahkan_ke_halaman_login(): void
    {
        $this->get(route('users.index'))
            ->assertRedirect(route('login'));
    }

    public function test_pengguna_biasa_tidak_bisa_mengakses_manajemen_pengguna(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get(route('users.index'))
            ->assertRedirect(route('home'));
    }

    public function test_admin_bisa_menambah_pengguna_baru(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'Kasir Baru',
                'email' => 'kasir@umiqfood.test',
                'role' => 'admin',
                'password' => 'rahasia123',
                'password_confirmation' => 'rahasia123',
            ])
            ->assertRedirect();

        $user = User::query()->where('email', 'kasir@umiqfood.test')->firstOrFail();

        $this->assertSame('Kasir Baru', $user->name);
        $this->assertSame('admin', $user->role);
        $this->assertNotNull($user->email_verified_at);
        $this->assertTrue(Hash::check('rahasia123', $user->password));
    }

    public function test_email_pengguna_baru_harus_unik(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $existing = User::factory()->create(['role' => 'user']);

        $this->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'Duplikat',
                'email' => $existing->email,
                'role' => 'user',
                'password' => 'rahasia123',
                'password_confirmation' => 'rahasia123',
            ])
            ->assertSessionHasErrors('email');
    }

    public function test_admin_bisa_memperbarui_data_dan_kata_sandi_pengguna(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create([
            'role' => 'user',
            'password' => 'password123',
        ]);

        $this->actingAs($admin)
            ->put(route('users.update', $user), [
                'name' => 'Pelanggan Setia',
                'email' => 'setia@umiqfood.test',
                'role' => 'user',
                'password' => 'katasandi456',
                'password_confirmation' => 'katasandi456',
            ])
            ->assertRedirect();

        $user->refresh();

        $this->assertSame('Pelanggan Setia', $user->name);
        $this->assertSame('setia@umiqfood.test', $user->email);
        $this->assertTrue(Hash::check('katasandi456', $user->password));
    }

    public function test_admin_bisa_memperbarui_tanpa_mengganti_kata_sandi(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create([
            'role' => 'user',
            'password' => 'password123',
        ]);
        $passwordLama = $user->password;

        $this->actingAs($admin)
            ->put(route('users.update', $user), [
                'name' => 'Nama Baru',
                'email' => $user->email,
                'role' => 'admin',
                'password' => '',
                'password_confirmation' => '',
            ])
            ->assertRedirect();

        $user->refresh();

        $this->assertSame('Nama Baru', $user->name);
        $this->assertSame('admin', $user->role);
        $this->assertSame($passwordLama, $user->password);
    }

    public function test_admin_tidak_bisa_menurunkan_peran_sendiri(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->put(route('users.update', $admin), [
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => 'user',
                'password' => '',
                'password_confirmation' => '',
            ])
            ->assertRedirect();

        $this->assertSame('admin', $admin->refresh()->role);
    }

    public function test_admin_bisa_memverifikasi_email_pengguna(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->unverified()->create(['role' => 'user']);

        $this->assertNull($user->email_verified_at);

        $this->actingAs($admin)
            ->post(route('users.verify', $user))
            ->assertRedirect();

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_admin_bisa_menghapus_pengguna_tanpa_riwayat_pesanan(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($admin)
            ->delete(route('users.destroy', $user))
            ->assertRedirect();

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_admin_tidak_bisa_menghapus_akun_sendiri(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->delete(route('users.destroy', $admin))
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_pengguna_dengan_riwayat_pesanan_tidak_bisa_dihapus(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);

        Order::create([
            'user_id' => $user->id,
            'kode' => 'UJI-001',
            'tanggal' => now()->toDateString(),
            'nomor_antrian' => 1,
            'status' => Order::STATUS_MENUNGGU,
            'metode_pembayaran' => Order::METODE_CASH,
            'subtotal' => 15000,
            'total' => 15000,
            'nama_pengambil' => $user->name,
            'no_hp' => '081234567890',
        ]);

        $this->actingAs($admin)
            ->delete(route('users.destroy', $user))
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }
}

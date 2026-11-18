<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Kategori;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PesananTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_bisa_menambah_mengubah_dan_menghapus_keranjang(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan(jumlahPorsi: 5);

        $this->actingAs($user)
            ->post(route('keranjang.store', $masakan), ['jumlah' => 2])
            ->assertRedirect();

        $this->assertDatabaseHas('cart_items', [
            'user_id' => $user->id,
            'masakan_id' => $masakan->id,
            'jumlah' => 2,
        ]);

        $this->actingAs($user)
            ->patch(route('keranjang.update', $masakan), ['jumlah' => 4])
            ->assertRedirect();

        $this->assertDatabaseHas('cart_items', [
            'user_id' => $user->id,
            'masakan_id' => $masakan->id,
            'jumlah' => 4,
        ]);

        $this->actingAs($user)
            ->delete(route('keranjang.destroy', $masakan))
            ->assertRedirect();

        $this->assertDatabaseMissing('cart_items', [
            'user_id' => $user->id,
            'masakan_id' => $masakan->id,
        ]);
    }

    public function test_checkout_membuat_pesanan_antrian_pembayaran_dan_mengurangi_porsi(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan(jumlahPorsi: 5, harga: 18000);

        CartItem::create([
            'user_id' => $user->id,
            'masakan_id' => $masakan->id,
            'jumlah' => 2,
        ]);

        $this->actingAs($user)
            ->post(route('checkout.store'), [
                'nama_pengambil' => 'Rina',
                'no_hp' => '081234567890',
                'metode_pembayaran' => 'cash',
                'catatan' => 'Sambal dipisah',
            ])
            ->assertRedirect(route('user.dashboard', ['tab' => 'pesanan']));

        $order = Order::firstOrFail();

        $this->assertSame(1, $order->nomor_antrian);
        $this->assertSame('A-001', $order->antrian_format);
        $this->assertSame(Order::STATUS_MENUNGGU, $order->status);
        $this->assertSame(36000, $order->total);
        $this->assertSame(3, $masakan->fresh()->jumlah_porsi);
        $this->assertFalse(CartItem::where('user_id', $user->id)->exists());

        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'nama_menu' => $masakan->nama,
            'jumlah' => 2,
            'subtotal' => 36000,
        ]);

        $this->assertDatabaseHas('payments', [
            'order_id' => $order->id,
            'status' => Payment::STATUS_MENUNGGU,
            'jumlah' => 36000,
        ]);
    }

    public function test_nomor_antrian_berurutan_dalam_hari_yang_sama(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan(jumlahPorsi: 10);

        foreach ([1, 2] as $urutan) {
            CartItem::create([
                'user_id' => $user->id,
                'masakan_id' => $masakan->id,
                'jumlah' => 1,
            ]);

            $this->actingAs($user)
                ->post(route('checkout.store'), [
                    'nama_pengambil' => 'Pelanggan '.$urutan,
                    'no_hp' => '08123456789'.$urutan,
                    'metode_pembayaran' => 'qris',
                ])
                ->assertSessionHasNoErrors();
        }

        $this->assertSame([1, 2], Order::orderBy('id')->pluck('nomor_antrian')->all());
        $this->assertSame(['A-001', 'A-002'], Order::orderBy('id')->get()->map->antrian_format->all());
    }

    public function test_checkout_ditolak_jika_porsi_tidak_cukup(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan(jumlahPorsi: 1);

        CartItem::create([
            'user_id' => $user->id,
            'masakan_id' => $masakan->id,
            'jumlah' => 1,
        ]);

        $masakan->update(['jumlah_porsi' => 0]);

        $this->actingAs($user)
            ->from(route('user.dashboard', ['tab' => 'keranjang']))
            ->post(route('checkout.store'), [
                'nama_pengambil' => 'Rina',
                'no_hp' => '081234567890',
                'metode_pembayaran' => 'cash',
            ])
            ->assertRedirect(route('user.dashboard', ['tab' => 'keranjang']))
            ->assertSessionHasErrors('keranjang');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_user_bisa_membatalkan_pesanan_dan_porsi_dikembalikan(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan(jumlahPorsi: 3);

        $order = $this->buatPesananUntuk($user, $masakan, 2);

        $this->actingAs($user)
            ->post(route('pesanan.batal', $order))
            ->assertRedirect();

        $this->assertSame(Order::STATUS_DIBATALKAN, $order->fresh()->status);
        $this->assertSame(Payment::STATUS_GAGAL, $order->payment->fresh()->status);
        $this->assertSame(3, $masakan->fresh()->jumlah_porsi);
    }

    public function test_admin_bisa_memajukan_status_sampai_selesai_dan_lunas(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan(jumlahPorsi: 5);
        $order = $this->buatPesananUntuk($user, $masakan, 2);

        $this->actingAs($admin)
            ->patch(route('admin.pesanan.status', $order), ['status' => 'dimasak'])
            ->assertRedirect();

        $this->assertSame(Order::STATUS_DIMASAK, $order->fresh()->status);

        $this->actingAs($admin)
            ->patch(route('admin.pesanan.status', $order), ['status' => 'siap'])
            ->assertRedirect();

        $this->assertSame(Order::STATUS_SIAP, $order->fresh()->status);
        $this->assertNotNull($order->fresh()->siap_at);

        $this->actingAs($admin)
            ->patch(route('admin.pesanan.status', $order), ['status' => 'selesai'])
            ->assertRedirect();

        $order->refresh();

        $this->assertSame(Order::STATUS_SELESAI, $order->status);
        $this->assertNotNull($order->diambil_at);
        $this->assertSame(Payment::STATUS_BERHASIL, $order->payment->status);
        $this->assertNotNull($order->payment->dibayar_at);
    }

    public function test_user_tidak_bisa_mengakses_halaman_pesanan_admin(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get(route('admin.pesanan.index'))
            ->assertRedirect(route('home'));
    }

    public function test_user_bisa_membuka_dashboard_dan_melihat_data_pesanan(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan(jumlahPorsi: 5);
        $order = $this->buatPesananUntuk($user, $masakan, 1);

        $this->actingAs($user)
            ->get(route('user.dashboard'))
            ->assertOk()
            ->assertSee('Pesanan & pembayaran')
            ->assertSee($order->kode);
    }

    private function buatMasakan(int $jumlahPorsi = 5, int $harga = 15000): Masakan
    {
        $kategori = Kategori::create([
            'nama' => 'Nasi & Lauk',
            'icon' => '🍚',
            'slug' => 'nasi-lauk-'.uniqid(),
        ]);

        return Masakan::create([
            'nama' => 'Nasi Goreng Test',
            'deskripsi' => 'Menu untuk pengujian.',
            'harga' => $harga,
            'tersedia' => true,
            'jumlah_porsi' => $jumlahPorsi,
            'kategori_id' => $kategori->id,
        ]);
    }

    private function buatPesananUntuk(User $user, Masakan $masakan, int $jumlah): Order
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

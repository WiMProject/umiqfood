<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Kategori;
use App\Models\Kupon;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class KuponTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_menerapkan_kupon_dan_total_pembayaran_memakai_setelah_diskon(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan(harga: 18000);
        $kupon = $this->buatKupon([
            'kode' => 'HEMAT10',
            'tipe' => Kupon::TIPE_PERSEN,
            'nilai' => 10,
        ]);

        $this->tambahKeranjang($user, $masakan, 2);

        $this->actingAs($user)
            ->post(route('checkout.store'), [
                'nama_pengambil' => 'Rina',
                'no_hp' => '081234567890',
                'metode_pembayaran' => 'cash',
                'kode_kupon' => 'hemat10',
            ])
            ->assertRedirect(route('user.dashboard', ['tab' => 'pesanan']))
            ->assertSessionHasNoErrors();

        $order = Order::firstOrFail();

        $this->assertSame($kupon->id, $order->kupon_id);
        $this->assertSame('HEMAT10', $order->kode_kupon);
        $this->assertSame(36000, $order->subtotal);
        $this->assertSame(3600, $order->diskon);
        $this->assertSame(32400, $order->total);

        $this->assertDatabaseHas('payments', [
            'order_id' => $order->id,
            'jumlah' => 32400,
        ]);
    }

    public function test_diskon_persen_dibatasi_maksimal_diskon(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan(harga: 18000);

        $this->buatKupon([
            'kode' => 'POTONG50',
            'tipe' => Kupon::TIPE_PERSEN,
            'nilai' => 50,
            'maks_diskon' => 5000,
        ]);

        $this->tambahKeranjang($user, $masakan, 2);

        $this->actingAs($user)
            ->post(route('checkout.store'), [
                'nama_pengambil' => 'Rina',
                'no_hp' => '081234567890',
                'metode_pembayaran' => 'cash',
                'kode_kupon' => 'POTONG50',
            ])
            ->assertSessionHasNoErrors();

        $order = Order::firstOrFail();

        $this->assertSame(5000, $order->diskon);
        $this->assertSame(31000, $order->total);
    }

    public function test_kupon_ditolak_jika_minimal_belanja_belum_terpenuhi(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan(harga: 18000);

        $this->buatKupon([
            'kode' => 'MINIMAL',
            'tipe' => Kupon::TIPE_NOMINAL,
            'nilai' => 10000,
            'min_subtotal' => 50000,
        ]);

        $this->tambahKeranjang($user, $masakan, 2);

        $this->actingAs($user)
            ->from(route('user.dashboard', ['tab' => 'keranjang']))
            ->post(route('checkout.store'), [
                'nama_pengambil' => 'Rina',
                'no_hp' => '081234567890',
                'metode_pembayaran' => 'cash',
                'kode_kupon' => 'MINIMAL',
            ])
            ->assertRedirect(route('user.dashboard', ['tab' => 'keranjang']))
            ->assertSessionHasErrors('kode_kupon');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_kupon_kedaluwarsa_dan_belum_mulai_ditolak(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan();

        $this->buatKupon([
            'kode' => 'LEWAT',
            'selesai' => Carbon::yesterday()->toDateString(),
        ]);
        $this->buatKupon([
            'kode' => 'BESOK',
            'mulai' => Carbon::tomorrow()->toDateString(),
        ]);

        foreach (['LEWAT', 'BESOK'] as $kode) {
            $this->tambahKeranjang($user, $masakan, 1);

            $this->actingAs($user)
                ->from(route('user.dashboard', ['tab' => 'keranjang']))
                ->post(route('checkout.store'), [
                    'nama_pengambil' => 'Rina',
                    'no_hp' => '081234567890',
                    'metode_pembayaran' => 'cash',
                    'kode_kupon' => $kode,
                ])
                ->assertSessionHasErrors('kode_kupon');
        }

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_kuota_habis_ditolak_dan_kembali_setelah_pesanan_dibatalkan(): void
    {
        $pembeliPertama = User::factory()->create(['role' => 'user']);
        $pembeliKedua = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan(jumlahPorsi: 10);

        $this->buatKupon([
            'kode' => 'KUOTA1',
            'kuota' => 1,
            'maks_per_user' => 2,
        ]);

        $this->tambahKeranjang($pembeliPertama, $masakan, 1);

        $this->actingAs($pembeliPertama)
            ->post(route('checkout.store'), [
                'nama_pengambil' => 'Pembeli 1',
                'no_hp' => '081234567890',
                'metode_pembayaran' => 'cash',
                'kode_kupon' => 'KUOTA1',
            ])
            ->assertSessionHasNoErrors();

        $order = Order::firstOrFail();

        $this->tambahKeranjang($pembeliKedua, $masakan, 1);

        $this->actingAs($pembeliKedua)
            ->from(route('user.dashboard', ['tab' => 'keranjang']))
            ->post(route('checkout.store'), [
                'nama_pengambil' => 'Pembeli 2',
                'no_hp' => '081234567891',
                'metode_pembayaran' => 'cash',
                'kode_kupon' => 'KUOTA1',
            ])
            ->assertSessionHasErrors('kode_kupon');

        $this->actingAs($pembeliPertama)
            ->post(route('pesanan.batal', $order))
            ->assertRedirect();

        $this->actingAs($pembeliKedua)
            ->post(route('checkout.store'), [
                'nama_pengambil' => 'Pembeli 2',
                'no_hp' => '081234567891',
                'metode_pembayaran' => 'cash',
                'kode_kupon' => 'KUOTA1',
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame(2, Order::count());
        $this->assertSame('KUOTA1', Order::latest('id')->firstOrFail()->kode_kupon);
    }

    public function test_batas_pemakaian_per_pelanggan_dihormati(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan(jumlahPorsi: 10);

        $this->buatKupon([
            'kode' => 'SEKALI',
            'maks_per_user' => 1,
        ]);

        $this->tambahKeranjang($user, $masakan, 1);

        $this->actingAs($user)
            ->post(route('checkout.store'), [
                'nama_pengambil' => 'Rina',
                'no_hp' => '081234567890',
                'metode_pembayaran' => 'cash',
                'kode_kupon' => 'SEKALI',
            ])
            ->assertSessionHasNoErrors();

        $this->tambahKeranjang($user, $masakan, 1);

        $this->actingAs($user)
            ->from(route('user.dashboard', ['tab' => 'keranjang']))
            ->post(route('checkout.store'), [
                'nama_pengambil' => 'Rina',
                'no_hp' => '081234567890',
                'metode_pembayaran' => 'cash',
                'kode_kupon' => 'SEKALI',
            ])
            ->assertSessionHasErrors('kode_kupon');

        $this->assertSame(1, Order::count());
    }

    public function test_pratinjau_kupon_mengembalikan_diskon_dan_total(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan(harga: 20000);

        $this->buatKupon([
            'kode' => 'PREVIEW',
            'tipe' => Kupon::TIPE_NOMINAL,
            'nilai' => 5000,
        ]);

        $this->tambahKeranjang($user, $masakan, 2);

        $this->actingAs($user)
            ->postJson(route('kupon.cek'), ['kode' => 'preview'])
            ->assertOk()
            ->assertJson([
                'kode' => 'PREVIEW',
                'subtotal' => 40000,
                'diskon' => 5000,
                'total' => 35000,
            ]);

        $this->actingAs($user)
            ->postJson(route('kupon.cek'), ['kode' => 'TIDAKADA'])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Kode kupon tidak ditemukan.');
    }

    /**
     * @param  array<string, mixed>  $override
     */
    private function buatKupon(array $override = []): Kupon
    {
        return Kupon::create(array_merge([
            'kode' => 'KUPON'.uniqid(),
            'nama' => 'Kupon pengujian',
            'tipe' => Kupon::TIPE_PERSEN,
            'nilai' => 10,
            'min_subtotal' => 0,
            'maks_diskon' => null,
            'kuota' => null,
            'maks_per_user' => 1,
            'mulai' => null,
            'selesai' => null,
            'aktif' => true,
        ], $override));
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

    private function tambahKeranjang(User $user, Masakan $masakan, int $jumlah): void
    {
        CartItem::updateOrCreate(
            [
                'user_id' => $user->id,
                'masakan_id' => $masakan->id,
            ],
            ['jumlah' => $jumlah],
        );
    }
}

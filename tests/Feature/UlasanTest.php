<?php

namespace Tests\Feature;

use App\Models\Kategori;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UlasanTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_menampilkan_ulasan_dan_porsi_tanpa_resep_atau_bahan_baku(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan();

        Review::create([
            'masakan_id' => $masakan->id,
            'nama' => 'Rina Kurnia',
            'rating' => 4,
            'komentar' => 'Enak dan porsinya pas.',
            'terverifikasi' => true,
        ]);

        Review::create([
            'masakan_id' => $masakan->id,
            'nama' => 'Bagas Pratama',
            'rating' => 5,
            'komentar' => 'Mantap, pasti pesan lagi.',
            'terverifikasi' => true,
        ]);

        $this->actingAs($user)
            ->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('user/home')
                ->has('masakans', 1)
                ->where('masakans.0.jumlah_porsi', 6)
                ->where('masakans.0.reviews_count', 2)
                ->has('masakans.0.reviews', 2)
                ->has('masakans.0.reviews_avg_rating')
                ->missing('masakans.0.resep_items')
                ->missing('masakans.0.resepItems')
                ->missing('masakans.0.bahan_baku')
                ->where('menuSelesai', [])
            );
    }

    public function test_user_dengan_pesanan_selesai_bisa_mengirim_ulasan(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan();
        $this->buatPesanan($user, $masakan, Order::STATUS_SELESAI);

        $this->actingAs($user)
            ->post(route('ulasan.store', $masakan), [
                'rating' => 5,
                'komentar' => 'Rasanya mantap dan pengambilan cepat.',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('reviews', [
            'masakan_id' => $masakan->id,
            'user_id' => $user->id,
            'nama' => $user->name,
            'rating' => 5,
            'komentar' => 'Rasanya mantap dan pengambilan cepat.',
            'terverifikasi' => true,
        ]);
    }

    public function test_menu_dari_pesanan_selesai_muncul_di_menu_selesai(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan();
        $this->buatPesanan($user, $masakan, Order::STATUS_SELESAI);

        $this->actingAs($user)
            ->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('menuSelesai', [$masakan->id])
            );
    }

    public function test_user_tanpa_pesanan_selesai_tidak_bisa_mengulas(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan();
        $this->buatPesanan($user, $masakan, Order::STATUS_SIAP);

        $this->actingAs($user)
            ->post(route('ulasan.store', $masakan), [
                'rating' => 5,
                'komentar' => 'Mau mengulas duluan.',
            ])
            ->assertSessionHasErrors('ulasan');

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_ulasan_kedua_memperbarui_ulasan_lama_bukan_menduplikasi(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan();
        $this->buatPesanan($user, $masakan, Order::STATUS_SELESAI);

        $this->actingAs($user)->post(route('ulasan.store', $masakan), [
            'rating' => 4,
            'komentar' => 'Ulasan pertama.',
        ]);

        $this->actingAs($user)->post(route('ulasan.store', $masakan), [
            'rating' => 5,
            'komentar' => 'Ulasan yang sudah diperbarui.',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseCount('reviews', 1);
        $this->assertDatabaseHas('reviews', [
            'masakan_id' => $masakan->id,
            'user_id' => $user->id,
            'rating' => 5,
            'komentar' => 'Ulasan yang sudah diperbarui.',
        ]);
    }

    public function test_rating_ulasan_wajib_antara_satu_sampai_lima(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMasakan();
        $this->buatPesanan($user, $masakan, Order::STATUS_SELESAI);

        $this->actingAs($user)
            ->post(route('ulasan.store', $masakan), ['rating' => 6])
            ->assertSessionHasErrors('rating');

        $this->assertDatabaseCount('reviews', 0);
    }

    private function buatMasakan(int $jumlahPorsi = 6): Masakan
    {
        $kategori = Kategori::create([
            'nama' => 'Nasi & Lauk',
            'icon' => '🍚',
            'slug' => 'nasi-lauk-'.uniqid(),
        ]);

        return Masakan::create([
            'nama' => 'Nasi Goreng Test',
            'deskripsi' => 'Menu untuk pengujian ulasan.',
            'harga' => 18000,
            'tersedia' => true,
            'jumlah_porsi' => $jumlahPorsi,
            'kategori_id' => $kategori->id,
        ]);
    }

    private function buatPesanan(User $user, Masakan $masakan, string $status): Order
    {
        $order = Order::create([
            'user_id' => $user->id,
            'kode' => 'UF-TEST-'.uniqid(),
            'tanggal' => now()->toDateString(),
            'nomor_antrian' => 1,
            'status' => $status,
            'metode_pembayaran' => Order::METODE_CASH,
            'subtotal' => $masakan->harga,
            'total' => $masakan->harga,
            'nama_pengambil' => $user->name,
            'no_hp' => '081234567890',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'masakan_id' => $masakan->id,
            'nama_menu' => $masakan->nama,
            'harga' => $masakan->harga,
            'jumlah' => 1,
            'subtotal' => $masakan->harga,
        ]);

        return $order;
    }
}

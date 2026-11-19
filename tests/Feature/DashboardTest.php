<?php

namespace Tests\Feature;

use App\Models\Kategori;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_dashboard_menghitung_pendapatan_dan_tren_sesuai_database(): void
    {
        Carbon::setTestNow('2026-11-19 10:00:00');

        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);

        $this->buatPembayaran($user, 20000, '2026-11-19 08:00:00');
        $this->buatPembayaran($user, 15000, '2026-11-18 09:00:00');

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('stats.pendapatanHariIni', 20000)
                ->where('stats.pendapatanTujuhHari', 35000)
                ->where('stats.totalPendapatan', 35000)
                ->where('stats.pembayaranLunasHariIni', 1)
                ->has('trenPendapatan', 7)
                ->where('trenPendapatan.5.pendapatan', 15000)
                ->where('trenPendapatan.6.pendapatan', 20000)
            );

        Carbon::setTestNow();
    }

    public function test_grafik_kategori_menghitung_semua_menu_dari_database(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        foreach (['Makanan Utama' => 3, 'Lauk' => 2, 'Minuman' => 1] as $namaKategori => $jumlahMenu) {
            $kategori = Kategori::create([
                'nama' => $namaKategori,
                'slug' => str($namaKategori)->slug()->toString(),
            ]);

            for ($i = 1; $i <= $jumlahMenu; $i++) {
                Masakan::create([
                    'nama' => "{$namaKategori} {$i}",
                    'harga' => 10000,
                    'kategori_id' => $kategori->id,
                    'jumlah_porsi' => 10,
                ]);
            }
        }

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.totalMenu', 6)
                ->has('menuPerKategori', 3)
                ->where('menuPerKategori.0.nama', 'Makanan Utama')
                ->where('menuPerKategori.0.menu', 3)
                ->where('menuPerKategori.1.nama', 'Lauk')
                ->where('menuPerKategori.1.menu', 2)
                ->where('menuPerKategori.2.nama', 'Minuman')
                ->where('menuPerKategori.2.menu', 1)
            );
    }

    public function test_dashboard_menampilkan_pesanan_yang_belum_dibayar(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);
        $order = $this->buatPesanan($user, 24000);

        $order->payment()->create([
            'kode' => 'PAY-'.$order->kode,
            'metode' => Order::METODE_QRIS,
            'jumlah' => 24000,
            'status' => Payment::STATUS_MENUNGGU,
        ]);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.pembayaranTertunda', 1)
                ->where('stats.tagihanTertunda', 24000)
                ->has('pesananTertunda', 1)
                ->where('pesananTertunda.0.kode', $order->kode)
            );
    }

    public function test_admin_bisa_mengunggah_gambar_qris(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $berkas = UploadedFile::fake()->create('qris.png', 100, 'image/png');

        try {
            $this->actingAs($admin)
                ->post(route('admin.dashboard.qris'), ['qris' => $berkas])
                ->assertRedirect()
                ->assertSessionHasNoErrors();

            $this->assertFileExists(public_path('images/qris.png'));
        } finally {
            File::delete(public_path('images/qris.png'));
        }
    }

    public function test_user_biasa_tidak_bisa_mengunggah_gambar_qris(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $berkas = UploadedFile::fake()->create('qris.png', 100, 'image/png');

        $this->actingAs($user)
            ->post(route('admin.dashboard.qris'), ['qris' => $berkas])
            ->assertRedirect(route('home'));

        $this->assertFileDoesNotExist(public_path('images/qris.png'));
    }

    private function buatPesanan(
        User $user,
        int $total,
        string $status = Order::STATUS_MENUNGGU,
    ): Order {
        static $urutan = 0;
        $urutan++;

        return Order::create([
            'user_id' => $user->id,
            'kode' => 'UF-TEST-'.$urutan,
            'tanggal' => now()->toDateString(),
            'nomor_antrian' => $urutan,
            'status' => $status,
            'metode_pembayaran' => Order::METODE_QRIS,
            'subtotal' => $total,
            'total' => $total,
            'nama_pengambil' => $user->name,
            'no_hp' => '081234567890',
        ]);
    }

    private function buatPembayaran(User $user, int $total, string $dibayarPada): Payment
    {
        $order = $this->buatPesanan($user, $total, Order::STATUS_SELESAI);

        return $order->payment()->create([
            'kode' => 'PAY-'.$order->kode,
            'metode' => Order::METODE_QRIS,
            'jumlah' => $total,
            'status' => Payment::STATUS_BERHASIL,
            'dibayar_at' => Carbon::parse($dibayarPada),
        ]);
    }
}

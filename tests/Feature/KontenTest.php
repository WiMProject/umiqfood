<?php

namespace Tests\Feature;

use App\Models\Faq;
use App\Models\Kategori;
use App\Models\Kupon;
use App\Models\Masakan;
use App\Models\Order;
use App\Models\PengaturanToko;
use App\Models\Pengumuman;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class KontenTest extends TestCase
{
    use RefreshDatabase;

    public function test_hanya_admin_yang_bisa_membuka_halaman_konten(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user)
            ->get(route('konten.index'))
            ->assertRedirect(route('home'));

        $this->actingAs($admin)
            ->get(route('konten.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/konten/index')
                ->has('pengaturan')
                ->has('promos')
                ->has('kupons')
                ->has('faqs')
                ->has('masakans')
                ->has('opsiKupon')
                ->where('stats.promo_aktif', 0)
                ->where('stats.kupon_aktif', 0)
            );
    }

    public function test_admin_bisa_mengelola_kupon(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('konten.kupon.store'), [
                'kode' => 'baru10',
                'nama' => 'Diskon pembuka',
                'tipe' => Kupon::TIPE_PERSEN,
                'nilai' => 10,
                'min_subtotal' => 20000,
                'maks_diskon' => 15000,
                'kuota' => 50,
                'maks_per_user' => 2,
                'aktif' => 1,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $kupon = Kupon::firstOrFail();

        $this->assertSame('BARU10', $kupon->kode);
        $this->assertTrue($kupon->aktif);
        $this->assertSame(2, $kupon->maks_per_user);

        $this->actingAs($admin)
            ->patch(route('konten.kupon.update', $kupon), [
                'kode' => 'BARU10',
                'nama' => 'Diskon pembuka',
                'tipe' => Kupon::TIPE_NOMINAL,
                'nilai' => 5000,
                'min_subtotal' => 25000,
                'kuota' => 30,
                'maks_per_user' => 1,
                'aktif' => 1,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $kupon->refresh();

        $this->assertSame(Kupon::TIPE_NOMINAL, $kupon->tipe);
        $this->assertSame(5000, $kupon->nilai);
        $this->assertNull($kupon->maks_diskon);

        $this->actingAs($admin)
            ->patch(route('konten.kupon.toggle', $kupon))
            ->assertRedirect();

        $this->assertFalse($kupon->fresh()->aktif);

        $this->actingAs($admin)
            ->delete(route('konten.kupon.destroy', $kupon))
            ->assertRedirect();

        $this->assertDatabaseMissing('kupons', ['id' => $kupon->id]);
    }

    public function test_kupon_yang_sudah_dipakai_tidak_bisa_dihapus_atau_diubah_kodenya(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);
        $kupon = $this->buatKupon(['kode' => 'TERPAKAI']);

        Order::create([
            'user_id' => $user->id,
            'kode' => 'UF-TEST-001',
            'tanggal' => Carbon::today()->toDateString(),
            'nomor_antrian' => 1,
            'status' => Order::STATUS_MENUNGGU,
            'metode_pembayaran' => Order::METODE_CASH,
            'kupon_id' => $kupon->id,
            'kode_kupon' => $kupon->kode,
            'subtotal' => 20000,
            'diskon' => 2000,
            'total' => 18000,
            'nama_pengambil' => 'Rina',
            'no_hp' => '081234567890',
        ]);

        $this->actingAs($admin)
            ->delete(route('konten.kupon.destroy', $kupon))
            ->assertRedirect();

        $this->assertDatabaseHas('kupons', ['id' => $kupon->id]);

        $this->actingAs($admin)
            ->from(route('konten.index'))
            ->patch(route('konten.kupon.update', $kupon), [
                'kode' => 'KODE-BARU',
                'tipe' => Kupon::TIPE_PERSEN,
                'nilai' => 10,
                'min_subtotal' => 0,
                'maks_per_user' => 1,
                'aktif' => 1,
            ])
            ->assertSessionHasErrors('kode');

        $this->assertSame('TERPAKAI', $kupon->fresh()->kode);
    }

    public function test_admin_bisa_mengelola_promo_faq_dan_menu_unggulan(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $masakan = $this->buatMasakan();

        $this->actingAs($admin)
            ->post(route('konten.promo.store'), [
                'judul' => 'Diskon akhir pekan',
                'jenis' => Pengumuman::JENIS_PROMO,
                'ringkasan' => 'Potongan spesial untuk akhir pekan.',
                'mulai' => Carbon::today()->toDateString(),
                'selesai' => Carbon::today()->addWeek()->toDateString(),
                'urutan' => 1,
                'aktif' => 1,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('pengumumans', [
            'judul' => 'Diskon akhir pekan',
            'jenis' => Pengumuman::JENIS_PROMO,
            'aktif' => true,
        ]);

        $this->actingAs($admin)
            ->post(route('konten.faq.store'), [
                'pertanyaan' => 'Apakah bisa diantar?',
                'jawaban' => 'Saat ini hanya pickup di outlet.',
                'urutan' => 1,
                'aktif' => 1,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $faq = Faq::firstOrFail();

        $this->actingAs($admin)
            ->patch(route('konten.faq.toggle', $faq))
            ->assertRedirect();

        $this->assertFalse($faq->fresh()->aktif);

        $this->assertFalse((bool) $masakan->fresh()->tampil_unggulan);

        $this->actingAs($admin)
            ->patch(route('konten.unggulan.update', $masakan))
            ->assertRedirect();

        $this->assertTrue($masakan->fresh()->tampil_unggulan);

        $this->actingAs($admin)
            ->put(route('konten.toko.update'), [
                'nama_toko' => 'UmiqFood',
                'tagline' => 'Masakan rumahan.',
                'alamat' => 'Jl. Melati No. 10',
                'jam_buka' => '08.00',
                'jam_tutup' => '20.00',
                'hari_tutup' => 'Minggu',
                'whatsapp' => '6281234567890',
                'maps_url' => 'https://maps.app.goo.gl/contoh',
                'catatan_pickup' => 'Ambil di pintu samping.',
                'catatan_pembayaran' => 'QRIS tersedia di kasir.',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $pengaturan = PengaturanToko::current();

        $this->assertSame('Jl. Melati No. 10', $pengaturan->alamat);
        $this->assertSame('Minggu', $pengaturan->hari_tutup);
    }

    public function test_halaman_utama_hanya_memuat_konten_yang_aktif(): void
    {
        PengaturanToko::current()->update([
            'alamat' => 'Jl. Melati No. 10',
            'jam_buka' => '08.00',
            'jam_tutup' => '20.00',
        ]);

        $kupon = $this->buatKupon(['kode' => 'HEMAT10']);

        Pengumuman::create([
            'judul' => 'Promo aktif',
            'slug' => 'promo-aktif',
            'jenis' => Pengumuman::JENIS_PROMO,
            'ringkasan' => 'Masih tayang.',
            'kupon_id' => $kupon->id,
            'aktif' => true,
            'urutan' => 0,
        ]);
        Pengumuman::create([
            'judul' => 'Promo nonaktif',
            'slug' => 'promo-nonaktif',
            'jenis' => Pengumuman::JENIS_INFO,
            'aktif' => false,
            'urutan' => 0,
        ]);
        Pengumuman::create([
            'judul' => 'Promo kedaluwarsa',
            'slug' => 'promo-kedaluwarsa',
            'jenis' => Pengumuman::JENIS_PROMO,
            'selesai' => Carbon::yesterday()->toDateString(),
            'aktif' => true,
            'urutan' => 0,
        ]);

        Faq::create([
            'pertanyaan' => 'Pertanyaan aktif?',
            'jawaban' => 'Jawaban aktif.',
            'urutan' => 0,
            'aktif' => true,
        ]);
        Faq::create([
            'pertanyaan' => 'Pertanyaan nonaktif?',
            'jawaban' => 'Jawaban nonaktif.',
            'urutan' => 1,
            'aktif' => false,
        ]);

        $unggulan = $this->buatMasakan(['tampil_unggulan' => true]);
        $this->buatMasakan(['tampil_unggulan' => false]);

        $this->get(route('welcome'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('welcome')
                ->has('promos', 1)
                ->where('promos.0.judul', 'Promo aktif')
                ->where('promos.0.kode_kupon_aktif', 'HEMAT10')
                ->has('faqs', 1)
                ->where('faqs.0.pertanyaan', 'Pertanyaan aktif?')
                ->has('menuUnggulan', 1)
                ->where('menuUnggulan.0.id', $unggulan->id)
                ->where('pengaturanToko.alamat', 'Jl. Melati No. 10')
            );
    }

    public function test_halaman_utama_tetap_tampil_tanpa_konten_tambahan(): void
    {
        $this->get(route('welcome'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('welcome')
                ->has('promos', 0)
                ->has('faqs', 0)
                ->has('menuUnggulan', 0)
            );
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

    /**
     * @param  array<string, mixed>  $override
     */
    private function buatMasakan(array $override = []): Masakan
    {
        $kategori = Kategori::create([
            'nama' => 'Nasi & Lauk',
            'icon' => '🍚',
            'slug' => 'nasi-lauk-'.uniqid(),
        ]);

        return Masakan::create(array_merge([
            'nama' => 'Nasi Goreng Test',
            'deskripsi' => 'Menu untuk pengujian.',
            'harga' => 15000,
            'tersedia' => true,
            'jumlah_porsi' => 5,
            'kategori_id' => $kategori->id,
        ], $override));
    }
}

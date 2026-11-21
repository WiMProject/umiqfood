<?php

namespace Tests\Feature;

use App\Models\Kategori;
use App\Models\Masakan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MasakanFotoTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_bisa_menambah_menu_dengan_banyak_foto(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $kategori = $this->buatKategori();

        $this->actingAs($admin)
            ->post(route('masakan.store'), [
                'nama' => 'Nasi Goreng Galeri',
                'deskripsi' => 'Menu dengan tiga foto.',
                'harga' => 18000,
                'kategori_id' => $kategori->id,
                'tersedia' => true,
                'jumlah_porsi' => 5,
                'fotos' => [
                    UploadedFile::fake()->image('satu.jpg'),
                    UploadedFile::fake()->image('dua.jpg'),
                    UploadedFile::fake()->image('tiga.jpg'),
                ],
            ])
            ->assertRedirect();

        $masakan = Masakan::query()->where('nama', 'Nasi Goreng Galeri')->firstOrFail();
        $fotos = $masakan->fotos()->get();

        $this->assertCount(3, $fotos);
        $this->assertSame($fotos->first()->path, $masakan->foto);

        foreach ($fotos as $foto) {
            Storage::disk('public')->assertExists($foto->path);
        }
    }

    public function test_admin_bisa_menambah_dan_menghapus_foto_saat_edit(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $masakan = $this->buatMenuDenganFoto(2);

        $fotoLama = $masakan->fotos()->get();
        $fotoDihapus = $fotoLama->first();

        $this->actingAs($admin)
            ->post(route('masakan.update', $masakan), [
                '_method' => 'PUT',
                'nama' => $masakan->nama,
                'deskripsi' => $masakan->deskripsi,
                'harga' => $masakan->harga,
                'kategori_id' => $masakan->kategori_id,
                'tersedia' => true,
                'jumlah_porsi' => $masakan->jumlah_porsi,
                'hapus_foto' => [$fotoDihapus->id],
                'fotos' => [UploadedFile::fake()->image('baru.jpg')],
            ])
            ->assertRedirect();

        $masakan->refresh();

        $this->assertCount(2, $masakan->fotos()->get());
        $this->assertDatabaseMissing('masakan_fotos', ['id' => $fotoDihapus->id]);
        Storage::disk('public')->assertMissing($fotoDihapus->path);
        $this->assertSame(
            $masakan->fotos()->orderBy('urutan')->orderBy('id')->value('path'),
            $masakan->foto,
        );
    }

    public function test_admin_bisa_memilih_foto_utama_dari_galeri(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $masakan = $this->buatMenuDenganFoto(3);

        $fotoKedua = $masakan->fotos()->orderBy('urutan')->get()[1];

        $this->actingAs($admin)
            ->post(route('masakan.update', $masakan), [
                '_method' => 'PUT',
                'nama' => $masakan->nama,
                'deskripsi' => $masakan->deskripsi,
                'harga' => $masakan->harga,
                'kategori_id' => $masakan->kategori_id,
                'tersedia' => true,
                'jumlah_porsi' => $masakan->jumlah_porsi,
                'cover_foto_id' => $fotoKedua->id,
            ])
            ->assertRedirect();

        $this->assertSame($fotoKedua->path, $masakan->refresh()->foto);
    }

    public function test_menghapus_menu_menghapus_semua_file_foto(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $masakan = $this->buatMenuDenganFoto(3);
        $paths = $masakan->fotos()->pluck('path')->all();

        $this->actingAs($admin)
            ->delete(route('masakan.destroy', $masakan))
            ->assertRedirect();

        $this->assertDatabaseMissing('masakans', ['id' => $masakan->id]);
        $this->assertDatabaseCount('masakan_fotos', 0);

        foreach ($paths as $path) {
            Storage::disk('public')->assertMissing($path);
        }
    }

    public function test_galeri_dibatasi_maksimal_delapan_foto(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $masakan = $this->buatMenuDenganFoto(8);

        $this->actingAs($admin)
            ->from(route('masakan.index'))
            ->post(route('masakan.update', $masakan), [
                '_method' => 'PUT',
                'nama' => $masakan->nama,
                'deskripsi' => $masakan->deskripsi,
                'harga' => $masakan->harga,
                'kategori_id' => $masakan->kategori_id,
                'tersedia' => true,
                'jumlah_porsi' => $masakan->jumlah_porsi,
                'fotos' => [UploadedFile::fake()->image('kesembilan.jpg')],
            ])
            ->assertRedirect(route('masakan.index'))
            ->assertSessionHasErrors('fotos');

        $this->assertCount(8, $masakan->fotos()->get());
    }

    public function test_total_foto_saat_dibuat_tidak_boleh_lebih_dari_delapan(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $kategori = $this->buatKategori();
        $fotos = [];

        for ($i = 1; $i <= 8; $i++) {
            $fotos[] = UploadedFile::fake()->image("galeri-{$i}.jpg");
        }

        $this->actingAs($admin)
            ->from(route('masakan.index'))
            ->post(route('masakan.store'), [
                'nama' => 'Menu Terlalu Banyak Foto',
                'deskripsi' => 'Sembilan foto dalam satu menu.',
                'harga' => 20000,
                'kategori_id' => $kategori->id,
                'tersedia' => true,
                'jumlah_porsi' => 5,
                'foto' => UploadedFile::fake()->image('cover.jpg'),
                'fotos' => $fotos,
            ])
            ->assertRedirect(route('masakan.index'))
            ->assertSessionHasErrors('fotos');

        $this->assertDatabaseCount('masakans', 0);
        $this->assertDatabaseCount('masakan_fotos', 0);
    }

    public function test_katalog_publik_membawa_galeri_foto(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['role' => 'user']);
        $masakan = $this->buatMenuDenganFoto(2);

        $this->actingAs($user)
            ->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('user/home')
                ->where('masakans.0.id', $masakan->id)
                ->has('masakans.0.fotos', 2)
                ->where('masakans.0.fotos.0.url', $masakan->fotos()->first()->url)
            );
    }

    private function buatKategori(): Kategori
    {
        return Kategori::create([
            'nama' => 'Nasi & Lauk',
            'icon' => '🍚',
            'slug' => 'nasi-lauk-'.uniqid(),
        ]);
    }

    private function buatMenuDenganFoto(int $jumlah): Masakan
    {
        $kategori = $this->buatKategori();

        $masakan = Masakan::create([
            'nama' => 'Menu Galeri '.uniqid(),
            'deskripsi' => 'Menu untuk pengujian galeri.',
            'harga' => 15000,
            'tersedia' => true,
            'jumlah_porsi' => 10,
            'kategori_id' => $kategori->id,
        ]);

        for ($i = 1; $i <= $jumlah; $i++) {
            $path = "masakans/foto-{$i}.jpg";
            Storage::disk('public')->put($path, 'gambar');
            $masakan->fotos()->create([
                'path' => $path,
                'urutan' => $i,
            ]);
        }

        $masakan->update([
            'foto' => $masakan->fotos()->orderBy('urutan')->value('path'),
        ]);

        return $masakan;
    }
}

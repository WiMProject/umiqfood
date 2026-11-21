<?php

namespace Tests\Feature;

use App\Models\Kategori;
use App\Models\Masakan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HeroMenuTest extends TestCase
{
    use RefreshDatabase;

    public function test_hero_menampilkan_semua_menu_dengan_foto_cover_dan_status_habis(): void
    {
        $kategori = Kategori::create([
            'nama' => 'Nasi & Lauk',
            'icon' => '🍚',
            'slug' => 'nasi-lauk-'.uniqid(),
        ]);

        $lama = $this->buatMenu($kategori, 'Menu Kemarin', true, 5, now()->subDay()->setTime(10, 0));

        $terbaru = $this->buatMenu(
            $kategori,
            'Menu Baru Hari Ini',
            true,
            8,
            now()->setTime(8, 0),
            'masakans/cover-baru.jpg',
        );
        $habis = $this->buatMenu($kategori, 'Menu Habis Hari Ini', true, 0, now()->setTime(9, 0));
        $nonaktif = $this->buatMenu($kategori, 'Menu Nonaktif Hari Ini', false, 3, now()->setTime(10, 0));

        $this->get(route('welcome'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('welcome')
                ->has('heroMasakans', 4)
                ->where('heroMasakans.0.id', $nonaktif->id)
                ->where('heroMasakans.0.tersedia', false)
                ->where('heroMasakans.1.id', $habis->id)
                ->where('heroMasakans.1.jumlah_porsi', 0)
                ->where('heroMasakans.2.id', $terbaru->id)
                ->where('heroMasakans.2.foto', 'masakans/cover-baru.jpg')
                ->where('heroMasakans.2.foto_url', asset('storage/masakans/cover-baru.jpg'))
                ->where('heroMasakans.3.id', $lama->id)
            );
    }

    private function buatMenu(
        Kategori $kategori,
        string $nama,
        bool $tersedia,
        int $porsi,
        Carbon $waktu,
        ?string $foto = null,
    ): Masakan {
        $masakan = Masakan::create([
            'nama' => $nama,
            'deskripsi' => 'Menu untuk pengujian kartu hero.',
            'harga' => 15000,
            'tersedia' => $tersedia,
            'jumlah_porsi' => $porsi,
            'kategori_id' => $kategori->id,
            'foto' => $foto,
        ]);

        $masakan->timestamps = false;
        $masakan->created_at = $waktu;
        $masakan->save();

        return $masakan;
    }
}

<?php

namespace Database\Seeders;

use App\Models\Kategori;
use App\Models\Masakan;
use Illuminate\Database\Seeder;

class MasakanSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(KategoriSeeder::class);

        /** @var array<string, int> $kategoris */
        $kategoris = Kategori::query()->pluck('id', 'slug')->all();

        $masakans = [
            [
                'nama' => 'Nasi Goreng Spesial Umiq',
                'deskripsi' => 'Nasi goreng racikan bumbu khas dengan suwiran ayam, telur mata sapi, dan acar.',
                'harga' => 18000,
                'tersedia' => true,
                'jumlah_porsi' => 18,
                'kategori_id' => $kategoris['nasi-lauk'],
            ],
            [
                'nama' => 'Ayam Geprek Sambal Korek',
                'deskripsi' => 'Ayam goreng krispi pedas nampol disajikan dengan lalapan.',
                'harga' => 15000,
                'tersedia' => true,
                'jumlah_porsi' => 16,
                'kategori_id' => $kategoris['nasi-lauk'],
            ],
            [
                'nama' => 'Nasi Ayam Kremes',
                'deskripsi' => 'Nasi hangat dengan ayam goreng kremes gurih, lalapan, dan sambal terasi.',
                'harga' => 17000,
                'tersedia' => true,
                'jumlah_porsi' => 12,
                'kategori_id' => $kategoris['nasi-lauk'],
            ],
            [
                'nama' => 'Nasi Rendang Daging',
                'deskripsi' => 'Rendang daging empuk berbalut rempah, disajikan dengan nasi hangat.',
                'harga' => 22000,
                'tersedia' => true,
                'jumlah_porsi' => 10,
                'kategori_id' => $kategoris['nasi-lauk'],
            ],
            [
                'nama' => 'Mie Goreng Jawa',
                'deskripsi' => 'Mie goreng bumbu Jawa dengan sayuran, telur, dan ayam suwir.',
                'harga' => 14000,
                'tersedia' => true,
                'jumlah_porsi' => 14,
                'kategori_id' => $kategoris['nasi-lauk'],
            ],
            [
                'nama' => 'Es Teh Manis Jumbo',
                'deskripsi' => 'Teh melati seduh segar dingin dengan porsi jumbo.',
                'harga' => 4000,
                'tersedia' => true,
                'jumlah_porsi' => 30,
                'kategori_id' => $kategoris['minuman'],
            ],
            [
                'nama' => 'Es Jeruk Segar',
                'deskripsi' => 'Perasan jeruk segar dengan es batu, manis asamnya pas.',
                'harga' => 6000,
                'tersedia' => true,
                'jumlah_porsi' => 24,
                'kategori_id' => $kategoris['minuman'],
            ],
            [
                'nama' => 'Kopi Tubruk Gula Aren',
                'deskripsi' => 'Kopi tubruk pekat dengan gula aren, disajikan hangat.',
                'harga' => 8000,
                'tersedia' => true,
                'jumlah_porsi' => 18,
                'kategori_id' => $kategoris['minuman'],
            ],
            [
                'nama' => 'Es Campur Umiq',
                'deskripsi' => 'Es campur buah, cincau, dan sirup merah yang segar.',
                'harga' => 12000,
                'tersedia' => true,
                'jumlah_porsi' => 12,
                'kategori_id' => $kategoris['minuman'],
            ],
            [
                'nama' => 'Tahu Crispy Sambal Kecap',
                'deskripsi' => 'Tahu goreng renyah dengan sambal kecap pedas manis.',
                'harga' => 8000,
                'tersedia' => true,
                'jumlah_porsi' => 20,
                'kategori_id' => $kategoris['camilan'],
            ],
            [
                'nama' => 'Pisang Goreng Keju',
                'deskripsi' => 'Pisang goreng hangat dengan topping keju dan susu kental manis.',
                'harga' => 10000,
                'tersedia' => true,
                'jumlah_porsi' => 15,
                'kategori_id' => $kategoris['camilan'],
            ],
            [
                'nama' => 'Kentang Goreng',
                'deskripsi' => 'Kentang goreng renyah dengan taburan garam dan saus.',
                'harga' => 12000,
                'tersedia' => true,
                'jumlah_porsi' => 18,
                'kategori_id' => $kategoris['camilan'],
            ],
            [
                'nama' => 'Singkong Goreng Sambal',
                'deskripsi' => 'Singkong goreng empuk dengan sambal terasi.',
                'harga' => 9000,
                'tersedia' => true,
                'jumlah_porsi' => 14,
                'kategori_id' => $kategoris['camilan'],
            ],
        ];

        foreach ($masakans as $menu) {
            Masakan::updateOrCreate(['nama' => $menu['nama']], $menu);
        }
    }
}

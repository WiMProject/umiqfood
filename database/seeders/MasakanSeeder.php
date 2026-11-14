<?php

namespace Database\Seeders;

use App\Models\Masakan;
use Illuminate\Database\Seeder;

class MasakanSeeder extends Seeder
{
    public function run(): void
    {
        $masakans = [
            [
                'nama' => 'Nasi Goreng Spesial Umiq',
                'deskripsi' => 'Nasi goreng racikan bumbu khas dengan suwiran ayam, telur mata sapi, dan acar.',
                'harga' => 18000,
                'tersedia' => true,
                'kategori_id' => 1,
            ],
            [
                'nama' => 'Ayam Geprek Sambal Korek',
                'deskripsi' => 'Ayam goreng krispi pedas nampol disajikan dengan lalapan.',
                'harga' => 15000,
                'tersedia' => true,
                'kategori_id' => 1,
            ],
            [
                'nama' => 'Es Teh Manis Jumbo',
                'deskripsi' => 'Teh melati seduh segar dingin dengan porsi jumbo.',
                'harga' => 4000,
                'tersedia' => true,
                'kategori_id' => 3,
            ],
        ];

        foreach ($masakans as $menu) {
            Masakan::updateOrCreate(['nama' => $menu['nama']], $menu);
        }
    }
}
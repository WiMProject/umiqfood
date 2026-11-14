<?php

namespace Database\Seeders;

use App\Models\Kategori;
use Illuminate\Database\Seeder;

class KategoriSeeder extends Seeder
{
    public function run(): void
    {
        $kategoris = [
            ['nama' => 'Nasi & Lauk', 'icon' => '🍚', 'slug' => 'nasi-lauk'],
            ['nama' => 'Minuman', 'icon' => '🥤', 'slug' => 'minuman'],
            ['nama' => 'Camilan', 'icon' => '🍟', 'slug' => 'camilan'],
        ];

        foreach ($kategoris as $kategori) {
            Kategori::updateOrCreate(['slug' => $kategori['slug']], $kategori);
        }
    }
}

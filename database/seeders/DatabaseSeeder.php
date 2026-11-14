<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
                //UserSeeder::class, udah ada jadi di komen biar ga duplikat
            KategoriSeeder::class,
            MasakanSeeder::class,
        ]);
    }
}
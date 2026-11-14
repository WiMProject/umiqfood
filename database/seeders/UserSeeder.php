<?php

namespace Database\Seeders;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'email' => 'umiqfood@admin.com',
            'name' => 'admin',
            'password' => Hash::make('umiqfood123'),
            'email_verified_at' => now(),
            'role' => 'admin'
        ]);

        User::create([
            'email' => 'umiqfood@user.com',
            'name' => 'user',
            'password' => Hash::make('umiqfood123'),
            'email_verified_at' => now(),
            'role' => 'user'
        ]);
    }
}

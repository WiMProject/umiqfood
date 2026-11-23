<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Profil toko yang tampil di halaman publik.
     */
    public function up(): void
    {
        Schema::create('pengaturan_tokos', function (Blueprint $table) {
            $table->id();
            $table->string('nama_toko', 100)->default('UmiqFood');
            $table->string('tagline', 150)->nullable();
            $table->text('alamat')->nullable();
            $table->string('jam_buka', 20)->nullable();
            $table->string('jam_tutup', 20)->nullable();
            $table->string('hari_tutup', 100)->nullable();
            $table->string('whatsapp', 30)->nullable();
            $table->string('instagram', 100)->nullable();
            $table->string('maps_url', 2048)->nullable();
            $table->text('catatan_pickup')->nullable();
            $table->text('catatan_pembayaran')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengaturan_tokos');
    }
};

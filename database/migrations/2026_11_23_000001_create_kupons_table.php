<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kupon diskon yang bisa dipakai pelanggan saat checkout.
     */
    public function up(): void
    {
        Schema::create('kupons', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 30)->unique();
            $table->string('nama', 100)->nullable();
            $table->string('tipe', 20); // persen, nominal
            $table->unsignedInteger('nilai');
            $table->unsignedInteger('min_subtotal')->default(0);
            $table->unsignedInteger('maks_diskon')->nullable();
            $table->unsignedInteger('kuota')->nullable();
            $table->unsignedInteger('maks_per_user')->default(1);
            $table->date('mulai')->nullable();
            $table->date('selesai')->nullable();
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['aktif', 'mulai', 'selesai']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kupons');
    }
};

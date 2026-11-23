<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Promo dan berita singkat untuk halaman utama.
     */
    public function up(): void
    {
        Schema::create('pengumumans', function (Blueprint $table) {
            $table->id();
            $table->string('judul', 150);
            $table->string('slug', 180)->unique();
            $table->string('jenis', 20)->default('promo'); // promo, info
            $table->string('ringkasan', 300)->nullable();
            $table->text('isi')->nullable();
            $table->string('gambar')->nullable();
            $table->foreignId('kupon_id')
                ->nullable()
                ->constrained('kupons')
                ->nullOnDelete();
            $table->date('mulai')->nullable();
            $table->date('selesai')->nullable();
            $table->boolean('aktif')->default(true);
            $table->unsignedInteger('urutan')->default(0);
            $table->timestamps();

            $table->index(['aktif', 'mulai', 'selesai']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengumumans');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('masakans', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 100);
            $table->text('deskripsi')->nullable();
            $table->unsignedInteger('harga');               // harga Rupiah
            $table->string('foto')->nullable();             // path file gambar
            $table->boolean('tersedia')->default(true);    // status stok ada/habis
            $table->foreignId('kategori_id')
                ->constrained('kategoris')
                ->onDelete('restrict');                   // cegah hapus kategori jika masih ada menu
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('masakans');
    }
};

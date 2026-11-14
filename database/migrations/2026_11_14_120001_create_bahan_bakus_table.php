<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bahan_bakus', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 100);
            $table->string('satuan', 20)->default('gram'); // gram, ml, pcs, dsb.
            $table->decimal('stok', 12, 2)->default(0);     // pasokan saat ini
            $table->decimal('stok_minimum', 12, 2)->default(0); // batas peringatan stok menipis
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bahan_bakus');
    }
};

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
        Schema::create('resep_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('masakan_id')
                ->constrained('masakans')
                ->cascadeOnDelete();
            $table->foreignId('bahan_baku_id')
                ->constrained('bahan_bakus')
                ->cascadeOnDelete();
            // Takaran bahan untuk 1 porsi masakan
            $table->decimal('jumlah', 12, 2);
            $table->timestamps();

            $table->unique(['masakan_id', 'bahan_baku_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resep_items');
    }
};
